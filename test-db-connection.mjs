// Test Supabase connection
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...')
    console.log('📍 Connection string:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'))
    
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('📊 Database version:', result)
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    console.log('\n💡 Troubleshooting tips:')
    console.log('1. Check if your Supabase project is active (not paused)')
    console.log('2. Verify your password is correct')
    console.log('3. Get the connection string from: Supabase Dashboard → Settings → Database → Connection string')
    process.exit(1)
  }
}

testConnection()
