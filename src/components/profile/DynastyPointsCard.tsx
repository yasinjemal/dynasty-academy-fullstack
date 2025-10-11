'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import ShareDynastyCardModal from '@/components/shared/ShareDynastyCardModal'

interface UserStats {
  reflectionsCount: number
  completedBooks: number
  dynastyPoints: number
  level: number
  nextLevelPoints: number
  achievements: {
    id: string
    title: string
    description: string
    icon: string
    unlockedAt: string
    category: string
  }[]
  recentReflections: {
    id: string
    bookTitle: string
    chapterNumber: number
    createdAt: string
    likesCount: number
  }[]
}

export default function DynastyPointsCard({ userId }: { userId: string }) {
  const { data: session } = useSession()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [userId])

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/stats`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-center h-40">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>Unable to load stats</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const progressPercentage = ((stats.dynastyPoints % stats.nextLevelPoints) / stats.nextLevelPoints) * 100

  return (
    <div className="space-y-6">
      {/* Dynasty Points & Level Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-600 via-blue-600 to-purple-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-900/30 rounded-full blur-3xl -ml-32 -mb-32"></div>
        
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-3xl">👑</span>
              <span>Dynasty Points</span>
            </span>
            <span className="text-sm font-normal opacity-80">Level {stats.level}</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative z-10 space-y-4">
          {/* Points Display */}
          <div className="text-center py-4">
            <div className="text-6xl font-bold mb-2 animate-pulse">
              {stats.dynastyPoints.toLocaleString()}
            </div>
            <div className="text-lg opacity-90">
              Total Points Earned
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm opacity-90">
              <span>Progress to Level {stats.level + 1}</span>
              <span>{stats.dynastyPoints % stats.nextLevelPoints} / {stats.nextLevelPoints}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
              <div className="text-3xl mb-1">📚</div>
              <div className="text-2xl font-bold">{stats.completedBooks}</div>
              <div className="text-xs opacity-80">Books Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
              <div className="text-3xl mb-1">💭</div>
              <div className="text-2xl font-bold">{stats.reflectionsCount}</div>
              <div className="text-xs opacity-80">Reflections Shared</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Link 
              href="/leaderboard"
              className="block bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">🏆</span>
                <span className="text-sm font-semibold">Leaderboard</span>
              </div>
            </Link>
            
            <Button
              onClick={() => setShowShareModal(true)}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 font-bold rounded-xl p-4 h-auto transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">🎯</span>
                <span className="text-sm">Share Progress</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Card */}
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-2xl">🏅</span>
              <span>Achievements</span>
            </span>
            <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
              {stats.achievements.length} Unlocked
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.achievements.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-3">🎯</div>
              <p className="font-semibold mb-1">No achievements yet</p>
              <p className="text-sm">Start reading and sharing reflections to earn badges!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-4xl flex-shrink-0 animate-bounce">
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {achievement.title}
                      </h4>
                      <span className="px-2 py-1 text-xs bg-purple-600 text-white rounded-full whitespace-nowrap">
                        {achievement.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-1">
                      <span>🎉</span>
                      <span>Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reflections Card */}
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-2xl">💡</span>
              <span>Recent Reflections</span>
            </span>
            <Link 
              href="/community?filter=my-reflections"
              className="text-sm font-normal text-purple-600 dark:text-purple-400 hover:underline"
            >
              View All
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentReflections.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-3">📝</div>
              <p className="font-semibold mb-1">No reflections yet</p>
              <p className="text-sm">Share your insights after reading a chapter!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentReflections.map((reflection) => (
                <div 
                  key={reflection.id}
                  className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {reflection.bookTitle}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Chapter {reflection.chapterNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1 text-pink-600 dark:text-pink-400">
                        <span>❤️</span>
                        <span className="text-sm font-semibold">{reflection.likesCount}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(reflection.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Reflection CTA */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link 
              href="/books"
              className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl p-4 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="flex items-center justify-center gap-2">
                <span>📚</span>
                <span>Continue Reading & Reflecting</span>
                <span>→</span>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Points Breakdown Info */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span>💎</span>
            <span>How to Earn Points</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <span className="text-gray-700 dark:text-gray-300">Share a reflection</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">+10 pts</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <span className="text-gray-700 dark:text-gray-300">Complete a book</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">+50 pts</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <span className="text-gray-700 dark:text-gray-300">Receive a like on reflection</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">+2 pts</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <span className="text-gray-700 dark:text-gray-300">Unlock an achievement</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">+25 pts</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Dynasty Card Modal */}
      {showShareModal && stats && session?.user && (
        <ShareDynastyCardModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          userId={userId}
          userName={session.user.name || 'Builder'}
          level={stats.level}
          dynastyPoints={stats.dynastyPoints}
        />
      )}
    </div>
  )
}
