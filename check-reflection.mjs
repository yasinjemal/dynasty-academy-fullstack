import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkReflection() {
  const reflectionId = 'cmgmjennf0010uyz47dzst0aq'
  
  console.log('Checking reflection:', reflectionId)
  
  const reflection = await prisma.bookReflection.findFirst({
    where: { id: reflectionId },
    select: {
      id: true,
      content: true,
      isPublic: true,
      communityPostId: true,
      user: {
        select: {
          name: true,
        },
      },
      book: {
        select: {
          title: true,
        },
      },
    },
  })

  if (!reflection) {
    console.log('❌ Reflection not found!')
  } else {
    console.log('✅ Reflection found:')
    console.log('- User:', reflection.user.name)
    console.log('- Book:', reflection.book.title)
    console.log('- Public:', reflection.isPublic)
    console.log('- Has community post:', !!reflection.communityPostId)
    console.log('- Content:', reflection.content.substring(0, 100) + '...')
  }

  await prisma.$disconnect()
}

checkReflection()
