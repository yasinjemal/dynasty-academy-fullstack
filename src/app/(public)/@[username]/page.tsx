import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface PublicProfilePageProps {
  params: {
    username: string
  }
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const username = decodeURIComponent(params.username.replace('@', ''))
  // Normalize: convert hyphens back to spaces for user lookup
  const normalizedWithSpaces = username.replace(/-/g, ' ').trim()
  
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { name: username },
        { name: normalizedWithSpaces },
        { email: username },
      ],
    },
    select: {
      name: true,
      image: true,
      createdAt: true,
    },
  })

  if (!user) {
    return {
      title: 'Profile Not Found | Dynasty Built',
    }
  }

  // Use URL-friendly format for OG image
  const urlFriendlyUsername = (user.name || '').toLowerCase().replace(/\s+/g, '-')
  const ogImageUrl = `/api/og/profile/@${urlFriendlyUsername}`

  return {
    title: `${user.name} - Dynasty Builder | Dynasty Built Academy`,
    description: `Check out ${user.name}'s reading journey, reflections, and achievements on Dynasty Built Academy. Join the community of builders transforming knowledge into action.`,
    openGraph: {
      title: `${user.name} - Dynasty Builder`,
      description: `${user.name}'s reading journey on Dynasty Built Academy`,
      images: [ogImageUrl],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${user.name} - Dynasty Builder`,
      description: `${user.name}'s reading journey on Dynasty Built Academy`,
      images: [ogImageUrl],
    },
  }
}

