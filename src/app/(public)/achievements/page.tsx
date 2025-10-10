'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  unlocked: boolean
  unlockedAt: string | null
}

export default function AchievementsPage() {
  const { data: session } = useSession()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchAchievements()
    }
  }, [session])

  const fetchAchievements = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/achievements')
      if (res.ok) {
        const data = await res.json()
        setAchievements(data.achievements)
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sign in to view achievements</h2>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading achievements...</p>
        </div>
      </div>
    )
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + (a.xpReward || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/30 dark:to-blue-900/30">
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
              <Link href="/leaderboard"><Button variant="ghost" size="sm" className="text-sm">Leaderboard</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Header Stats */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center text-3xl shadow-2xl animate-bounce">
              🏆
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                Your Achievements
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-1">
                Unlock badges and earn rewards for your accomplishments
              </p>
            </div>
          </div>
          
          {/* Progress Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white">
              <CardContent className="p-6">
                <div className="text-sm opacity-90 mb-1">Unlocked</div>
                <div className="text-4xl font-bold">{unlockedCount}<span className="text-2xl opacity-80">/{achievements.length}</span></div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
              <CardContent className="p-6">
                <div className="text-sm opacity-90 mb-1">Total Points</div>
                <div className="text-4xl font-bold">{totalPoints}<span className="text-lg opacity-80"> XP</span></div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white">
              <CardContent className="p-6">
                <div className="text-sm opacity-90 mb-1">Progress</div>
                <div className="text-4xl font-bold">{Math.round((unlockedCount / achievements.length) * 100)}<span className="text-2xl opacity-80">%</span></div>
              </CardContent>
            </Card>
          </div>

          {/* Animated Progress Bar */}
          <div className="relative">
            <div className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full h-6 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 h-full transition-all duration-1000 ease-out flex items-center justify-end pr-3 relative overflow-hidden"
                style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                <span className="text-white text-xs font-bold drop-shadow-lg relative z-10">
                  {unlockedCount}/{achievements.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <Card 
              key={achievement.id} 
              className={`group relative overflow-hidden transition-all duration-500 hover:scale-105 cursor-pointer ${
                achievement.unlocked 
                  ? 'border-2 border-purple-500 shadow-xl shadow-purple-500/20 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/30' 
                  : 'border-0 shadow-lg bg-gray-100 dark:bg-gray-800/50 opacity-75 grayscale hover:grayscale-0'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Unlock Glow Effect */}
              {achievement.unlocked && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 animate-pulse"></div>
              )}
              
              <CardHeader className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  {/* Icon */}
                  <div className={`relative ${achievement.unlocked ? 'animate-bounce-slow' : ''}`}>
                    <div className={`text-6xl transition-transform duration-300 ${achievement.unlocked ? 'drop-shadow-2xl' : 'drop-shadow-sm'}`}>
                      {achievement.icon}
                    </div>
                    {achievement.unlocked && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-ping-slow">
                        <span className="text-white text-lg absolute">✓</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Status Badge */}
                  {achievement.unlocked ? (
                    <div className="flex flex-col gap-1 items-end">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                        <span>✓</span> Unlocked
                      </div>
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        +{achievement.xpReward} XP
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                      🔒 Locked
                    </div>
                  )}
                </div>
                
                <CardTitle className={`text-xl sm:text-2xl ${achievement.unlocked ? 'bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent' : 'text-gray-700 dark:text-gray-300'}`}>
                  {achievement.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <p className={`text-sm mb-4 ${achievement.unlocked ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                  {achievement.description}
                </p>
                
                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="pt-3 border-t border-purple-200 dark:border-purple-800 flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <span>📅</span> Unlocked
                    </span>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">
                      {new Date(achievement.unlockedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
                
                {!achievement.unlocked && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <span>💎</span> Complete challenges to unlock
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Hover Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {achievements.length === 0 && (
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="py-20 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Achievements Yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Start your journey to unlock amazing badges!</p>
              <Link href="/dashboard" className="mt-6 inline-block">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
