import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { bookId } = await req.json()

    if (!bookId) {
      return NextResponse.json(
        { message: 'Book ID is required' },
        { status: 400 }
      )
    }

    // Check if already bookmarked
    const existing = await prisma.bookmark.findFirst({
      where: {
        userId: session.user.id,
        bookId,
      },
    })

    if (existing) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: { id: existing.id },
      })

      return NextResponse.json({ 
        message: 'Bookmark removed',
        bookmarked: false 
      })
    }

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        bookId,
      },
    })

    return NextResponse.json({ 
      message: 'Book bookmarked',
      bookmark,
      bookmarked: true 
    })
  } catch (error: any) {
    console.error('Bookmark API error:', error)
    return NextResponse.json(
      { message: 'Failed to bookmark' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            price: true,
            salePrice: true,
            rating: true,
            reviewCount: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ bookmarks })
  } catch (error: any) {
    console.error('Get bookmarks API error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch bookmarks' },
      { status: 500 }
    )
  }
}
