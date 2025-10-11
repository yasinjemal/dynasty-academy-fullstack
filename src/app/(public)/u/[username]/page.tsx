import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// Public profile page for Dynasty Built users
type Props = {
  params: Promise<{ username: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const username = decodeURIComponent(params.username)
  
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { name: { equals: username, mode: 'insensitive' } },
        { email: { contains: username, mode: 'insensitive' } },
      ],
    },
    select: {
      name: true,
      image: true,
      _count: {
        select: {
          bookReflections: true,
          completedBooks: true,
        },
      },
    },
  })

  if (!user) {
    return {
      title: 'User Not Found | Dynasty Built',
      description: 'This Dynasty Builder profile does not exist.',
    }
  }

  return {
    title: `${user.name} - Dynasty Builder | Dynasty Built Academy`,
    description: `${user.name} is a Dynasty Builder with ${user._count.completedBooks} books read and ${user._count.bookReflections} reflections shared. Join the community of ambitious readers transforming knowledge into action.`,
    openGraph: {
      title: `${user.name} - Dynasty Builder`,
      description: `${user._count.completedBooks} books read • ${user._count.bookReflections} reflections shared`,
      images: [
        {
          url: `/api/og/profile/${encodeURIComponent(username)}`,
          width: 1200,
          height: 630,
          alt: `${user.name}'s Dynasty Built Profile`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${user.name} - Dynasty Builder`,
      description: `${user._count.completedBooks} books read • ${user._count.bookReflections} reflections shared`,
      images: [`/api/og/profile/${encodeURIComponent(username)}`],
    },
  }
}

async function getUserProfile(username: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { name: { equals: username, mode: 'insensitive' } },
        { email: { contains: username, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      bookReflections: {
        where: {
          isPublic: true,
        },
        select: {
          id: true,
          content: true,
          chapterNumber: true,
          createdAt: true,
          communityPostId: true,
          book: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverImage: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 12,
      },
      completedBooks: {
        select: {
          book: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverImage: true,
            },
          },
        },
        take: 12,
      },
      userAchievements: {
        select: {
          achievement: {
            select: {
              title: true,
              description: true,
              icon: true,
            },
          },
        },
      },
      _count: {
        select: {
          bookReflections: true,
          completedBooks: true,
          forumTopics: true,
          forumPosts: true,
        },
      },
    },
  })

  if (!user) return null

  // Get community engagement stats
  const communityPosts = await prisma.forumTopic.findMany({
    where: {
      bookReflectionId: {
        in: user.bookReflections.map((r) => r.id),
      },
    },
    select: {
      _count: {
        select: {
          likes: true,
          posts: true,
        },
      },
    },
  })

  const totalLikes = communityPosts.reduce((sum, post) => sum + post._count.likes, 0)
  const totalComments = communityPosts.reduce((sum, post) => sum + post._count.posts, 0)

  // Calculate Dynasty Points (same as stats API)
  const reflectionPoints = user._count.bookReflections * 10
  const bookPoints = user._count.completedBooks * 50
  const achievementPoints = user.userAchievements.length * 100
  const totalPoints = reflectionPoints + bookPoints + achievementPoints

  // Calculate level
  const level = Math.floor(totalPoints / 100) + 1

  return {
    ...user,
    stats: {
      totalPoints,
      level,
      totalLikes,
      totalComments,
    },
  }
}

export default async function PublicProfilePage(props: Props) {
  const params = await props.params
  const username = decodeURIComponent(params.username)
  const profile = await getUserProfile(username)

  if (!profile) {
    notFound()
  }

  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/30 dark:to-blue-900/30">
      {/* Header Navigation */}
      <div className="border-b border-purple-200/50 dark:border-purple-800/50 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Dynasty Built
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/wisdom">
                <Button variant="ghost" size="sm">💎 Wisdom</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Join Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Hero */}
        <div className="relative mb-12">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-3xl h-48 blur-3xl opacity-20" />
          
          <Card className="relative border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <CardContent className="p-8 sm:p-12">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {profile.image ? (
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="w-32 h-32 rounded-full ring-4 ring-purple-400/50 dark:ring-purple-600/50 shadow-2xl"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl ring-4 ring-purple-400/50">
                      {profile.name[0]?.toUpperCase()}
                    </div>
                  )}
                  {/* Level Badge */}
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-lg ring-4 ring-white dark:ring-gray-900">
                    Lv {profile.stats.level}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-3">
                    {profile.name}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                    Dynasty Builder • Member since {joinDate}
                  </p>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 rounded-xl p-4 border border-purple-300/50 dark:border-purple-700/50">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {profile.stats.totalPoints}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Dynasty Points
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-xl p-4 border border-blue-300/50 dark:border-blue-700/50">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {profile._count.completedBooks}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Books Read
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/40 dark:to-purple-900/40 rounded-xl p-4 border border-pink-300/50 dark:border-pink-700/50">
                      <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                        {profile._count.bookReflections}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Reflections
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/40 dark:to-yellow-900/40 rounded-xl p-4 border border-orange-300/50 dark:border-orange-700/50">
                      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                        {profile.stats.totalLikes}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Likes Received
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            Start Your Own Dynasty 🏛️
          </h2>
          <p className="text-purple-100 text-xl mb-8 max-w-2xl mx-auto">
            Join {profile.name} and thousands of ambitious readers building their legacy through knowledge and action.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 font-bold text-xl px-10 py-7 shadow-2xl"
            >
              🚀 Join Dynasty Built
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
