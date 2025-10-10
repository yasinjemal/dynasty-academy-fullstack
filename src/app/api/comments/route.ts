import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// GET comments for a resource (book or blog post)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const resourceType = searchParams.get('resourceType') // 'BOOK' or 'BLOG'
    const resourceId = searchParams.get('resourceId')

    if (!resourceType || !resourceId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const where: any = {}
    if (resourceType === 'BOOK') {
      where.bookId = resourceId
    } else if (resourceType === 'BLOG') {
      where.blogPostId = resourceId
    }

    const comments = await prisma.comment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST create a comment
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, resourceType, resourceId } = await request.json()

    if (!content || !resourceType || !resourceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const data: any = {
      content,
      userId: session.user.id,
    }

    if (resourceType === 'BOOK') {
      data.bookId = resourceId
    } else if (resourceType === 'BLOG') {
      data.blogPostId = resourceId
    }

    const comment = await prisma.comment.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Create notification for resource owner
    if (resourceType === 'BOOK') {
      // Books don't have an owner in our schema, skip notification
    } else if (resourceType === 'BLOG') {
      const blogPost = await prisma.blogPost.findUnique({
        where: { id: resourceId },
        select: { authorId: true },
      })
      
      if (blogPost && blogPost.authorId !== session.user.id) {
        await prisma.notification.create({
          data: {
            userId: blogPost.authorId,
            type: 'COMMENT',
            title: 'New Comment',
            message: `${session.user.name} commented on your blog post`,
            read: false,
          },
        })
      }
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
