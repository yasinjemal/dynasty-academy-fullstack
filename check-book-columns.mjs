import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking books table columns...\n')
  
  try {
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'books' 
      ORDER BY ordinal_position
    `
    
    console.log('All columns in books table:')
    console.table(columns)
    
    console.log('\n📌 Looking for totalPages/previewPages columns:')
    const relevantColumns = columns.filter(c => 
      c.column_name.toLowerCase().includes('page') || 
      c.column_name.toLowerCase().includes('total') ||
      c.column_name.toLowerCase().includes('preview')
    )
    console.table(relevantColumns)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
