// Make a user ADMIN
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function makeAdmin() {
  try {
    const email = 'yasinyutbr@gmail.com' // Change this to your email
    
    console.log(`🔍 Looking for user: ${email}`)
    
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log('❌ User not found. Please register first.')
      return
    }
    
    console.log(`✅ Found user: ${user.name}`)
    console.log(`   Current role: ${user.role}`)
    
    if (user.role === 'ADMIN') {
      console.log('✅ User is already an ADMIN!')
      return
    }
    
    console.log('📝 Updating user to ADMIN...')
    
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    })
    
    console.log('🎉 Success! User is now an ADMIN!')
    console.log(`   Name: ${updatedUser.name}`)
    console.log(`   Email: ${updatedUser.email}`)
    console.log(`   Role: ${updatedUser.role}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin()
