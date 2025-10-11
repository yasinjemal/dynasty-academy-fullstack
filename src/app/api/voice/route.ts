/**
 * /api/voice - Professional TTS with Hash-Based Caching
 * 
 * Features:
 * - Content-based deduplication (sha256 hash)
 * - Supabase Storage for audio files
 * - Redis locking to prevent duplicate generation
 * - Cost optimization: First user pays, subsequent users get instant cache hits
 * 
 * Flow:
 * 1. Compute contentHash from (text + voiceId + model + rate + format)
 * 2. Check database for existing AudioAsset
 * 3. If found: Return cached URL immediately (FREE)
 * 4. If not found:
 *    a. Acquire Redis lock
 *    b. Generate with ElevenLabs (PAID)
 *    c. Upload to Supabase Storage
 *    d. Save to database
 *    e. Release lock
 *    f. Return new URL
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'
import {
  generateCacheKey,
  generateAudioWithElevenLabs,
  arrayBufferToBuffer,
} from '@/lib/audio/elevenlabs'
import { uploadAudioFile, getPublicUrl } from '@/lib/audio/storage'
import {
  acquireLock,
  releaseLock,
  waitForLock,
  checkLock,
} from '@/lib/audio/redis'

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse request body
    const body = await request.json()
    const {
      text,
      voiceId,
      bookId,
      chapterId,
      model = 'eleven_multilingual_v2',
      speakingRate = 1.0,
      format = 'mp3_44100_128',
    } = body

    // 3. Validate required fields
    if (!text || !voiceId || !bookId || !chapterId) {
      return NextResponse.json(
        { error: 'Missing required fields: text, voiceId, bookId, chapterId' },
        { status: 400 }
      )
    }

    // 4. Compute content hash
    const contentHash = generateCacheKey(text, voiceId, model, speakingRate, format)

    console.log('🎯 Voice request:', {
      bookId,
      chapterId,
      voiceId,
      textLength: text.length,
      contentHash: contentHash.substring(0, 16) + '...',
    })

    // 5. Check database cache
    const existingAsset = await prisma.audioAsset.findUnique({
      where: { contentHash },
    })

    if (existingAsset) {
      console.log('✅ Cache HIT - Serving existing audio (FREE)')

      // Update access metadata
      await prisma.audioAsset.update({
        where: { id: existingAsset.id },
        data: {
          metadata: {
            ...(existingAsset.metadata as any),
            lastAccessedAt: new Date().toISOString(),
            cacheHits: ((existingAsset.metadata as any)?.cacheHits || 0) + 1,
          },
        },
      })

      return NextResponse.json({
        url: getPublicUrl(existingAsset.storageUrl),
        duration: existingAsset.durationSec,
        wordCount: existingAsset.wordCount,
        reused: true,
        contentHash,
      })
    }

    console.log('❌ Cache MISS - Generating new audio (PAID)')

    // 6. Check if generation already in progress (Redis lock)
    const lockExists = await checkLock(contentHash)
    if (lockExists) {
      console.log('⏳ Generation in progress by another request - waiting...')

      // Wait up to 30 seconds for the other request to finish
      const lockReleased = await waitForLock(contentHash, 30)

      if (lockReleased) {
        // Check database again - the other request should have created it
        const newAsset = await prisma.audioAsset.findUnique({
          where: { contentHash },
        })

        if (newAsset) {
          console.log('✅ Audio ready from other request')
          return NextResponse.json({
            url: getPublicUrl(newAsset.storageUrl),
            duration: newAsset.durationSec,
            wordCount: newAsset.wordCount,
            reused: true,
            contentHash,
          })
        }
      } else {
        return NextResponse.json(
          { error: 'Audio generation timeout - please try again' },
          { status: 503 }
        )
      }
    }

    // 7. Acquire lock for this generation
    const lock = await acquireLock(contentHash)
    if (!lock.acquired) {
      return NextResponse.json(
        {
          error: 'Generation already in progress',
          retryAfter: lock.existingTTL,
        },
        { status: 429 }
      )
    }

    try {
      // 8. Generate audio with ElevenLabs
      console.log('🎙️ Generating audio with ElevenLabs...')
      const startTime = Date.now()

      const { audioBuffer, duration, wordCount } =
        await generateAudioWithElevenLabs({
          text,
          voiceId,
          model,
          speakingRate,
        })

      const generationTime = Date.now() - startTime
      console.log(`✅ Audio generated in ${generationTime}ms`)

      // 9. Upload to Supabase Storage
      console.log('☁️ Uploading to Supabase Storage...')
      const uploadStartTime = Date.now()

      const { path, publicUrl, size } = await uploadAudioFile(
        bookId,
        contentHash,
        audioBuffer
      )

      const uploadTime = Date.now() - uploadStartTime
      console.log(`✅ Uploaded to ${path} (${(size / 1024).toFixed(2)}KB) in ${uploadTime}ms`)

      // 10. Save to database
      const audioAsset = await prisma.audioAsset.create({
        data: {
          bookId,
          chapterId,
          contentHash,
          voiceId,
          model,
          speakingRate,
          format,
          storageUrl: path,
          durationSec: duration,
          wordCount,
          metadata: {
            generatedAt: new Date().toISOString(),
            generationTimeMs: generationTime,
            uploadTimeMs: uploadTime,
            fileSizeBytes: size,
            cacheHits: 0,
          },
        },
      })

      console.log('✅ AudioAsset saved to database')

      // 11. Release lock
      await releaseLock(contentHash)

      // 12. Return response
      return NextResponse.json({
        url: publicUrl,
        duration,
        wordCount,
        reused: false,
        contentHash,
        stats: {
          generationTime: `${generationTime}ms`,
          uploadTime: `${uploadTime}ms`,
          fileSize: `${(size / 1024).toFixed(2)}KB`,
        },
      })
    } catch (error) {
      // Release lock on error
      await releaseLock(contentHash)
      throw error
    }
  } catch (error: any) {
    console.error('❌ Voice API error:', error)

    return NextResponse.json(
      {
        error: error.message || 'Failed to generate audio',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/voice?contentHash=xxx
 * Retrieve audio by content hash
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentHash = searchParams.get('contentHash')

    if (!contentHash) {
      return NextResponse.json(
        { error: 'Missing contentHash parameter' },
        { status: 400 }
      )
    }

    const audioAsset = await prisma.audioAsset.findUnique({
      where: { contentHash },
    })

    if (!audioAsset) {
      return NextResponse.json({ error: 'Audio not found' }, { status: 404 })
    }

    return NextResponse.json({
      url: getPublicUrl(audioAsset.storageUrl),
      duration: audioAsset.durationSec,
      wordCount: audioAsset.wordCount,
      voiceId: audioAsset.voiceId,
      model: audioAsset.model,
      speakingRate: audioAsset.speakingRate,
    })
  } catch (error: any) {
    console.error('❌ Voice GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
