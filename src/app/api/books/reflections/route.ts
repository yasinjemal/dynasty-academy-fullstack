import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// GET - Fetch reflections for a book/chapter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const bookId = searchParams.get('bookId')
    const chapter = searchParams.get('chapter')
    const userId = searchParams.get('userId')

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }

    const where: any = { bookId }
    
    if (chapter) {
      where.chapter = parseInt(chapter)
    }
    
    if (userId) {
      where.userId = userId
    } else {
      // Only show public reflections if not filtering by user
      where.isPublic = true
    }

    const reflections = await prisma.reflection.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ reflections })
  } catch (error: any) {
    console.error('Error fetching reflections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reflections' },
      { status: 500 }
    )
  }
}

// POST - Create a new reflection
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { bookId, chapter, content, isPublic, shareToForum } = body

    if (!bookId || !chapter || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { 
        id: true, 
        title: true, 
        slug: true,
        category: true 
      },
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    let forumTopicId = null

    // If user wants to share to forum, create a forum topic
    if (shareToForum && isPublic) {
      // Find appropriate forum category based on book category
      const categoryMap: Record<string, string> = {
        'Business': 'career',
        'Technology': 'tech',
        'Self-Help': 'learning',
        'Education': 'learning',
        'Career': 'career',
        'default': 'general',
      }

      const forumCategorySlug = categoryMap[book.category] || categoryMap['default']
      
      const forumCategory = await prisma.forumCategory.findUnique({
        where: { slug: forumCategorySlug },
      })

      if (forumCategory) {
        // Generate a unique slug for the forum topic
        const baseSlug = `${book.slug}-chapter-${chapter}-reflection`
        const timestamp = Date.now()
        const topicSlug = `${baseSlug}-${timestamp}`

        // Create forum topic
        const forumTopic = await prisma.forumTopic.create({
          data: {
            title: `Reflection on "${book.title}" - Chapter ${chapter}`,
            slug: topicSlug,
            content: content,
            authorId: session.user.id,
            categoryId: forumCategory.id,
          },
        })

        forumTopicId = forumTopic.id
      }
    }

    // Create the reflection
    const reflection = await prisma.reflection.create({
      data: {
        content,
        chapter: parseInt(chapter),
        isPublic: isPublic || false,
        userId: session.user.id,
        bookId,
        forumTopicId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        forumTopic: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json({ 
      reflection,
      message: forumTopicId 
        ? 'Reflection saved and shared to community!' 
        : 'Reflection saved successfully!'
    })
  } catch (error: any) {
    console.error('Error saving reflection:', error)
    return NextResponse.json(
      { error: 'Failed to save reflection' },
      { status: 500 }
    )
  }
}
