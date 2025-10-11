import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    // Get user progress data
    const userProgressData = await prisma.userProgress.findMany({
      where: { userId },
      select: {
        reflectionsCount: true,
        completed: true,
      },
    })

    // Calculate stats
    const reflectionsCount = userProgressData.reduce(
      (sum: number, progress: { reflectionsCount: number | null }) => sum + (progress.reflectionsCount || 0),
      0
    )
    const completedBooks = userProgressData.filter((p: { completed: boolean }) => p.completed).length

    // Get achievements (fetch separately to handle deleted achievements)
    const userAchievements = await prisma.userAchievement.findMany({
      where: {
        userId,
      },
      orderBy: {
        unlockedAt: 'desc',
      },
    })

    // Get achievement details for valid achievements
    const achievementIds = userAchievements.map((ua: any) => ua.achievementId)
    const achievementDetails = await prisma.achievement.findMany({
      where: {
        id: { in: achievementIds },
      },
    })

    // Create a map of achievements
    const achievementMap = new Map(achievementDetails.map((a: any) => [a.id, a]))

    // Filter and map achievements (only include ones that still exist)
    const achievements = userAchievements
      .filter((ua: any) => achievementMap.has(ua.achievementId))
      .map((ua: any) => {
        const achievement = achievementMap.get(ua.achievementId)
        return {
          id: achievement.id,
          title: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          unlockedAt: ua.unlockedAt.toISOString(),
          category: achievement.category,
        }
      })

    // Get recent reflections with engagement stats
    const recentReflections = await prisma.bookReflection.findMany({
      where: {
        userId,
        communityPostId: { not: null },
      },
      select: {
        id: true,
        chapterNumber: true,
        createdAt: true,
        book: {
          select: {
            title: true,
          },
        },
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
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    })

    const formattedReflections = recentReflections.map((r: any) => ({
      id: r.id,
      bookTitle: r.book.title,
      chapterNumber: r.chapterNumber,
      createdAt: r.createdAt.toISOString(),
      likesCount: r.communityPost?._count.likes || 0,
    }))

    // Calculate Dynasty Points
    // Formula: reflections * 10 + completed books * 50 + total likes * 2 + achievements * 25
    const totalLikes = recentReflections.reduce(
      (sum: number, r: any) => sum + (r.communityPost?._count.likes || 0),
      0
    )
    const dynastyPoints =
      reflectionsCount * 10 +
      completedBooks * 50 +
      totalLikes * 2 +
      achievements.length * 25

    // Calculate level (every 100 points = 1 level)
    const level = Math.floor(dynastyPoints / 100) + 1
    const nextLevelPoints = 100

    return NextResponse.json({
      reflectionsCount,
      completedBooks,
      dynastyPoints,
      level,
      nextLevelPoints,
      achievements,
      recentReflections: formattedReflections,
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}
