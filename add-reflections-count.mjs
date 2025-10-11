import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addReflectionsCount() {
  try {
    console.log('Adding reflectionsCount column to user_progress table...')
    
    // Add the column with a default value
    await prisma.$executeRawUnsafe(`
      ALTER TABLE user_progress 
      ADD COLUMN IF NOT EXISTS reflections_count INTEGER NOT NULL DEFAULT 0;
    `)
    
    console.log('✅ reflections_count column added successfully!')
    
    // Create index for better performance
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_user_progress_reflections_count 
      ON user_progress(reflections_count);
    `)
    
    console.log('✅ Index created successfully!')
    console.log('✅ Migration complete!')
    
  } catch (error) {
    console.error('❌ Error during migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addReflectionsCount()
  .then(() => {
    console.log('🎉 Reward system schema updated!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
