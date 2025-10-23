/**
 * 🎙️ COMMUNITY NARRATOR - AUDIO QUALITY & ASR VALIDATION
 *
 * This service validates uploaded narrations through:
 * 1. ASR (Automatic Speech Recognition) - transcribe and verify
 * 2. Quality scoring - SNR, silence, clipping detection
 * 3. Word Error Rate - compare against canonical text
 */

import { normalizeForHash } from "./textNormalization";

export interface ASRResult {
  transcript: string;
  confidence: number; // 0-1
  wordErrorRate: number; // 0-1
}

export interface QualityResult {
  qualityScore: number; // 0-1 composite
  snr: number; // Signal-to-noise ratio
  silenceRatio: number; // % of audio that's silence
  clippingScore: number; // 0-1, lower is better
}

/**
 * Transcribe audio and compare against expected text.
 *
 * @param audioBuffer - Audio file buffer
 * @param expectedText - The paragraph the user was supposed to read
 * @returns ASR results with transcript, confidence, and WER
 */
export async function transcribeAndValidate(
  audioBuffer: Buffer,
  expectedText: string
): Promise<ASRResult> {
  // TODO: Integrate with ASR service (OpenAI Whisper, Google Speech-to-Text, etc.)
  // For MVP, we'll return mock data

  // In production, call ASR API:
  // const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
  //   body: formData with audio
  // });
  // const { text } = await response.json();

  // Mock transcript (in production, this comes from ASR)
  const transcript = expectedText; // Placeholder
  const confidence = 0.95; // Placeholder

  // Calculate Word Error Rate
  const wer = calculateWordErrorRate(transcript, expectedText);

  return {
    transcript,
    confidence,
    wordErrorRate: wer,
  };
}

/**
 * Calculate Word Error Rate (WER) between transcript and expected text.
 * Uses Levenshtein distance at word level.
 *
 * WER = (Substitutions + Deletions + Insertions) / Total Words in Reference
 *
 * @param transcript - ASR-generated transcript
 * @param reference - Expected/canonical text
 * @returns WER score (0 = perfect match, 1 = completely different)
 */
function calculateWordErrorRate(transcript: string, reference: string): number {
  // Normalize both texts
  const transcriptWords = normalizeForHash(transcript)
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const referenceWords = normalizeForHash(reference)
    .split(/\s+/)
    .filter((w) => w.length > 0);

  if (referenceWords.length === 0) return 1.0;

  // Levenshtein distance at word level
  const distance = levenshteinDistance(transcriptWords, referenceWords);

  return Math.min(1.0, distance / referenceWords.length);
}

/**
 * Levenshtein distance algorithm for word arrays.
 */
function levenshteinDistance(arr1: string[], arr2: string[]): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= arr1.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= arr2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= arr1.length; i++) {
    for (let j = 1; j <= arr2.length; j++) {
      const cost = arr1[i - 1] === arr2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[arr1.length][arr2.length];
}

/**
 * Analyze audio quality metrics.
 *
 * @param audioBuffer - Audio file buffer
 * @returns Quality metrics (composite score, SNR, silence, clipping)
 */
export async function analyzeAudioQuality(
  audioBuffer: Buffer
): Promise<QualityResult> {
  // TODO: Integrate with audio analysis library (e.g., ffmpeg, web-audio-api)
  // For MVP, we'll return mock data based on file size heuristics

  // In production, analyze audio:
  // - Decode audio to PCM samples
  // - Calculate RMS (Root Mean Square) for loudness
  // - Detect silence (samples below threshold)
  // - Detect clipping (samples at max amplitude)
  // - Estimate SNR (signal power vs noise floor)

  // Mock quality metrics (in production, calculate from actual audio)
  const sizeKB = audioBuffer.length / 1024;

  // Heuristic: larger files tend to have better quality (less compression)
  const qualityScore = Math.min(1.0, 0.5 + sizeKB / 1000);

  return {
    qualityScore: Math.max(0.6, qualityScore), // Mock: 0.6-1.0 range
    snr: 25, // Mock: 25 dB SNR (good quality)
    silenceRatio: 0.05, // Mock: 5% silence (acceptable)
    clippingScore: 0.01, // Mock: 1% clipping (minimal)
  };
}

/**
 * Moderate transcript for policy violations.
 * Returns true if content passes moderation.
 *
 * @param transcript - ASR-generated transcript
 * @returns true if clean, false if violates policy
 */
export async function moderateTranscript(transcript: string): Promise<boolean> {
  // TODO: Integrate with content moderation API (OpenAI Moderation, etc.)
  // For MVP, basic keyword filtering

  const profanityList = [
    // Add profanity/harmful keywords here
    // In production, use comprehensive moderation API
  ];

  const lowerTranscript = transcript.toLowerCase();

  for (const word of profanityList) {
    if (lowerTranscript.includes(word)) {
      return false; // Policy violation
    }
  }

  // In production, call moderation API:
  // const response = await fetch('https://api.openai.com/v1/moderations', {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
  //   body: JSON.stringify({ input: transcript })
  // });
  // const { results } = await response.json();
  // return !results[0].flagged;

  return true; // Pass by default in MVP
}

/**
 * Auto-approve decision logic.
 * Returns true if narration should be auto-approved.
 *
 * Criteria:
 * - ASR confidence ≥ 0.92
 * - Word Error Rate ≤ 0.18
 * - Quality score ≥ 0.7
 * - Passes policy moderation
 */
export function shouldAutoApprove(
  asrResult: ASRResult,
  qualityResult: QualityResult,
  policyClean: boolean
): boolean {
  return (
    asrResult.confidence >= 0.92 &&
    asrResult.wordErrorRate <= 0.18 &&
    qualityResult.qualityScore >= 0.7 &&
    policyClean
  );
}
