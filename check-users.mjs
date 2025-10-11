import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
      take: 10
    })

    console.log('\n📊 Users in database:')
    console.log('='.repeat(50))
    
    if (users.length === 0) {
      console.log('❌ No users found in database')
      console.log('\nℹ️  You need to create a user account first.')
      console.log('   Visit: http://localhost:3001/register')
    } else {
      console.log(`✅ Found ${users.length} user(s):\n`)
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'No Name'}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   Created: ${user.createdAt.toLocaleDateString()}`)
        console.log(`   Profile URL: http://localhost:3001/u/${encodeURIComponent(user.name || user.email)}`)
        console.log()
      })
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
