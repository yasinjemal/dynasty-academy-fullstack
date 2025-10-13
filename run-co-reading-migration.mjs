#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting Co-Reading Tables Migration...\n')
  
  try {
    // Read the SQL file
    const sql = fs.readFileSync('./add-co-reading-tables.sql', 'utf-8')
    
    // Split by DO $$ blocks (each table creation is one block)
    const blocks = sql.split(/DO \$\$/).filter(b => b.trim().length > 0)
    
    console.log(`📝 Found ${blocks.length - 1} table creation blocks to execute\n`)
    
    const tableNames = ['reading_presence', 'page_chats', 'page_reactions', 'co_reading_analytics']
    
    for (let i = 1; i < blocks.length; i++) {
      const block = 'DO $$' + blocks[i]
      const tableName = tableNames[i - 1] || `table_${i}`
      
      console.log(`⚡ Creating table: ${tableName}...`)
      
      try {
        await prisma.$executeRawUnsafe(block)
        console.log(`✅ Success: ${tableName}\n`)
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Already exists: ${tableName}\n`)
        } else {
          console.error(`❌ Error with ${tableName}:`, error.message)
          throw error
        }
      }
    }
    
    console.log('\n🎉 Migration completed successfully!')
    console.log('\n📊 Verifying tables...\n')
    
    // Verify tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('reading_presence', 'page_chats', 'page_reactions', 'co_reading_analytics')
      ORDER BY table_name
    `
    
    console.log('✅ Tables found in database:')
    tables.forEach(t => console.log(`   • ${t.table_name}`))
    
    console.log('\n💾 Database is ready for production co-reading features!')
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
