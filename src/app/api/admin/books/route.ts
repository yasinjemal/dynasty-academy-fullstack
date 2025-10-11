import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// GET all books for admin (with more details)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (status) {
      where.status = status
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              reviews: true,
              orders: true,
            },
          },
        },
      }),
      prisma.book.count({ where }),
    ])

    return NextResponse.json({
      books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
  }
}

// POST create new book
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Create slug from title if not provided
    const slug = data.slug || data.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const book = await prisma.book.create({
      data: {
        title: data.title,
        slug: slug,
        description: data.description || '',
        excerpt: data.excerpt || null,
        coverImage: data.coverImage || null,
        price: parseFloat(data.price),
        salePrice: data.compareAtPrice ? parseFloat(data.compareAtPrice) : null,
        category: data.category,
        tags: data.tags || [],
        contentType: data.contentType || 'PDF',
        fileUrl: data.pdfFile || null,
        previewUrl: null,
        pages: null,
        duration: null,
        authorId: session.user.id, // Use the logged-in admin's ID
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
        featured: data.featured || false,
        viewCount: 0,
        salesCount: 0,
        rating: 0,
        reviewCount: 0,
      },
    })

    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    console.error('Error creating book:', error)
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 })
  }
}
