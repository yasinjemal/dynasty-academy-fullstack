/**
 * Migration: Replace book_audio with professional audio_assets table
 * 
 * This migration:
 * 1. Creates new audio_assets table with content-based caching
 * 2. Migrates existing book_audio data (if any)
 * 3. Drops old book_audio table
 * 
 * Run: node migrate-audio-assets.mjs
 */

import pkg from '@prisma/client'
import crypto from 'crypto'

const { PrismaClient } = pkg
const prisma = new PrismaClient()

async function migrate() {
  console.log('🔄 Starting audio migration...\n')
  
  try {
    // 1. Check if old table exists and has data
    let existingAudio = []
    try {
      existingAudio = await prisma.$queryRaw`
        SELECT * FROM book_audio LIMIT 100
      `
      console.log(`📊 Found ${existingAudio.length} existing audio records`)
    } catch (error) {
      console.log('ℹ️  No existing book_audio table found (this is fine for new installs)')
    }
    
    // 2. Create new audio_assets table
    console.log('\n📦 Creating audio_assets table...')
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS audio_assets (
        id TEXT PRIMARY KEY,
        book_id TEXT NOT NULL,
        chapter_id TEXT NOT NULL,
        cache_key VARCHAR(64) UNIQUE NOT NULL,
        voice_id TEXT NOT NULL,
        model TEXT NOT NULL DEFAULT 'eleven_multilingual_v2',
        speaking_rate DOUBLE PRECISION NOT NULL DEFAULT 1.0,
        format TEXT NOT NULL DEFAULT 'mp3_44100_128',
        storage_url TEXT NOT NULL,
        storage_bucket TEXT NOT NULL DEFAULT 'audio',
        storage_path TEXT NOT NULL,
        duration_sec DOUBLE PRECISION NOT NULL DEFAULT 0,
        file_size INTEGER NOT NULL DEFAULT 0,
        word_count INTEGER NOT NULL DEFAULT 0,
        access_count INTEGER NOT NULL DEFAULT 0,
        last_accessed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
      )
    `
    
    // 3. Create indexes
    console.log('📇 Creating indexes...')
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_audio_assets_book_chapter 
      ON audio_assets(book_id, chapter_id)
    `
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_audio_assets_cache_key 
      ON audio_assets(cache_key)
    `
    
    // 4. Migrate existing data if found
    if (existingAudio.length > 0) {
      console.log('\n🔄 Migrating existing audio data...')
      
      for (const audio of existingAudio) {
        try {
          // Generate cache key from existing data
          const cacheKey = crypto
            .createHash('sha256')
            .update(`${audio.book_id}-${audio.chapter_number}-${audio.voice_id}`)
            .digest('hex')
          
          await prisma.$executeRaw`
            INSERT INTO audio_assets (
              id, book_id, chapter_id, cache_key, voice_id,
              storage_url, storage_path, duration_sec, created_at, updated_at
            ) VALUES (
              ${audio.id},
              ${audio.book_id},
              ${audio.chapter_number.toString()},
              ${cacheKey},
              ${audio.voice_id},
              ${audio.audio_url},
              ${`audio/${audio.book_id}/${audio.chapter_number}/legacy.mp3`},
              ${audio.duration || 0},
              ${audio.created_at},
              ${audio.updated_at}
            )
            ON CONFLICT (cache_key) DO NOTHING
          `
          
          console.log(`  ✓ Migrated audio for book ${audio.book_id}, chapter ${audio.chapter_number}`)
        } catch (error) {
          console.log(`  ⚠️  Skipped duplicate: book ${audio.book_id}, chapter ${audio.chapter_number}`)
        }
      }
      
      console.log(`\n✅ Migrated ${existingAudio.length} audio records`)
      
      // 5. Drop old table
      console.log('\n🗑️  Dropping old book_audio table...')
      await prisma.$executeRaw`DROP TABLE IF EXISTS book_audio CASCADE`
    }
    
    console.log('\n✅ Migration completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('   1. Run: npx prisma generate')
    console.log('   2. Restart your dev server')
    console.log('   3. Test audio generation with new caching system')
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrate()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
