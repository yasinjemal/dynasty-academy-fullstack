import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      bookId,
      bookTitle,
      chapterNumber,
      content,
      postToCommunity,
      category,
      isPublic,
    } = body

    // Validate required fields
    if (!bookId || !content?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields: bookId and content' },
        { status: 400 }
      )
    }

    // 1. Save reflection to user's private notes (always saved)
    const reflection = await prisma.bookReflection.create({
      data: {
        userId: session.user.id,
        bookId,
        chapterNumber: chapterNumber || 1,
        content: content.trim(),
        isPublic: isPublic ?? true,
      },
    })

    let communityPost = null

    // 2. If user wants to share to community, create a forum topic
    if (postToCommunity) {
      // Auto-generate title from book and chapter
      const postTitle = `${session.user.name || 'A Reader'}'s reflections on ${bookTitle}${
        chapterNumber ? ` - Chapter ${chapterNumber}` : ''
      }`

      // Map category slugs to database category names
      const categorySlugMap: Record<string, string> = {
        'learning-education': 'learning-education',
        'project-showcase': 'project-showcase',
        'general-discussion': 'general-discussion',
        'community-support': 'community-support',
      }

      // Get or create the forum category
      const categorySlug = categorySlugMap[category] || 'learning-education'
      const categoryNames: Record<string, string> = {
        'learning-education': 'Learning & Education',
        'project-showcase': 'Project Showcase',
        'general-discussion': 'General Discussion',
        'community-support': 'Community Support',
      }
      const categoryName = categoryNames[categorySlug] || 'Learning & Education'
      
      let forumCategory = await prisma.forumCategory.findFirst({
        where: { 
          OR: [
            { slug: categorySlug },
            { name: categoryName }
          ]
        },
      })

      // If category doesn't exist, create it
      if (!forumCategory) {
        try {
          forumCategory = await prisma.forumCategory.create({
            data: {
              name: categoryName,
              slug: categorySlug,
              description: 'Book reflections and insights',
              icon: '📚',
              order: 0,
            },
          })
        } catch (error: any) {
          // If creation fails due to unique constraint, try to find it again
          if (error.code === 'P2002') {
            forumCategory = await prisma.forumCategory.findFirst({
              where: { 
                OR: [
                  { slug: categorySlug },
                  { name: categoryName }
                ]
              },
            })
          }
          if (!forumCategory) throw error
        }
      }

      // Create forum topic with proper slug
      const topicSlug = `${bookTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-chapter-${chapterNumber || 1}-${Date.now()}`
      
      communityPost = await prisma.forumTopic.create({
        data: {
          title: postTitle,
          slug: topicSlug,
          content: content.trim(),
          categoryId: forumCategory.id,
          authorId: session.user.id,
        },
      })

      // Update reflection with community post link
      await prisma.bookReflection.update({
        where: { id: reflection.id },
        data: { communityPostId: communityPost.id },
      })
    }

    // 3. Award Dynasty Points (if achievements system exists)
    try {
      await prisma.userProgress.upsert({
        where: {
          userId_bookId: {
            userId: session.user.id,
            bookId,
          },
        },
        update: {
          reflectionsCount: { increment: 1 },
        },
        create: {
          userId: session.user.id,
          bookId,
          progress: 0,
          lastPage: chapterNumber || 1,
          reflectionsCount: 1,
        },
      })
    } catch (progressError) {
      console.log('Progress tracking skipped:', progressError)
    }

    // 4. Track achievement (optional)
    if (communityPost) {
      try {
        // Award "Chapter Contributor" badge
        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId: session.user.id,
              achievementId: 'chapter-contributor',
            },
          },
          update: {
            unlockedAt: new Date(),
          },
          create: {
            userId: session.user.id,
            achievementId: 'chapter-contributor',
            unlockedAt: new Date(),
          },
        })
      } catch (achievementError) {
        console.log('Achievement tracking skipped:', achievementError)
      }
    }

    return NextResponse.json({
      success: true,
      reflection: {
        id: reflection.id,
        createdAt: reflection.createdAt,
      },
      communityPost: communityPost
        ? {
            id: communityPost.id,
            slug: communityPost.slug,
            url: `/community?topic=${communityPost.slug}`,
          }
        : null,
      message: postToCommunity
        ? 'Reflection shared with community successfully!'
        : 'Reflection saved privately!',
    })
  } catch (error: any) {
    console.error('[Reflection API Error]:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    )
  }
}

// GET endpoint - Fetch user's reflections for a book
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const bookId = searchParams.get('bookId')

    if (!bookId) {
      return NextResponse.json(
        { error: 'Missing bookId parameter' },
        { status: 400 }
      )
    }

    const reflections = await prisma.bookReflection.findMany({
      where: {
        userId: session.user.id,
        bookId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        communityPost: {
          select: {
            id: true,
            slug: true,
            viewCount: true,
            _count: {
              select: {
                likes: true,
                posts: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      reflections,
    })
  } catch (error) {
    console.error('[Get Reflections Error]:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reflections' },
      { status: 500 }
    )
  }
}
