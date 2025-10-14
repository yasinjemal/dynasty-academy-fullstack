import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { bookId, currentPage, totalPages } = await req.json()

    if (!bookId || !currentPage || !totalPages) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const progress = Math.round((currentPage / totalPages) * 100)
    const completed = currentPage >= totalPages

    // Update or create user progress
    try {
      await prisma.userProgress.upsert({
        where: {
          userId_bookId: {
            userId: session.user.id,
            bookId,
          },
        },
        update: {
          lastPage: currentPage,
          progress,
          completed,
        },
        create: {
          userId: session.user.id,
          bookId,
          lastPage: currentPage,
          progress,
          completed,
        },
      })
    } catch (error) {
      console.error("Error updating reading progress:", error);
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      )
    }

    // Award achievement for finishing a book
    if (completed) {
      try {
        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId: session.user.id,
              achievementId: 'book-completionist', // Assuming this achievement exists
            },
          },
          update: {
            progress: { increment: 1 },
          },
          create: {
            userId: session.user.id,
            achievementId: 'book-completionist',
            progress: 1,
            unlockedAt: new Date(),
          },
        })
      } catch (error) {
        // Achievement might not exist, ignore
        console.log('Achievement update skipped:', error)
      }
    }

    return NextResponse.json({
      success: true,
      progress,
      completed,
    })
  } catch (error) {
    console.error('Error tracking reading progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const bookId = searchParams.get('bookId')

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID required' },
        { status: 400 }
      )
    }

    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId,
        },
      },
    })

    return NextResponse.json({
      progress: progress || null,
    })
  } catch (error) {
    console.error('Error fetching reading progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
