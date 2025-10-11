'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface LeaderboardUser {
  id: string
  name: string
  email: string
  image: string | null
  activityScore: number
  level: number
  rank: number
  _count: {
    orders: number
    blogPosts: number
    comments: number
    likes: number
    followers: number
  }
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/leaderboard?limit=50')
      if (res.ok) {
        const data = await res.json()
        setLeaderboard(data.leaderboard)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500'
    if (rank === 2) return 'text-gray-400'
    if (rank === 3) return 'text-orange-600'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '👑'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return ''
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-orange-900/20 dark:to-red-900/20">
      {/* Navigation */}
      <nav className="border-b border-white/20 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">DB</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dynasty Built
              </span>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/dashboard"><Button variant="ghost" size="sm" className="text-sm">Dashboard</Button></Link>
              <Link href="/achievements"><Button variant="ghost" size="sm" className="text-sm">Achievements</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center text-3xl shadow-2xl animate-bounce-slow">
              🏆
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Leaderboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Top members ranked by activity and contributions
          </p>
        </div>

        {/* 3D Podium for Top 3 */}
        {leaderboard.length >= 3 && (
          <div className="mb-16 perspective-1000">
            <div className="flex items-end justify-center gap-2 sm:gap-6">
              {/* 2nd Place */}
              <div className="flex-1 max-w-[180px]">
                <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-800 transform hover:scale-105 transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500"></div>
                  <CardContent className="pt-6 pb-8 text-center relative">
                    <div className="absolute top-2 right-2 text-4xl opacity-20">🥈</div>
                    <div className="relative">
                      {leaderboard[1]?.image ? (
                        <img src={leaderboard[1].image} alt={leaderboard[1]?.name || 'User'} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-gray-300 shadow-xl" />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-2xl border-4 border-gray-300 shadow-xl">
                          {leaderboard[1]?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-white">
                        2
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate px-2">{leaderboard[1]?.name || 'User'}</h3>
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-600 text-xs font-semibold mb-2">
                      ⭐ Level {leaderboard[1]?.level || 0}
                    </div>
                    <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
                      {leaderboard[1]?.activityScore || 0} pts
                    </div>
                  </CardContent>
                </Card>
                <div className="h-20 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-b-xl shadow-xl"></div>
              </div>

              {/* 1st Place - Taller Podium */}
              <div className="flex-1 max-w-[200px]">
                <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-yellow-200 via-yellow-400 to-orange-500 transform hover:scale-110 transition-all duration-500 hover:-translate-y-3">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500 animate-shimmer"></div>
                  <CardContent className="pt-6 pb-8 text-center relative">
                    <div className="absolute top-2 right-2 text-5xl opacity-20 animate-pulse">👑</div>
                    <div className="relative">
                      {leaderboard[0]?.image ? (
                        <img src={leaderboard[0].image} alt={leaderboard[0]?.name || 'User'} className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-4 border-yellow-300 shadow-2xl" />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-3xl border-4 border-yellow-300 shadow-2xl">
                          {leaderboard[0]?.name?.[0]?.toUpperCase() || '👑'}
                        </div>
                      )}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-3xl shadow-2xl border-2 border-white animate-ping-slow">
                        1
                      </div>
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-1 truncate px-2">{leaderboard[0]?.name || 'Champion'}</h3>
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/50 text-sm font-bold mb-2">
                      ⭐ Level {leaderboard[0]?.level || 0}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {leaderboard[0]?.activityScore || 0} pts
                    </div>
                  </CardContent>
                </Card>
                <div className="h-32 bg-gradient-to-b from-yellow-300 via-yellow-400 to-orange-500 rounded-b-xl shadow-2xl"></div>
              </div>

              {/* 3rd Place */}
              <div className="flex-1 max-w-[180px]">
                <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-orange-100 to-orange-400 dark:from-orange-800 dark:to-orange-900 transform hover:scale-105 transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-300 via-orange-400 to-red-500"></div>
                  <CardContent className="pt-6 pb-8 text-center relative">
                    <div className="absolute top-2 right-2 text-4xl opacity-20">🥉</div>
                    <div className="relative">
                      {leaderboard[2]?.image ? (
                        <img src={leaderboard[2].image} alt={leaderboard[2]?.name || 'User'} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 border-orange-300 shadow-xl" />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-2xl border-4 border-orange-300 shadow-xl">
                          {leaderboard[2]?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-white">
                        3
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate px-2">{leaderboard[2]?.name || 'User'}</h3>
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/50 dark:bg-gray-700 text-xs font-semibold mb-2">
                      ⭐ Level {leaderboard[2]?.level || 0}
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {leaderboard[2]?.activityScore || 0} pts
                    </div>
                  </CardContent>
                </Card>
                <div className="h-16 bg-gradient-to-b from-orange-200 to-orange-400 dark:from-orange-800 dark:to-orange-900 rounded-b-xl shadow-xl"></div>
              </div>
            </div>
          </div>
        )}

        {/* All Rankings */}
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white">
                📊
              </div>
              <CardTitle className="text-xl sm:text-2xl">Complete Rankings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <div
                  key={user.id || `user-${index}`}
                  className={`group flex items-center gap-3 sm:gap-6 p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer ${
                    user.rank <= 3 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700' 
                      : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* Rank */}
                  <div className={`flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl font-bold shadow-lg ${
                    user.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-2xl' :
                    user.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white text-xl' :
                    user.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white text-xl' :
                    'bg-gradient-to-br from-purple-600 to-blue-600 text-white text-lg'
                  }`}>
                    {getRankIcon(user.rank) || `#${user.rank}`}
                  </div>

                  {/* Avatar */}
                  {user.image ? (
                    <img src={user.image} alt={user.name || 'User'} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white shadow-lg" />
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl border-2 border-white shadow-lg">
                      {user.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white truncate">{user.name || 'Anonymous'}</h3>
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <span className="flex items-center gap-1">🛒 {user._count?.orders || 0}</span>
                      <span className="flex items-center gap-1">📝 {user._count?.blogPosts || 0}</span>
                      <span className="flex items-center gap-1">💬 {user._count?.comments || 0}</span>
                      <span className="flex items-center gap-1">❤️ {user._count?.likes || 0}</span>
                      <span className="flex items-center gap-1">👥 {user._count?.followers || 0}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-bold mb-1">
                      ⭐ Lv. {user.level}
                    </div>
                    <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {user.activityScore}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">points</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {leaderboard.length === 0 && (
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="py-20 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Leaderboard Empty</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Be the first to climb the ranks!</p>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
