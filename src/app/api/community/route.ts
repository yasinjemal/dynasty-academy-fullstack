import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET /api/community - Fetch all categories with stats
export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.forumCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            topics: true,
          },
        },
      },
    })

    // Simply map categories (post counts can be calculated later if needed)
    const categoriesWithStats = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
      topicCount: category._count.topics,
      postCount: 0, // Simplified to avoid connection pool issues
    }))

    // Get overall stats
    const [totalTopics, totalPosts, totalUsers] = await Promise.all([
      prisma.forumTopic.count(),
      prisma.forumPost.count(),
      prisma.user.count(), // Total users (simplified)
    ])

    return NextResponse.json({
      categories: categoriesWithStats,
      stats: {
        totalTopics,
        totalPosts,
        activeUsers: totalUsers,
      },
    })
  } catch (error) {
    console.error('Error fetching community data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch community data' },
      { status: 500 }
    )
  }
}
