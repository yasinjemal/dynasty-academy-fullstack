/**
 * ElevenLabs TTS Integration
 * Professional audio generation with caching
 */

import crypto from 'crypto'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1'

export interface TTSOptions {
  text: string
  voiceId: string
  model?: string
  speakingRate?: number
  stability?: number
  similarityBoost?: number
}

export interface TTSResponse {
  audioBuffer: ArrayBuffer
  duration: number
  wordCount: number
}

/**
 * Generate cache key from content and parameters
 * This ensures identical content always gets the same hash
 */
export function generateCacheKey(
  text: string,
  voiceId: string,
  model: string = 'eleven_multilingual_v2',
  speakingRate: number = 1.0,
  format: string = 'mp3_44100_128'
): string {
  const content = `${text}|${voiceId}|${model}|${speakingRate}|${format}`
  return crypto.createHash('sha256').update(content).digest('hex')
}

/**
 * Call ElevenLabs TTS API
 */
export async function generateAudioWithElevenLabs(
  options: TTSOptions
): Promise<TTSResponse> {
  const {
    text,
    voiceId,
    model = 'eleven_multilingual_v2',
    speakingRate = 1.0,
    stability = 0.5,
    similarityBoost = 0.75,
  } = options

  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not configured')
  }

  // Clean text: remove HTML tags, normalize whitespace
  const cleanText = text
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const wordCount = cleanText.split(/\s+/).length

  // Call ElevenLabs API
  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: model,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`)
  }

  const audioBuffer = await response.arrayBuffer()

  // Estimate duration (rough calculation: ~150 words per minute)
  const estimatedDuration = (wordCount / 150) * 60

  return {
    audioBuffer,
    duration: estimatedDuration,
    wordCount,
  }
}

/**
 * Get audio file size in bytes
 */
export function getAudioSize(buffer: ArrayBuffer): number {
  return buffer.byteLength
}

/**
 * Convert ArrayBuffer to Base64
 */
export function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return Buffer.from(binary, 'binary').toString('base64')
}

/**
 * Convert ArrayBuffer to Buffer (for Node.js)
 */
export function arrayBufferToBuffer(arrayBuffer: ArrayBuffer): Buffer {
  return Buffer.from(arrayBuffer)
}

/**
 * Calculate actual audio duration from MP3 buffer
 * This is a simplified version - for production, use a proper MP3 parser
 */
export function calculateAudioDuration(buffer: ArrayBuffer): number {
  // Rough estimation based on file size and bitrate
  // 128kbps = 16KB/sec, so duration = fileSize / 16000
  const fileSize = buffer.byteLength
  const estimatedDuration = fileSize / 16000
  return estimatedDuration
}
