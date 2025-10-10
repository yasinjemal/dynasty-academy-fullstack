import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// GET /api/community/topics/[slug] - Fetch topic with posts
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const topic = await prisma.forumTopic.findUnique({
      where: { slug },
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
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
          },
        },
        posts: {
          where: { parentId: null }, // Only root posts
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            replies: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
                _count: {
                  select: {
                    likes: true,
                  },
                },
              },
            },
            _count: {
              select: {
                likes: true,
                replies: true,
              },
            },
          },
        },
        _count: {
          select: {
            posts: true,
            likes: true,
          },
        },
      },
    })

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // Increment view count
    await prisma.forumTopic.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({ topic })
  } catch (error) {
    console.error('Error fetching topic:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topic' },
      { status: 500 }
    )
  }
}

// PATCH /api/community/topics/[slug] - Update topic (author or admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const body = await req.json()
    const { title, content, isPinned, isLocked } = body

    // Get existing topic
    const existingTopic = await prisma.forumTopic.findUnique({
      where: { slug },
    })

    if (!existingTopic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // Check permissions
    const isAuthor = existingTopic.authorId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only admins can pin/lock
    const updateData: any = {}
    if (title) updateData.title = title
    if (content) updateData.content = content
    if (isAdmin) {
      if (typeof isPinned === 'boolean') updateData.isPinned = isPinned
      if (typeof isLocked === 'boolean') updateData.isLocked = isLocked
    }

    const updatedTopic = await prisma.forumTopic.update({
      where: { slug },
      data: updateData,
    })

    return NextResponse.json({ topic: updatedTopic })
  } catch (error) {
    console.error('Error updating topic:', error)
    return NextResponse.json(
      { error: 'Failed to update topic' },
      { status: 500 }
    )
  }
}

// DELETE /api/community/topics/[slug] - Delete topic (author or admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params

    // Get existing topic
    const existingTopic = await prisma.forumTopic.findUnique({
      where: { slug },
    })

    if (!existingTopic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // Check permissions
    const isAuthor = existingTopic.authorId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete topic (cascade delete posts, likes, bookmarks)
    await prisma.forumTopic.delete({
      where: { slug },
    })

    return NextResponse.json({ message: 'Topic deleted successfully' })
  } catch (error) {
    console.error('Error deleting topic:', error)
    return NextResponse.json(
      { error: 'Failed to delete topic' },
      { status: 500 }
    )
  }
}
