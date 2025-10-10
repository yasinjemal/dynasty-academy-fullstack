import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Setting up community schema...')

  // Create default forum categories
  const categories = [
    {
      id: 'general',
      name: 'General Discussion',
      slug: 'general',
      description: 'General topics and community conversations',
      icon: '💬',
      color: '#8B5CF6',
      order: 1,
    },
    {
      id: 'learning',
      name: 'Learning & Education',
      slug: 'learning',
      description: 'Share knowledge, ask questions, and help others learn',
      icon: '📚',
      color: '#3B82F6',
      order: 2,
    },
    {
      id: 'showcase',
      name: 'Project Showcase',
      slug: 'showcase',
      description: 'Show off your projects and get feedback',
      icon: '🚀',
      color: '#10B981',
      order: 3,
    },
    {
      id: 'career',
      name: 'Career & Business',
      slug: 'career',
      description: 'Discuss career paths, business ideas, and entrepreneurship',
      icon: '💼',
      color: '#F59E0B',
      order: 4,
    },
    {
      id: 'tech',
      name: 'Technology & Tools',
      slug: 'tech',
      description: 'Talk about the latest tech, tools, and frameworks',
      icon: '⚡',
      color: '#EF4444',
      order: 5,
    },
    {
      id: 'support',
      name: 'Support & Help',
      slug: 'support',
      description: 'Get help with issues and technical problems',
      icon: '🆘',
      color: '#EC4899',
      order: 6,
    },
  ]

  for (const category of categories) {
    try {
      // Check if exists using raw SQL
      const existing = await prisma.$queryRaw`
        SELECT id FROM forum_categories WHERE slug = ${category.slug} LIMIT 1
      `

      if (existing.length === 0) {
        // Insert using raw SQL
        await prisma.$executeRaw`
          INSERT INTO forum_categories (id, name, slug, description, icon, color, "order", is_active, created_at, updated_at)
          VALUES (
            ${category.id},
            ${category.name},
            ${category.slug},
            ${category.description},
            ${category.icon},
            ${category.color},
            ${category.order},
            true,
            NOW(),
            NOW()
          )
        `
        console.log(`✅ Created category: ${category.name}`)
      } else {
        console.log(`⏭️  Category already exists: ${category.name}`)
      }
    } catch (error) {
      console.error(`❌ Error with ${category.name}:`, error.message)
    }
  }

  console.log('✨ Community setup complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
