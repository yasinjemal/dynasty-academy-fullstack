import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// POST toggle follow
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { followingId } = await request.json()

    if (!followingId) {
      return NextResponse.json({ error: 'Missing followingId' }, { status: 400 })
    }

    if (followingId === session.user.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId,
        },
      },
    })

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId,
          },
        },
      })
      return NextResponse.json({ following: false, message: 'Unfollowed' })
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: session.user.id,
          followingId,
        },
      })

      // Create notification
      await prisma.notification.create({
        data: {
          userId: followingId,
          type: 'FOLLOW',
          title: 'New Follower',
          message: `${session.user.name} started following you`,
          read: false,
        },
      })

      return NextResponse.json({ following: true, message: 'Followed' })
    }
  } catch (error) {
    console.error('Error toggling follow:', error)
    return NextResponse.json({ error: 'Failed to toggle follow' }, { status: 500 })
  }
}

// GET check if following
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ following: false })
    }

    const { searchParams } = new URL(request.url)
    const followingId = searchParams.get('followingId')

    if (!followingId) {
      return NextResponse.json({ error: 'Missing followingId' }, { status: 400 })
    }

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId,
        },
      },
    })

    return NextResponse.json({ following: !!follow })
  } catch (error) {
    console.error('Error checking follow status:', error)
    return NextResponse.json({ error: 'Failed to check follow status' }, { status: 500 })
  }
}
