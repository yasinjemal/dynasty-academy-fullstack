import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { slug } = await params
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get book by slug
    const book = await prisma.book.findUnique({
      where: { slug }
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    const { chapterNumber, content, voiceId = 'EXAVITQu4vr4xnSDxMaL' } = await req.json()

    const chapterId = `chapter-${chapterNumber}`

    // Check if audio already exists in AudioAsset table
    const existingAudio = await prisma.audioAsset.findFirst({
      where: {
        bookId: book.id,
        chapterId,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (existingAudio) {
      return NextResponse.json({
        success: true,
        audioUrl: existingAudio.storageUrl,
        cached: true
      })
    }

    // Strip HTML tags from content
    const cleanText = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

    // Generate audio with ElevenLabs
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`)
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer()
    const audioBase64 = Buffer.from(audioBuffer).toString('base64')
    
    // Store as base64 data URL (for now - in production should upload to Supabase Storage)
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`

    const wordCount = cleanText.split(/\s+/).length
    const estimatedDuration = (wordCount / 150) * 60 // ~150 words per minute

    // Save to database using AudioAsset model
    const bookAudio = await prisma.audioAsset.create({
      data: {
        bookId: book.id,
        chapterId: `chapter-${chapterNumber}`,
        contentHash: `simple-${book.id}-${chapterNumber}-${voiceId}`, // Simple hash for now
        voiceId,
        model: 'eleven_multilingual_v2',
        speakingRate: 1.0,
        format: 'mp3_44100_128',
        storageUrl: audioUrl,
        durationSec: estimatedDuration,
        wordCount,
        metadata: {
          generatedAt: new Date().toISOString(),
          wordCount,
          chapterNumber,
          bookTitle: book.title,
        }
      }
    })

    return NextResponse.json({
      success: true,
      audioUrl: bookAudio.storageUrl,
      cached: false
    })
  } catch (error) {
    console.error('Audio generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    )
  }
}

// Get audio for a chapter
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(req.url)
    const chapterNumber = parseInt(searchParams.get('chapter') || '1')

    // Get book by slug
    const book = await prisma.book.findUnique({
      where: { slug }
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    const chapterId = `chapter-${chapterNumber}`
    
    const audio = await prisma.audioAsset.findFirst({
      where: {
        bookId: book.id,
        chapterId,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!audio) {
      return NextResponse.json(
        { error: 'Audio not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      audioUrl: audio.storageUrl,
      duration: audio.durationSec,
    })
  } catch (error) {
    console.error('Audio fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audio' },
      { status: 500 }
    )
  }
}
