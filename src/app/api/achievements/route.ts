import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// GET user achievements
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id

    // Get user achievements with achievement details (filter out null achievements)
    const userAchievements = await prisma.userAchievement.findMany({
      where: {
        userId,
        achievement: {
          isNot: null,
        },
      },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
    })

    // Get all achievements to show locked ones
    const allAchievements = await prisma.achievement.findMany({
      orderBy: { points: 'desc' },
    })

    const unlockedIds = userAchievements.map((ua: any) => ua.achievementId)
    
    const achievements = allAchievements.map((achievement: any) => {
      const userAchievement = userAchievements.find((ua: any) => ua.achievementId === achievement.id)
      return {
        ...achievement,
        unlocked: !!userAchievement,
        unlockedAt: userAchievement?.unlockedAt || null,
      }
    })

    return NextResponse.json({ achievements })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 })
  }
}

// POST check and unlock achievements
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { achievementKey } = await request.json()

    // Get the achievement
    const achievement = await prisma.achievement.findUnique({
      where: { key: achievementKey },
    })

    if (!achievement) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 })
    }

    // Check if already unlocked
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId: session.user.id,
          achievementId: achievement.id,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ message: 'Achievement already unlocked' })
    }

    // Unlock achievement
    await prisma.userAchievement.create({
      data: {
        userId: session.user.id,
        achievementId: achievement.id,
      },
    })

    // Add XP to user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { xp: { increment: achievement.points } },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'ACHIEVEMENT',
        title: '🏆 Achievement Unlocked!',
        message: `You unlocked "${achievement.name}" (+${achievement.points} XP)`,
        read: false,
      },
    })

    return NextResponse.json({ 
      message: 'Achievement unlocked!', 
      achievement,
      xpReward: achievement.points,
    })
  } catch (error) {
    console.error('Error unlocking achievement:', error)
    return NextResponse.json({ error: 'Failed to unlock achievement' }, { status: 500 })
  }
}
