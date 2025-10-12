import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/db/prisma'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// URL normalization helper
function normalizeUsername(username: string): string {
  return decodeURIComponent(username)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .trim()
}

// Fetch user profile data
async function getUserProfile(username: string) {
  const decodedUsername = decodeURIComponent(username)
  const normalizedWithSpaces = decodedUsername.replace(/-/g, ' ').trim()
  
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { name: decodedUsername },
        { name: normalizedWithSpaces },
        { email: decodedUsername },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      createdAt: true,
      userProgress: {
        select: {
          xp: true,
          level: true,
        },
      },
      reflections: {
        where: { isPublic: true },
        select: {
          id: true,
          content: true,
          createdAt: true,
          book: {
            select: {
              id: true,
              title: true,
              coverImage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      achievements: {
        select: {
          id: true,
          achievement: {
            select: {
              id: true,
              name: true,
              description: true,
              icon: true,
            },
          },
        },
      },
    },
  })

  if (!user) return null

  // Get books read count
  const booksRead = await prisma.userProgress.count({
    where: {
      userId: user.id,
      progress: 100,
    },
  })

  // Calculate total stats
  const totalXP = user.userProgress.reduce((sum, prog) => sum + (prog.xp || 0), 0)
  const level = user.userProgress[0]?.level || 1

  return {
    ...user,
    stats: {
      level,
      xp: totalXP,
      booksRead,
      reflections: user.reflections.length,
      achievements: user.achievements.length,
    },
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { username: string }
}): Promise<Metadata> {
  const profile = await getUserProfile(params.username)

  if (!profile) {
    return {
      title: 'User Not Found | Dynasty Built Academy',
    }
  }

  const urlFriendlyUsername = normalizeUsername(params.username)
  const profileUrl = `https://dynastybuilt.com/u/${urlFriendlyUsername}`

  return {
    title: `${profile.name || 'User'}'s Dynasty Profile | Dynasty Built Academy`,
    description: `${profile.name || 'User'} - Level ${profile.stats.level} Builder with ${profile.stats.booksRead} books read and ${profile.stats.reflections} reflections shared. Join their reading journey on Dynasty Built Academy.`,
    openGraph: {
      title: `${profile.name || 'User'}'s Dynasty Profile`,
      description: `Level ${profile.stats.level} • ${profile.stats.booksRead} Books • ${profile.stats.reflections} Reflections`,
      url: profileUrl,
      siteName: 'Dynasty Built Academy',
      type: 'profile',
      images: [
        {
          url: `/api/og/profile/${urlFriendlyUsername}`,
          width: 1200,
          height: 630,
          alt: `${profile.name || 'User'}'s Dynasty Profile`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${profile.name || 'User'}'s Dynasty Profile`,
      description: `Level ${profile.stats.level} • ${profile.stats.booksRead} Books • ${profile.stats.reflections} Reflections`,
      images: [`/api/og/profile/${urlFriendlyUsername}`],
    },
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const profile = await getUserProfile(params.username)

  if (!profile) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-purple-600 p-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  {profile.image ? (
                    <Image
                      src={profile.image}
                      alt={profile.name || 'User'}
                      width={128}
                      height={128}
                      className="rounded-full border-4 border-purple-500"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center border-4 border-purple-500">
                      <span className="text-5xl">
                        {profile.name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  {/* Level Badge */}
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-lg">
                    <span className="text-sm font-bold text-white">
                      {profile.stats.level}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {profile.name || 'Anonymous Builder'}
                  </h1>
                  {profile.bio && (
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                      {profile.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
                        ⚡ {profile.stats.xp} XP
                      </span>
                    </div>
                    <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        📚 {profile.stats.booksRead} Books
                      </span>
                    </div>
                    <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <span className="text-sm font-medium text-green-900 dark:text-green-300">
                        💭 {profile.stats.reflections} Reflections
                      </span>
                    </div>
                    <div className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                      <span className="text-sm font-medium text-yellow-900 dark:text-yellow-300">
                        🏆 {profile.stats.achievements} Achievements
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col gap-3">
                  <Link href="/register">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 whitespace-nowrap">
                      Build Your Dynasty →
                    </Button>
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Achievements Grid */}
        {profile.achievements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>🏆</span> Achievements Unlocked
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {profile.achievements.map(({ achievement }) => (
                <Card
                  key={achievement.id}
                  className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 hover:scale-105 transition-transform cursor-pointer"
                  title={achievement.description || ''}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <div className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2">
                      {achievement.name}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Public Reflections */}
        {profile.reflections.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>💭</span> Public Reflections
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.reflections.map((reflection) => (
                <Card
                  key={reflection.id}
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 overflow-hidden"
                >
                  {reflection.book?.coverImage && (
                    <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
                      <Image
                        src={reflection.book.coverImage}
                        alt={reflection.book.title || 'Book cover'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {reflection.book && (
                      <div className="mb-3">
                        <Link
                          href={`/books/${reflection.book.id}`}
                          className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          {reflection.book.title}
                        </Link>
                      </div>
                    )}
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-4">
                      {reflection.content}
                    </p>
                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(reflection.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {profile.reflections.length === 0 && profile.achievements.length === 0 && (
          <Card className="border-0 shadow-lg p-12 text-center bg-white dark:bg-gray-800">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Just Getting Started
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {profile.name || 'This builder'} is beginning their Dynasty journey. Follow along as they share reflections and unlock achievements.
            </p>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Start Your Own Journey →
              </Button>
            </Link>
          </Card>
        )}

        {/* Bottom CTA */}
        <div className="mt-12">
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 p-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-8 text-center">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Ready to Build Your Dynasty?
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                Join {profile.name || 'this builder'} and thousands of others on a transformative reading journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/books">
                  <Button size="lg" variant="outline">
                    Browse Books
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
