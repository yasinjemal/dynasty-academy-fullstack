import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET leaderboard (top users by XP)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            blogPosts: true,
            comments: true,
            likes: true,
            followers: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Calculate activity score based on user engagement
    const usersWithScore = users.map((user: any, index: number) => {
      const activityScore = 
        (user._count.orders * 10) + 
        (user._count.blogPosts * 5) + 
        (user._count.comments * 2) + 
        (user._count.likes * 1) + 
        (user._count.followers * 3)
      
      return {
        ...user,
        rank: index + 1,
        activityScore,
        level: Math.floor(activityScore / 100) + 1,
      }
    })
    
    // Sort by activity score and update ranks
    const leaderboard = usersWithScore
      .sort((a: any, b: any) => b.activityScore - a.activityScore)
      .map((user: any, index: number) => ({ ...user, rank: index + 1 }))

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
