import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Starting schema update...')

  try {
    // Check if columns exist before adding them
    console.log('✅ Adding totalPages and previewPages columns to books table...')
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE books 
      ADD COLUMN IF NOT EXISTS total_pages INTEGER,
      ADD COLUMN IF NOT EXISTS preview_pages INTEGER;
    `)

    console.log('✅ Columns added successfully!')

    // Count books
    const bookCount = await prisma.book.count()
    console.log(`📚 Total books in database: ${bookCount}`)

    console.log('✅ Schema update completed!')
  } catch (error) {
    console.error('❌ Error updating schema:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
