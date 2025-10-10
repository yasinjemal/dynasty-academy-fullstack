import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// POST /api/community/topics/[slug]/like - Toggle topic like
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

    // Get topic
    const topic = await prisma.forumTopic.findUnique({
      where: { slug },
    })

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // Check if already liked
    const existingLike = await prisma.forumTopicLike.findUnique({
      where: {
        userId_topicId: {
          userId: session.user.id,
          topicId: topic.id,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.forumTopicLike.delete({
        where: { id: existingLike.id },
      })
      return NextResponse.json({ liked: false })
    } else {
      // Like
      await prisma.forumTopicLike.create({
        data: {
          userId: session.user.id,
          topicId: topic.id,
        },
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Error toggling topic like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}
