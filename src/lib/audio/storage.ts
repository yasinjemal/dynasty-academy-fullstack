/**
 * Supabase Storage Integration
 * Manages audio file uploads and retrieval
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase credentials not configured - audio storage will fail')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const AUDIO_BUCKET = 'audio'

export interface UploadResult {
  path: string
  publicUrl: string
  size: number
}

/**
 * Upload audio file to Supabase Storage
 * Path format: audio/{bookId}/{contentHash}.mp3
 */
export async function uploadAudioFile(
  bookId: string,
  contentHash: string,
  audioBuffer: ArrayBuffer
): Promise<UploadResult> {
  const fileName = `${contentHash}.mp3`
  const filePath = `${bookId}/${fileName}`

  // Convert ArrayBuffer to Uint8Array
  const fileData = new Uint8Array(audioBuffer)

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(filePath, fileData, {
      contentType: 'audio/mpeg',
      cacheControl: '31536000', // Cache for 1 year (immutable content)
      upsert: false, // Don't overwrite if exists
    })

  if (error) {
    // If file already exists, that's OK (it means another request beat us to it)
    if (error.message.includes('already exists')) {
      console.log(`✅ Audio file already exists: ${filePath}`)
      const publicUrl = getPublicUrl(filePath)
      return {
        path: filePath,
        publicUrl,
        size: audioBuffer.byteLength,
      }
    }
    throw new Error(`Supabase upload error: ${error.message}`)
  }

  const publicUrl = getPublicUrl(data.path)

  return {
    path: data.path,
    publicUrl,
    size: audioBuffer.byteLength,
  }
}

/**
 * Get public URL for an audio file
 */
export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Check if audio file exists in storage
 */
export async function audioFileExists(
  bookId: string,
  contentHash: string
): Promise<boolean> {
  const filePath = `${bookId}/${contentHash}.mp3`

  const { data, error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .list(bookId, {
      search: `${contentHash}.mp3`,
    })

  if (error) {
    console.error('Error checking file existence:', error)
    return false
  }

  return data.length > 0
}

/**
 * Delete audio file from storage (admin only)
 */
export async function deleteAudioFile(
  bookId: string,
  contentHash: string
): Promise<void> {
  const filePath = `${bookId}/${contentHash}.mp3`

  const { error } = await supabase.storage.from(AUDIO_BUCKET).remove([filePath])

  if (error) {
    throw new Error(`Failed to delete audio file: ${error.message}`)
  }
}

/**
 * Get storage bucket info
 */
export async function getBucketInfo() {
  const { data, error } = await supabase.storage.getBucket(AUDIO_BUCKET)

  if (error) {
    throw new Error(`Failed to get bucket info: ${error.message}`)
  }

  return data
}

/**
 * Initialize storage bucket (run once during setup)
 * Creates bucket if it doesn't exist
 */
export async function initializeAudioBucket() {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`)
    }

    const bucketExists = buckets.some((b) => b.name === AUDIO_BUCKET)

    if (bucketExists) {
      console.log(`✅ Audio bucket already exists: ${AUDIO_BUCKET}`)
      return
    }

    // Create bucket
    const { data, error } = await supabase.storage.createBucket(AUDIO_BUCKET, {
      public: true, // Allow public read access
      fileSizeLimit: 10485760, // 10MB limit per file
      allowedMimeTypes: ['audio/mpeg', 'audio/mp3'],
    })

    if (error) {
      throw new Error(`Failed to create bucket: ${error.message}`)
    }

    console.log(`✅ Created audio bucket: ${AUDIO_BUCKET}`)
  } catch (error) {
    console.error('❌ Failed to initialize audio bucket:', error)
    throw error
  }
}
