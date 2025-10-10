import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// PATCH /api/community/posts/[id] - Update post
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { content, isAnswer } = body

    // Get existing post
    const existingPost = await prisma.forumPost.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check permissions
    const isAuthor = existingPost.authorId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update post
    const updateData: any = {}
    if (content) updateData.content = content
    if (typeof isAnswer === 'boolean' && isAdmin) {
      updateData.isAnswer = isAnswer
    }

    const updatedPost = await prisma.forumPost.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ post: updatedPost })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

// DELETE /api/community/posts/[id] - Delete post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get existing post
    const existingPost = await prisma.forumPost.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check permissions
    const isAuthor = existingPost.authorId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete post (cascade delete replies and likes)
    await prisma.forumPost.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
