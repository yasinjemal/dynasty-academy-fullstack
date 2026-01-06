import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createBookAudioTable() {
  console.log('🔄 Creating book_audio table...')

  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS book_audio (
        id TEXT PRIMARY KEY,
        book_id TEXT NOT NULL,
        chapter_number INTEGER NOT NULL,
        audio_url TEXT NOT NULL,
        voice_id TEXT NOT NULL,
        duration DOUBLE PRECISION DEFAULT 0,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT book_audio_book_id_chapter_number_key UNIQUE (book_id, chapter_number)
      );
    `

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS book_audio_book_id_idx ON book_audio(book_id);
    `

    console.log('✅ book_audio table created successfully!')
    console.log('')
    console.log('📋 Summary:')
    console.log('  - Store ElevenLabs generated audio URLs')
    console.log('  - Cache audio per chapter to avoid regeneration')
    console.log('  - Track voice_id for voice consistency')
    console.log('')
    console.log('Next steps:')
    console.log('  1. Add ELEVENLABS_API_KEY to .env')
    console.log('  2. Sign up: https://elevenlabs.io')
    console.log('  3. Get API key from dashboard')
    console.log('  4. Test Listen Mode in book reader')
    console.log('  5. Cost: ~R10-R20 per book')
    console.log('')
  } catch (error) {
    if (error.code === '42P07') {
      console.log('✅ book_audio table already exists')
    } else {
      console.error('❌ Error:', error)
      throw error
    }
  } finally {
    await prisma.$disconnect()
  }
}

createBookAudioTable()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
