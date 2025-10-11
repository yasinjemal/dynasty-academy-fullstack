import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET leaderboard (top users by Dynasty Points from reflections)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const timeframe = searchParams.get('timeframe') || 'all-time'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Calculate date filter based on timeframe
    let dateFilter: Date | undefined
    const now = new Date()
    
    switch (timeframe) {
      case 'week':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'all-time':
      default:
        dateFilter = undefined
    }

    // Get all users with their progress data
    const usersWithProgress = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        progress: {
          select: {
            reflectionsCount: true,
            completed: true,
          },
          ...(dateFilter && {
            where: {
              updatedAt: {
                gte: dateFilter,
              },
            },
          }),
        },
        achievements: {
          select: {
            id: true,
          },
          ...(dateFilter && {
            where: {
              unlockedAt: {
                gte: dateFilter,
              },
            },
          }),
        },
        bookReflections: {
          select: {
            id: true,
            communityPost: {
              select: {
                _count: {
                  select: {
                    likes: true,
                  },
                },
              },
            },
          },
          where: {
            communityPostId: { not: null },
            ...(dateFilter && {
              createdAt: {
                gte: dateFilter,
              },
            }),
          },
        },
      },
    })

    // Calculate stats and dynasty points for each user
    const leaderboardData = usersWithProgress
      .map((user: any) => {
        // Calculate reflections count
        const reflectionsCount = user.progress.reduce(
          (sum: number, progress: { reflectionsCount: number | null }) => 
            sum + (progress.reflectionsCount || 0),
          0
        )

        // Calculate completed books
        const completedBooks = user.progress.filter(
          (p: { completed: boolean }) => p.completed
        ).length

        // Calculate total likes
        const totalLikes = user.bookReflections.reduce(
          (sum: number, reflection: any) => 
            sum + (reflection.communityPost?._count.likes || 0),
          0
        )

        // Calculate achievements count
        const achievementsCount = user.achievements.length

        // Dynasty Points Formula
        const dynastyPoints =
          reflectionsCount * 10 +
          completedBooks * 50 +
          totalLikes * 2 +
          achievementsCount * 25

        // Calculate level
        const level = Math.floor(dynastyPoints / 100) + 1

        return {
          userId: user.id,
          userName: user.name || 'Anonymous',
          userImage: user.image,
          reflectionsCount,
          completedBooks,
          dynastyPoints,
          level,
        }
      })
      .filter((user: any) => user.dynastyPoints > 0) // Only show users with points
      .sort((a: any, b: any) => b.dynastyPoints - a.dynastyPoints) // Sort by points descending
      .slice(0, limit) // Limit results
      .map((user: any, index: number) => ({
        ...user,
        rank: index + 1,
      }))

    return NextResponse.json({
      leaderboard: leaderboardData,
      timeframe,
      total: leaderboardData.length,
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
