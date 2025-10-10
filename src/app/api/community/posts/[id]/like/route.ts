import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// POST /api/community/posts/[id]/like - Toggle post like
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get post
    const post = await prisma.forumPost.findUnique({
      where: { id },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check if already liked
    const existingLike = await prisma.forumPostLike.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: id,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.forumPostLike.delete({
        where: { id: existingLike.id },
      })
      return NextResponse.json({ liked: false })
    } else {
      // Like
      await prisma.forumPostLike.create({
        data: {
          userId: session.user.id,
          postId: id,
        },
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Error toggling post like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}
