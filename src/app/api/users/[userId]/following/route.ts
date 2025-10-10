import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// GET user's following
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const following = await prisma.follow.findMany({
      where: { followerId: params.userId },
      include: {
        following: {
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

    return NextResponse.json({ following: following.map(f => f.following) })
  } catch (error) {
    console.error('Error fetching following:', error)
    return NextResponse.json({ error: 'Failed to fetch following' }, { status: 500 })
  }
}
