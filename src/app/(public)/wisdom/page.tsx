import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Wisdom Gallery - Community Reflections | Dynasty Built',
  description: 'Explore profound reflections and insights from the Dynasty Built community. Discover wisdom shared by thousands of readers transforming knowledge into action.',
  openGraph: {
    title: 'Wisdom Gallery - Community Reflections',
    description: 'Explore profound reflections from the Dynasty Built community',
    images: ['/og-wisdom-gallery.png'],
  },
}

async function getReflections(limit = 50) {
  const reflections = await prisma.bookReflection.findMany({
    where: {
      communityPostId: { not: null },
      isPublic: true,
    },
    select: {
      id: true,
      content: true,
      chapterNumber: true,
      createdAt: true,
      communityPostId: true,
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
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })

  // Get community post data for each reflection
  const reflectionsWithStats = await Promise.all(
    reflections.map(async (reflection) => {
      let communityPost = null
      if (reflection.communityPostId) {
        communityPost = await prisma.forumTopic.findUnique({
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
      }
      return {
        ...reflection,
        communityPost,
      }
    })
  )

  return reflectionsWithStats
}

export default async function WisdomGalleryPage() {
  const reflections = await getReflections(50)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/30 dark:to-blue-900/30">
      {/* Header */}
      <div className="border-b border-purple-200/50 dark:border-purple-800/50 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-3xl">🏛️</span>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Wisdom Gallery
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {reflections.length} reflections from the Dynasty community
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
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

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white text-4xl mb-6 shadow-2xl animate-bounce">
            💡
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Wall of Wisdom
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Discover profound insights shared by builders transforming knowledge into action. Every reflection here represents a mind expanding and a life changing.
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
            <CardContent className="pt-6 text-center">
              <div className="text-5xl mb-2">📚</div>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-300">
                {new Set(reflections.map((r: any) => r.book.id)).size}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Books Discussed
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30">
            <CardContent className="pt-6 text-center">
              <div className="text-5xl mb-2">💭</div>
              <div className="text-3xl font-bold text-pink-900 dark:text-pink-300">
                {reflections.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Reflections Shared
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30">
            <CardContent className="pt-6 text-center">
              <div className="text-5xl mb-2">❤️</div>
              <div className="text-3xl font-bold text-orange-900 dark:text-orange-300">
                {reflections.reduce((sum: number, r: any) => sum + (r.communityPost?._count.likes || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Likes Received
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reflections Grid - AWARD-WINNING Masonry Layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {reflections.map((reflection: any) => {
            const likesCount = reflection.communityPost?._count.likes || 0
            const postsCount = reflection.communityPost?._count.posts || 0

            return (
              <Link
                key={reflection.id}
                href={`/reflection/${reflection.id}`}
                className="block break-inside-avoid"
              >
                <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-purple-200/50 dark:border-purple-800/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2">
                  {/* Animated Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Shimmer Effect on Hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  
                  <div className="relative p-6">
                    {/* Premium Book Badge */}
                    <div className="flex items-start gap-4 mb-5">
                      {reflection.book.coverImage && (
                        <div className="relative flex-shrink-0">
                          <img
                            src={reflection.book.coverImage}
                            alt={reflection.book.title}
                            className="w-14 h-20 object-cover rounded-lg shadow-lg ring-2 ring-purple-300/50 dark:ring-purple-700/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                          />
                          {/* Glow Effect */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 to-blue-600/30 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-1 line-clamp-2 group-hover:from-purple-500 group-hover:to-pink-500 transition-all duration-300">
                          {reflection.book.title}
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 border border-purple-300/50 dark:border-purple-700/50">
                          <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                            📖 Chapter {reflection.chapterNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Magazine-Style Quote */}
                    <div className="relative mb-6">
                      {/* Opening Quote Mark */}
                      <div className="absolute -top-3 -left-2 text-6xl text-purple-300/30 dark:text-purple-700/30 font-serif leading-none">"</div>
                      
                      <p className="relative text-gray-800 dark:text-gray-100 leading-relaxed font-medium text-base pl-4 pr-2 py-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300" style={{ fontFamily: 'Georgia, serif' }}>
                        {reflection.content}
                      </p>
                      
                      {/* Closing Quote Mark */}
                      <div className="absolute -bottom-6 -right-2 text-6xl text-purple-300/30 dark:text-purple-700/30 font-serif leading-none">"</div>
                    </div>

                    {/* Author Card with Premium Style */}
                    <div className="flex items-center justify-between pt-5 mt-6 border-t border-gradient-to-r from-purple-200/50 via-pink-200/50 to-blue-200/50 dark:from-purple-800/50 dark:via-pink-800/50 dark:to-blue-800/50">
                      <div className="flex items-center gap-3">
                        {reflection.user.image ? (
                          <div className="relative">
                            <img
                              src={reflection.user.image}
                              alt={reflection.user.name}
                              className="w-10 h-10 rounded-full ring-2 ring-purple-400/50 dark:ring-purple-600/50 shadow-lg group-hover:ring-4 group-hover:ring-purple-500/50 transition-all duration-300"
                            />
                            {/* Avatar Glow */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600/30 to-blue-600/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-purple-400/50 group-hover:scale-110 transition-transform duration-300">
                              {reflection.user.name[0]?.toUpperCase()}
                            </div>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600/30 to-blue-600/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                            {reflection.user.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Dynasty Builder
                          </div>
                        </div>
                      </div>

                      {/* Engagement Stats with Animations */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border border-red-200/50 dark:border-red-800/50 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-base animate-pulse">❤️</span>
                          <span className="text-sm font-bold text-red-600 dark:text-red-400">{likesCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-800/50 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-base">💬</span>
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{postsCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Premium Corner Accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-600/20 to-blue-600/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-600/20 to-purple-600/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            Share Your Wisdom 🧠
          </h2>
          <p className="text-purple-100 text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of builders reading, reflecting, and transforming their lives. Your next insight could inspire someone's breakthrough.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 font-bold text-xl px-10 py-7 shadow-2xl"
              >
                🏛️ Start Your Dynasty
              </Button>
            </Link>
            <Link href="/books">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-3 border-white text-white hover:bg-white/10 font-bold text-xl px-10 py-7"
              >
                📚 Explore Books
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
