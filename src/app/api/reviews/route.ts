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

    const { bookId, rating, comment } = await req.json()

    if (!bookId || !rating || !comment) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if user already reviewed this book
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        bookId,
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { message: 'You have already reviewed this book' },
        { status: 400 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        bookId,
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Update book rating and review count
    const reviews = await prisma.review.findMany({
      where: { bookId },
      select: { rating: true },
    })

    const averageRating = reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / reviews.length

    await prisma.book.update({
      where: { id: bookId },
      data: {
        rating: averageRating,
        reviewCount: reviews.length,
      },
    })

    return NextResponse.json({ review })
  } catch (error: any) {
    console.error('Review API error:', error)
    return NextResponse.json(
      { message: 'Failed to submit review' },
      { status: 500 }
    )
  }
}
