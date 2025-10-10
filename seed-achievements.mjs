// Seed achievements for gamification
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const achievements = [
  {
    name: 'Early Adopter',
    description: 'Join Dynasty Built Academy',
    icon: '🌟',
    points: 50,
    requirement: JSON.stringify({ type: 'signup' }),
  },
  {
    name: 'First Purchase',
    description: 'Make your first book purchase',
    icon: '🛒',
    points: 100,
    requirement: JSON.stringify({ type: 'orders', count: 1 }),
  },
  {
    name: 'First Post',
    description: 'Write your first blog post',
    icon: '✍️',
    points: 200,
    requirement: JSON.stringify({ type: 'blog_posts', count: 1 }),
  },
  {
    name: 'Book Lover',
    description: 'Purchase 5 books',
    icon: '📚',
    points: 500,
    requirement: JSON.stringify({ type: 'orders', count: 5 }),
  },
  {
    name: 'Comment King',
    description: 'Leave 100 comments',
    icon: '💬',
    points: 800,
    requirement: JSON.stringify({ type: 'comments', count: 100 }),
  },
  {
    name: 'Avid Reader',
    description: 'Purchase 10 books',
    icon: '📖',
    points: 1000,
    requirement: JSON.stringify({ type: 'orders', count: 10 }),
  },
  {
    name: 'Like Master',
    description: 'Receive 100 likes on your content',
    icon: '❤️',
    points: 1200,
    requirement: JSON.stringify({ type: 'likes_received', count: 100 }),
  },
  {
    name: 'Social Butterfly',
    description: 'Get 50 followers',
    icon: '🦋',
    points: 1500,
    requirement: JSON.stringify({ type: 'followers', count: 50 }),
  },
  {
    name: 'Prolific Writer',
    description: 'Write 10 blog posts',
    icon: '📝',
    points: 2000,
    requirement: JSON.stringify({ type: 'blog_posts', count: 10 }),
  },
  {
    name: 'Loyal Member',
    description: 'Active for 30 days',
    icon: '🎖️',
    points: 3000,
    requirement: JSON.stringify({ type: 'days_active', count: 30 }),
  },
]

async function main() {
  console.log('🎯 Seeding achievements...')
  
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement,
    })
    console.log(`✅ ${achievement.name}`)
  }
  
  console.log('✨ Achievements seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding achievements:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
