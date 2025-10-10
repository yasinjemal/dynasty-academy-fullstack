import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// GET single book
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const book = await prisma.book.findUnique({
      where: { id: params.id },
      include: {
        reviews: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true,
          },
        },
      },
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    return NextResponse.json(book)
  } catch (error) {
    console.error('Error fetching book:', error)
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 })
  }
}

// PATCH update book
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const updateData: any = {}

    if (data.title !== undefined) {
      updateData.title = data.title
      // Update slug when title changes
      updateData.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }
    if (data.slug !== undefined) updateData.slug = data.slug
    if (data.description !== undefined) updateData.description = data.description
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt
    if (data.category !== undefined) updateData.category = data.category
    if (data.price !== undefined) updateData.price = parseFloat(data.price)
    if (data.compareAtPrice !== undefined) {
      updateData.salePrice = data.compareAtPrice ? parseFloat(data.compareAtPrice) : null
    }
    if (data.salePrice !== undefined) {
      updateData.salePrice = data.salePrice ? parseFloat(data.salePrice) : null
    }
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage
    if (data.pdfFile !== undefined) updateData.fileUrl = data.pdfFile
    if (data.fileUrl !== undefined) updateData.fileUrl = data.fileUrl
    if (data.previewUrl !== undefined) updateData.previewUrl = data.previewUrl
    if (data.contentType !== undefined) updateData.contentType = data.contentType
    if (data.tags !== undefined) updateData.tags = data.tags
    if (data.pages !== undefined) updateData.pages = data.pages ? parseInt(data.pages) : null
    if (data.duration !== undefined) updateData.duration = data.duration ? parseInt(data.duration) : null
    if (data.status !== undefined) {
      updateData.publishedAt = data.status === 'PUBLISHED' ? new Date() : null
    }
    if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt
    if (data.featured !== undefined) updateData.featured = data.featured

    const book = await prisma.book.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(book)
  } catch (error) {
    console.error('Error updating book:', error)
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 })
  }
}

// DELETE book
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.book.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Book deleted successfully' })
  } catch (error) {
    console.error('Error deleting book:', error)
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 })
  }
}
