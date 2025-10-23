import crypto from "crypto";

/**
 * 🎙️ COMMUNITY NARRATOR - TEXT NORMALIZATION & HASHING
 *
 * These functions ensure consistent paragraph identification across:
 * - Human narrations
 * - TTS cache lookups
 * - Content deduplication
 */

/**
 * Normalize text for hashing to ensure consistent matching
 * regardless of minor formatting differences.
 *
 * Steps:
 * 1. Unicode NFKC normalization
 * 2. Lowercase
 * 3. Remove punctuation and symbols
 * 4. Collapse whitespace
 * 5. Trim
 */
export function normalizeForHash(text: string): string {
  return text
    .normalize("NFKC") // Unicode normalization
    .toLowerCase() // Case insensitive
    .replace(/[^\p{L}\p{N}\s]/gu, "") // Remove punctuation/symbols, keep letters/numbers/spaces
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim(); // Trim edges
}

/**
 * Generate paragraph hash for text identification.
 * Used to match the same paragraph across narrations and TTS.
 *
 * @param paragraphText - The raw paragraph text
 * @returns SHA256 hash of normalized text
 */
export function getParagraphHash(paragraphText: string): string {
  const normalized = normalizeForHash(paragraphText);
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Generate content hash for deduplication.
 * Ensures uniqueness per (text + language + reading style).
 *
 * @param paragraphText - The raw paragraph text
 * @param language - Language code (e.g., "en")
 * @param readingStyle - Reading style (e.g., "neutral", "dramatic")
 * @returns SHA256 hash of normalized text + metadata
 */
export function getContentHash(
  paragraphText: string,
  language: string,
  readingStyle: string = "neutral"
): string {
  const normalized = normalizeForHash(paragraphText);
  const composite = `${normalized}|${language}|${readingStyle}`;
  return crypto.createHash("sha256").update(composite).digest("hex");
}

/**
 * Generate IP hash for play deduplication.
 * Prevents spam/fraud by deduplicating per IP+UA+day.
 *
 * @param ip - User IP address
 * @param userAgent - User agent string
 * @param date - Date (YYYY-MM-DD format)
 * @returns SHA256 hash for deduplication
 */
export function getIpHash(ip: string, userAgent: string, date: string): string {
  const composite = `${ip}|${userAgent}|${date}`;
  return crypto.createHash("sha256").update(composite).digest("hex");
}

/**
 * Generate file hash for duplicate detection.
 * Prevents users from uploading the same audio multiple times.
 *
 * @param buffer - Audio file buffer
 * @returns SHA256 hash of file contents
 */
export function getFileHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Get today's date in YYYY-MM-DD format for play deduplication.
 */
export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}
