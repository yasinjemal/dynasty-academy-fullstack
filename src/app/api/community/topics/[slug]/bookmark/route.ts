import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// POST /api/community/topics/[slug]/bookmark - Toggle topic bookmark
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

    // Check if already bookmarked
    const existingBookmark = await prisma.forumTopicBookmark.findUnique({
      where: {
        userId_topicId: {
          userId: session.user.id,
          topicId: topic.id,
        },
      },
    })

    if (existingBookmark) {
      // Remove bookmark
      await prisma.forumTopicBookmark.delete({
        where: { id: existingBookmark.id },
      })
      return NextResponse.json({ bookmarked: false })
    } else {
      // Add bookmark
      await prisma.forumTopicBookmark.create({
        data: {
          userId: session.user.id,
          topicId: topic.id,
        },
      })
      return NextResponse.json({ bookmarked: true })
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to toggle bookmark' },
      { status: 500 }
    )
  }
}
