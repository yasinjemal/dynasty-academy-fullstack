import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET /api/community/reflections/public?bookId=X&chapterNumber=Y&limit=3
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const bookId = searchParams.get('bookId')
    const chapterNumber = parseInt(searchParams.get('chapterNumber') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!bookId) {
      return NextResponse.json(
        { error: 'Missing bookId parameter' },
        { status: 400 }
      )
    }

    // Fetch public reflections that have been shared to community
    const reflections = await prisma.bookReflection.findMany({
      where: {
        bookId,
        chapterNumber,
        isPublic: true,
        communityPostId: { not: null }, // Only reflections shared to community
      },
      orderBy: [
        // Sort by community engagement (via communityPost relation)
        { createdAt: 'desc' },
      ],
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        communityPost: {
          select: {
            id: true,
            slug: true,
            viewCount: true,
            _count: {
              select: {
                likes: true,
                posts: true,
              },
            },
          },
        },
      },
    })

    // Get total count for this chapter
    const total = await prisma.bookReflection.count({
      where: {
        bookId,
        chapterNumber,
        isPublic: true,
        communityPostId: { not: null },
      },
    })

    // Transform the data
    const formattedReflections = reflections.map((reflection: any) => ({
      id: reflection.id,
      content: reflection.content,
      author: {
        name: reflection.user.name || 'Anonymous',
        image: reflection.user.image,
      },
      communityPost: reflection.communityPost,
      createdAt: reflection.createdAt,
    }))

    return NextResponse.json({
      success: true,
      reflections: formattedReflections,
      total,
      chapter: chapterNumber,
    })
  } catch (error: any) {
    console.error('[Public Reflections API Error]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
