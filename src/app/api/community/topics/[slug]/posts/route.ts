import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// POST /api/community/topics/[slug]/posts - Create a new post/reply
export async function POST(
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
    const { content, parentId } = body

    // Validate content
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Get topic
    const topic = await prisma.forumTopic.findUnique({
      where: { slug },
    })

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // Check if topic is locked
    if (topic.isLocked && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'This topic is locked' },
        { status: 403 }
      )
    }

    // If parentId provided, verify it exists
    if (parentId) {
      const parentPost = await prisma.forumPost.findUnique({
        where: { id: parentId },
      })
      if (!parentPost) {
        return NextResponse.json(
          { error: 'Parent post not found' },
          { status: 404 }
        )
      }
    }

    // Create post
    const post = await prisma.forumPost.create({
      data: {
        content,
        topicId: topic.id,
        authorId: session.user.id,
        parentId: parentId || null,
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
      },
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
