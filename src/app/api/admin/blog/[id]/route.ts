import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// GET single blog post
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const post = await prisma.blogPost.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 })
  }
}

// PATCH update blog post
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
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt
    if (data.content !== undefined) updateData.content = data.content
    if (data.category !== undefined) updateData.category = data.category
    if (data.tags !== undefined) updateData.tags = data.tags
    if (data.featuredImage !== undefined) updateData.coverImage = data.featuredImage // Map to coverImage
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage
    if (data.status !== undefined) {
      updateData.publishedAt = data.status === 'PUBLISHED' ? new Date() : null
    }
    if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt
    if (data.featured !== undefined) updateData.featured = data.featured
    if (data.readTime !== undefined) updateData.readTime = data.readTime
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription

    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 })
  }
}

// DELETE blog post
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.blogPost.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Blog post deleted successfully' })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 })
  }
}
