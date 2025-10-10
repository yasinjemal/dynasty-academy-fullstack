import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const post = await prisma.blogPost.findUnique({
      where: {
        slug,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    if (!post || !post.publishedAt) {
      return NextResponse.json(
        { message: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.blogPost.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json(post)
  } catch (error: any) {
    console.error('Blog detail API error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}
