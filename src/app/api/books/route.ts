import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      publishedAt: { not: null },
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.category = category
    }

    // Get books with pagination
    const [books, totalCount] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: order,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          coverImage: true,
          price: true,
          salePrice: true,
          category: true,
          rating: true,
          reviewCount: true,
          featured: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.book.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      books,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
    })
  } catch (error: any) {
    console.error('Books API error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch books' },
      { status: 500 }
    )
  }
}
