import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createReflectionsTable() {
  try {
    console.log('Creating book_reflections table...')
    
    // Create the table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS book_reflections (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        book_id TEXT NOT NULL,
        chapter_number INTEGER NOT NULL DEFAULT 1,
        content TEXT NOT NULL,
        is_public BOOLEAN NOT NULL DEFAULT true,
        community_post_id TEXT UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        
        CONSTRAINT fk_book_reflections_user 
          FOREIGN KEY (user_id) 
          REFERENCES users(id) 
          ON DELETE CASCADE,
        
        CONSTRAINT fk_book_reflections_book 
          FOREIGN KEY (book_id) 
          REFERENCES books(id) 
          ON DELETE CASCADE,
        
        CONSTRAINT fk_book_reflections_community_post 
          FOREIGN KEY (community_post_id) 
          REFERENCES forum_topics(id) 
          ON DELETE SET NULL
      );
    `)
    
    console.log('✅ Table created successfully!')
    
    // Create indexes
    console.log('Creating indexes...')
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_book_reflections_user_id ON book_reflections(user_id);
    `)
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_book_reflections_book_id ON book_reflections(book_id);
    `)
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_book_reflections_chapter_number ON book_reflections(chapter_number);
    `)
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_book_reflections_created_at ON book_reflections(created_at);
    `)
    
    console.log('✅ Indexes created successfully!')
    console.log('✅ book_reflections table is ready!')
    
  } catch (error) {
    console.error('❌ Error creating table:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createReflectionsTable()
  .then(() => {
    console.log('🎉 Migration complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
