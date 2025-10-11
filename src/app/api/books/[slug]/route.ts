import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const book = await prisma.book.findUnique({
      where: {
        slug,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        reviews: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
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
        },
      },
    })

    if (!book || !book.publishedAt) {
      return NextResponse.json(
        { message: 'Book not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.book.update({
      where: { id: book.id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({ book })
  } catch (error: any) {
    console.error('Book detail API error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch book' },
      { status: 500 }
    )
  }
}
