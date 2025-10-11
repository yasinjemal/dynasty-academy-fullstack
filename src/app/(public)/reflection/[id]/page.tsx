import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ReflectionPageProps {
  params: Promise<{ id: string }>
}

async function getReflection(id: string) {
  try {
    const reflection = await prisma.bookReflection.findFirst({
      where: { 
        id,
        isPublic: true, // Only show public reflections
      },
      select: {
        id: true,
        content: true,
        chapterNumber: true,
        createdAt: true,
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
            coverImage: true,
          },
        },
        communityPostId: true,
      },
    })

    if (!reflection) {
      return null
    }

    // Get community post data separately if it exists
    let communityPostData = null
    if (reflection.communityPostId) {
      communityPostData = await prisma.forumTopic.findUnique({
        where: { id: reflection.communityPostId },
        select: {
          id: true,
          _count: {
            select: {
              likes: true,
              posts: true, // Fixed: ForumTopic has 'posts' not 'comments'
            },
          },
        },
      })
    }

    return {
      ...reflection,
      communityPost: communityPostData,
    }
  } catch (error) {
    console.error('Error fetching reflection:', error)
    return null
  }
}

export async function generateMetadata({
  params,
}: ReflectionPageProps): Promise<Metadata> {
  const { id } = await params
  const reflection = await getReflection(id)

  if (!reflection) {
    return {
      title: 'Reflection Not Found',
    }
  }

  const excerpt =
    reflection.content.length > 160
      ? reflection.content.substring(0, 160) + '...'
      : reflection.content

  return {
    title: `${reflection.user.name}'s Reflection on ${reflection.book.title} | Dynasty Built`,
    description: excerpt,
    openGraph: {
      title: `${reflection.user.name}'s Reflection`,
      description: excerpt,
      images: [
        {
          url: `/api/og/reflection/${id}`,
          width: 1200,
          height: 630,
          alt: `Reflection by ${reflection.user.name}`,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${reflection.user.name}'s Reflection`,
      description: excerpt,
      images: [`/api/og/reflection/${id}`],
    },
  }
}

export default async function ReflectionPage({ params }: ReflectionPageProps) {
  const { id } = await params
  const reflection = await getReflection(id)

  if (!reflection) {
    notFound()
  }

  const likesCount = reflection.communityPost?._count.likes || 0
  const commentsCount = reflection.communityPost?._count.posts || 0 // Fixed: posts not comments

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/30 dark:to-blue-900/30">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-6 text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors"
          >
            <span className="text-2xl">🏛️</span>
            <span className="text-xl font-bold">Dynasty Built</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Wisdom from the Dynasty Community
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            A reflection shared by one of our builders
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm mb-8">
          <CardContent className="p-8">
            {/* Book Info */}
            <Link
              href={`/books/${reflection.book.slug}`}
              className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 hover:from-purple-200 hover:to-blue-200 dark:hover:from-purple-900/50 dark:hover:to-blue-900/50 transition-all"
            >
              {reflection.book.coverImage && (
                <img
                  src={reflection.book.coverImage}
                  alt={reflection.book.title}
                  className="w-16 h-24 object-cover rounded-lg shadow-lg"
                />
              )}
              <div>
                <div className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-1">
                  📖 Reading
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {reflection.book.title}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Chapter {reflection.chapterNumber}
                </div>
              </div>
            </Link>

            {/* Reflection Content */}
            <div className="mb-8">
              <div className="text-2xl sm:text-3xl leading-relaxed text-gray-800 dark:text-gray-200 font-serif italic border-l-4 border-purple-500 pl-6 py-4">
                "{reflection.content}"
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href={`/users/${reflection.user.id}`}
                className="flex items-center gap-4 hover:opacity-80 transition-opacity"
              >
                {reflection.user.image ? (
                  <img
                    src={reflection.user.image}
                    alt={reflection.user.name}
                    className="w-16 h-16 rounded-full border-3 border-purple-500"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                    {reflection.user.name[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {reflection.user.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Dynasty Builder
                  </div>
                </div>
              </Link>

              {/* Engagement Stats */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">❤️</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {likesCount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💬</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {commentsCount}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-2xl p-8 text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-3">
            Join the Dynasty Movement 🏛️
          </h2>
          <p className="text-purple-100 text-lg mb-6 max-w-2xl mx-auto">
            Read life-changing books, share your reflections, and build your legacy alongside thousands of other builders.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 font-bold text-lg px-8 py-6"
              >
                Start Building Your Dynasty
              </Button>
            </Link>
            <Link href="/books">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-8 py-6"
              >
                Explore Books
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
