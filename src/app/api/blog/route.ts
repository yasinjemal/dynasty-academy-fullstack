import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      publishedAt: {
        not: null, // Only show published posts
      },
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.category = category
    }

    // Get blog posts with pagination
    const [posts, totalCount] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: order,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          category: true,
          tags: true,
          readTime: true,
          viewCount: true,
          publishedAt: true,
          featured: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      prisma.blogPost.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
    })
  } catch (error: any) {
    console.error('Blog API error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}
