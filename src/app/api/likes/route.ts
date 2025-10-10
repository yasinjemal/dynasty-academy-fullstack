import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// POST toggle like
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { resourceType, resourceId } = await request.json()

    if (!resourceType || !resourceId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const where: any = {
      userId: session.user.id,
    }

    if (resourceType === 'BOOK') {
      where.bookId = resourceId
    } else if (resourceType === 'BLOG') {
      where.blogPostId = resourceId
    } else {
      return NextResponse.json({ error: 'Invalid resource type' }, { status: 400 })
    }

    // Check if already liked
    const existingLike = await prisma.like.findFirst({ where })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      })
      return NextResponse.json({ liked: false, message: 'Unliked' })
    } else {
      // Like
      const data: any = {
        userId: session.user.id,
      }

      if (resourceType === 'BOOK') {
        data.bookId = resourceId
      } else if (resourceType === 'BLOG') {
        data.blogPostId = resourceId
      }

      await prisma.like.create({ data })

      // Create notification for resource owner
      if (resourceType === 'BLOG') {
        const blogPost = await prisma.blogPost.findUnique({
          where: { id: resourceId },
          select: { authorId: true },
        })
        
        if (blogPost && blogPost.authorId !== session.user.id) {
          await prisma.notification.create({
            data: {
              userId: blogPost.authorId,
              type: 'LIKE',
              title: 'New Like',
              message: `${session.user.name} liked your blog post`,
              read: false,
            },
          })
        }
      }

      return NextResponse.json({ liked: true, message: 'Liked' })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
  }
}

// GET check if user has liked
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ liked: false })
    }

    const { searchParams } = new URL(request.url)
    const resourceType = searchParams.get('resourceType')
    const resourceId = searchParams.get('resourceId')

    if (!resourceType || !resourceId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const where: any = {
      userId: session.user.id,
    }

    if (resourceType === 'BOOK') {
      where.bookId = resourceId
    } else if (resourceType === 'BLOG') {
      where.blogPostId = resourceId
    }

    const like = await prisma.like.findFirst({ where })

    return NextResponse.json({ liked: !!like })
  } catch (error) {
    console.error('Error checking like:', error)
    return NextResponse.json({ error: 'Failed to check like' }, { status: 500 })
  }
}
