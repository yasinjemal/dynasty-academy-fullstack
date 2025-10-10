import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// GET user's followers
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: params.userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ followers: followers.map(f => f.follower) })
  } catch (error) {
    console.error('Error fetching followers:', error)
    return NextResponse.json({ error: 'Failed to fetch followers' }, { status: 500 })
  }
}
