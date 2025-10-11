'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface LeaderboardEntry {
  userId: string
  userName: string
  userImage: string | null
  reflectionsCount: number
  completedBooks: number
  dynastyPoints: number
  level: number
  rank: number
}

interface LeaderboardProps {
  limit?: number
  showFullPage?: boolean
}

export default function ReflectionsLeaderboard({ 
  limit = 10, 
  showFullPage = false 
}: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'all-time' | 'month' | 'week'>('all-time')

  useEffect(() => {
    fetchLeaderboard()
  }, [timeframe, limit])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/leaderboard?timeframe=${timeframe}&limit=${limit}`)
      if (res.ok) {
        const data = await res.json()
        setLeaderboard(data.leaderboard)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return { emoji: '🥇', color: 'from-yellow-400 to-yellow-600', glow: 'shadow-yellow-500/50' }
      case 2:
        return { emoji: '🥈', color: 'from-gray-300 to-gray-500', glow: 'shadow-gray-400/50' }
      case 3:
        return { emoji: '🥉', color: 'from-orange-400 to-orange-600', glow: 'shadow-orange-500/50' }
      default:
        return { emoji: `#${rank}`, color: 'from-purple-400 to-blue-500', glow: 'shadow-purple-500/30' }
    }
  }

  const getRankClass = (rank: number) => {
    if (rank <= 3) return 'scale-105 ring-2 ring-purple-400 ring-offset-2'
    return ''
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20">
        <CardContent className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 dark:from-gray-800 dark:via-purple-900/10 dark:to-blue-900/10 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -ml-48 -mb-48"></div>

      <CardHeader className="relative z-10 border-b border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-3">
            <span className="text-4xl animate-bounce">🏆</span>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Community Leaderboard
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                Top contributors ranked by Dynasty Points
              </p>
            </div>
          </CardTitle>

          {/* Timeframe Selector */}
          <div className="flex gap-2 bg-white dark:bg-gray-900 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setTimeframe('all-time')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                timeframe === 'all-time'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                timeframe === 'month'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                timeframe === 'week'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              This Week
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative z-10">
        {leaderboard.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No rankings yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Be the first to share reflections and claim the top spot!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-purple-100 dark:divide-purple-900/30">
            {leaderboard.map((entry, index) => {
              const badge = getRankBadge(entry.rank)
              const isTopThree = entry.rank <= 3

              return (
                <div
                  key={entry.userId}
                  className={`relative p-6 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all duration-300 ${
                    isTopThree ? 'bg-gradient-to-r from-purple-50/30 to-blue-50/30 dark:from-purple-900/20 dark:to-blue-900/20' : ''
                  }`}
                >
                  {/* Rank Badge */}
                  <div className={`absolute left-6 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-white font-bold shadow-xl ${badge.glow} ${getRankClass(entry.rank)}`}>
                    <span className="text-xl">{badge.emoji}</span>
                  </div>

                  <div className="flex items-center gap-6 ml-20">
                    {/* User Avatar & Info */}
                    <Link 
                      href={`/users/${entry.userId}`}
                      className="flex items-center gap-4 flex-1 min-w-0 group"
                    >
                      {entry.userImage ? (
                        <img
                          src={entry.userImage}
                          alt={entry.userName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-purple-400 shadow-lg group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg border-2 border-purple-400 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {entry.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {entry.userName}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <span className="text-xs">⭐</span>
                            <span>Level {entry.level}</span>
                          </span>
                          <span className="text-gray-300 dark:text-gray-700">•</span>
                          <span className="flex items-center gap-1">
                            <span className="text-xs">📚</span>
                            <span>{entry.completedBooks} books</span>
                          </span>
                        </div>
                      </div>
                    </Link>

                    {/* Stats */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Reflections
                        </div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {entry.reflectionsCount}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Dynasty Points
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          {entry.dynastyPoints.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top 3 Crown Effect */}
                  {isTopThree && (
                    <div className="absolute top-2 right-2 opacity-20 text-6xl">
                      👑
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* View More / Call to Action */}
        {!showFullPage && leaderboard.length > 0 && (
          <div className="p-6 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border-t border-purple-200 dark:border-purple-800">
            <Link
              href="/leaderboard"
              className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
            >
              <div className="flex items-center justify-center gap-2">
                <span>🏆</span>
                <span>View Full Leaderboard</span>
                <span>→</span>
              </div>
            </Link>
          </div>
        )}

        {/* Join Competition CTA */}
        {showFullPage && (
          <div className="p-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Want to join the ranks?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Share your reflections after reading chapters to earn Dynasty Points and climb the leaderboard!
            </p>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <span>📚</span>
              <span>Start Reading</span>
              <span>→</span>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
