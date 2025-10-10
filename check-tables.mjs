import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkTables() {
  const tables = await prisma.$queryRaw`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename LIKE '%ser%'
  `
  console.log('User-related tables:', tables)
  
  await prisma.$disconnect()
}

checkTables()