async function getUserProfile(username: string) {
  // Normalize username: handle URL encoding and convert hyphens back to spaces
  const decodedUsername = decodeURIComponent(username)
  const normalizedWithSpaces = decodedUsername.replace(/-/g, ' ').trim()
  const normalizedWithHyphens = decodedUsername.toLowerCase().replace(/\s+/g, '-')
  
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { name: decodedUsername },
        { name: normalizedWithSpaces },
        { email: decodedUsername },
        { email: normalizedWithSpaces },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  })

  if (!user) return null

  // Get user stats
  const [reflections, completedBooks, achievements, forumPosts] = await Promise.all([
    prisma.bookReflection.findMany({
      where: {
        userId: user.id,
        isPublic: true,
      },
      select: {
        id: true,
        content: true,
        chapterNumber: true,
        createdAt: true,
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
      orderBy: {
        createdAt: 'desc',
      },
      take: 12,
    }),
    prisma.userProgress.findMany({
      where: {
        userId: user.id,
        completed: true,
      },
      select: {
        bookId: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 12,
    }),
    prisma.userAchievement.findMany({
      where: {
        userId: user.id,
      },
      select: {
        achievementId: true,
        unlockedAt: true,
      },
      orderBy: {
        unlockedAt: 'desc',
      },
      take: 6,
    }),
    prisma.forumPost.count({
      where: {
        authorId: user.id,
      },
    }),
  ])

  // Fetch actual books for completed progress
  const bookIds = completedBooks.map(bp => bp.bookId)
  const books = await prisma.book.findMany({
    where: { id: { in: bookIds } },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      author: true,
    },
  })

  // Fetch actual achievements
  const achievementIds = achievements.map(ua => ua.achievementId)
  const achievementDetails = await prisma.achievement.findMany({
    where: { id: { in: achievementIds } },
    select: {
      id: true,
      name: true,
      description: true,
      icon: true,
    },
  })

  // Map books to completed progress
  const booksWithData = completedBooks.map(bp => {
    const book = books.find(b => b.id === bp.bookId)
    return {
      book,
      completedAt: bp.updatedAt,
    }
  }).filter(bp => bp.book)

  // Map achievements to user achievements
  const achievementsWithData = achievements.map(ua => {
    return achievementDetails.find(a => a.id === ua.achievementId)
  }).filter(Boolean)

  // Get community stats for reflections
  const reflectionsWithStats = await Promise.all(
    reflections.map(async (reflection: any) => {
      let stats = { likes: 0, comments: 0 }
      if (reflection.communityPostId) {
        const communityPost = await prisma.forumTopic.findUnique({
          where: { id: reflection.communityPostId },
          select: {
            _count: {
              select: {
                likes: true,
                posts: true,
              },
            },
          },
        })
        if (communityPost) {
          stats = {
            likes: communityPost._count.likes,
            comments: communityPost._count.posts,
          }
        }
      }
      return { ...reflection, stats }
    })
  )

  // Calculate Dynasty Points and Level
  const basePoints = reflections.length * 10
  const booksPoints = completedBooks.length * 50
  const achievementPoints = achievements.length * 25
  const communityPoints = forumPosts * 5
  const totalPoints = basePoints + booksPoints + achievementPoints + communityPoints

  const level = Math.floor(totalPoints / 100) + 1

  return {
    user,
    stats: {
      reflections: reflections.length,
      booksCompleted: completedBooks.length,
      achievements: achievementsWithData.length,
      communityPosts: forumPosts,
      totalPoints,
      level,
    },
    reflections: reflectionsWithStats,
    books: booksWithData,
    achievements: achievementsWithData,
  }
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const username = decodeURIComponent(params.username.replace('@', ''))
  const profile = await getUserProfile(username)

  if (!profile) {
    notFound()
  }

  const { user, stats, reflections, books, achievements } = profile
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      {/* Header */}
      <div className="border-b border-purple-200/50 dark:border-purple-800/50 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-3xl">🏛️</span>
              <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Dynasty Built Academy
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/wisdom">
                <Button variant="outline" size="sm">💎 Wisdom Gallery</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                  Join Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 p-1 shadow-2xl mb-12">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || 'User'}
                    className="w-32 h-32 rounded-full ring-4 ring-purple-400 dark:ring-purple-600 shadow-2xl"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center text-white text-5xl font-bold ring-4 ring-purple-400 shadow-2xl">
                    {(user.name || 'D')[0]?.toUpperCase()}
                  </div>
                )}
                {/* Level Badge */}
                <div className="absolute -bottom-2 -right-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm shadow-lg ring-4 ring-white dark:ring-gray-900">
                  Level {stats.level}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {user.name}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  Dynasty Builder • Member since {memberSince}
                </p>
                
                {/* Stats Row */}
                <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {stats.totalPoints}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Dynasty Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {stats.booksCompleted}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Books Read</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.reflections}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Reflections</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                      {stats.achievements}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Achievements</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        {achievements.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              🏆 Achievements
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {achievements.map((achievement: any) => (
                <Card
                  key={achievement.id}
                  className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-purple-200/50 dark:border-purple-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">
                      {achievement.name}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Books Read Section */}
        {books.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              📚 Books Read ({stats.booksCompleted})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {books.map((bp: any) => (
                <Link
                  key={bp.book.id}
                  href={`/books/${bp.book.slug}`}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    {bp.book.coverImage && (
                      <img
                        src={bp.book.coverImage}
                        alt={bp.book.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    {!bp.book.coverImage && (
                      <div className="w-full h-48 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                        <span className="text-white text-4xl">📖</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <div className="text-white text-xs font-semibold line-clamp-2">
                        {bp.book.title}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reflections Section */}
        {reflections.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              💭 Recent Reflections ({stats.reflections})
            </h2>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {reflections.map((reflection: any) => (
                <Link
                  key={reflection.id}
                  href={`/reflection/${reflection.id}`}
                  className="block break-inside-avoid"
                >
                  <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-purple-200/50 dark:border-purple-800/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2">
                    {/* Animated Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative p-6">
                      {/* Book Badge */}
                      <div className="flex items-start gap-3 mb-4 pb-4 border-b border-purple-200/50 dark:border-purple-800/50">
                        {reflection.book.coverImage && (
                          <img
                            src={reflection.book.coverImage}
                            alt={reflection.book.title}
                            className="w-12 h-16 object-cover rounded-lg shadow-md ring-2 ring-purple-300/50 dark:ring-purple-700/50"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent line-clamp-2">
                            {reflection.book.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Chapter {reflection.chapterNumber}
                          </div>
                        </div>
                      </div>

                      {/* Quote */}
                      <div className="relative mb-4">
                        <div className="absolute -top-2 -left-1 text-4xl text-purple-300/30 dark:text-purple-700/30 font-serif">"</div>
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm pl-4" style={{ fontFamily: 'Georgia, serif' }}>
                          {reflection.content}
                        </p>
                      </div>

                      {/* Engagement Stats */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/50">
                          <span className="text-sm">❤️</span>
                          <span className="text-xs font-bold text-red-600 dark:text-red-400">{reflection.stats.likes}</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/50">
                          <span className="text-sm">💬</span>
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{reflection.stats.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {reflections.length === 0 && books.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📖</div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              {user.name} is just getting started!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Check back soon to see their reading journey unfold.
            </p>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                Start Your Own Journey
              </Button>
            </Link>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            Build Your Own Dynasty 🏛️
          </h2>
          <p className="text-purple-100 text-xl mb-8 max-w-2xl mx-auto">
            Join {user.name} and thousands of other builders reading, reflecting, and transforming their lives.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 font-bold text-xl px-10 py-7 shadow-2xl"
            >
              🚀 Start Free Today
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
