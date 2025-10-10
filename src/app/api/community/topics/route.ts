import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// GET /api/community/topics - Fetch recent topics with filters
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const categorySlug = searchParams.get('category')
    const sortBy = searchParams.get('sortBy') || 'latest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (categorySlug) {
      const category = await prisma.forumCategory.findUnique({
        where: { slug: categorySlug },
      })
      if (category) {
        where.categoryId = category.id
      }
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' } // Default: latest
    if (sortBy === 'mostReplies') {
      orderBy = { posts: { _count: 'desc' } }
    } else if (sortBy === 'mostLiked') {
      orderBy = { likes: { _count: 'desc' } }
    } else if (sortBy === 'trending') {
      orderBy = { viewCount: 'desc' }
    }

    const [topics, total] = await Promise.all([
      prisma.forumTopic.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          category: {
            select: {
              name: true,
              slug: true,
              icon: true,
              color: true,
            },
          },
          _count: {
            select: {
              posts: true,
              likes: true,
            },
          },
        },
      }),
      prisma.forumTopic.count({ where }),
    ])

    const topicsWithStats = topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      slug: topic.slug,
      content: topic.content.substring(0, 200), // Excerpt
      author: topic.author,
      category: topic.category,
      replies: topic._count.posts,
      views: topic.viewCount,
      likes: topic._count.likes,
      isPinned: topic.isPinned,
      isLocked: topic.isLocked,
      createdAt: topic.createdAt.toISOString(),
      updatedAt: topic.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      topics: topicsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    )
  }
}

// POST /api/community/topics - Create a new topic
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, content, categoryId } = body

    // Validate required fields
    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100)

    // Check if slug exists
    const existingTopic = await prisma.forumTopic.findUnique({
      where: { slug },
    })

    const finalSlug = existingTopic
      ? `${slug}-${Date.now().toString(36)}`
      : slug

    // Create topic
    const topic = await prisma.forumTopic.create({
      data: {
        title,
        slug: finalSlug,
        content,
        categoryId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
            icon: true,
            color: true,
          },
        },
      },
    })

    return NextResponse.json({ 
      id: topic.id,
      slug: topic.slug,
      title: topic.title,
      message: 'Topic created successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating topic:', error)
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    )
  }
}
