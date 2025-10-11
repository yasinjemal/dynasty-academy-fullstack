import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Setting up reflections feature...')

  try {
    // Create the reflections table if it doesn't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS reflections (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        is_public BOOLEAN DEFAULT false NOT NULL,
        user_id TEXT NOT NULL,
        book_id TEXT NOT NULL,
        forum_topic_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (forum_topic_id) REFERENCES forum_topics(id) ON DELETE SET NULL
      )
    `

    console.log('✅ Created reflections table')

    // Create indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON reflections(user_id)
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_reflections_book_id ON reflections(book_id)
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_reflections_chapter ON reflections(chapter)
    `

    console.log('✅ Created indexes')

    console.log('✨ Reflections feature setup complete!')
  } catch (error) {
    console.error('❌ Error setting up reflections:', error.message)
    throw error
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
