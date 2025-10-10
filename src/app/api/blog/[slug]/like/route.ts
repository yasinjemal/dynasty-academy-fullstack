import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    // Find the blog post
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    })

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: post.id,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: post.id,
          },
        },
      })

      return NextResponse.json({ liked: false, message: 'Post unliked' })
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId: post.id,
        },
      })

      return NextResponse.json({ liked: true, message: 'Post liked' })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
  }
}

// GET - Check if user has liked this post
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ liked: false })
    }

    const { slug } = await params
    // Find the blog post
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    })

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    // Check if liked
    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: post.id,
        },
      },
    })

    return NextResponse.json({ liked: !!like })
  } catch (error) {
    console.error('Error checking like:', error)
    return NextResponse.json({ error: 'Failed to check like' }, { status: 500 })
  }
}
