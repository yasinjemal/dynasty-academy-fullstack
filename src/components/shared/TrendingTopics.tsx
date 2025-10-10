/**
 * Dynasty Built Academy - Trending Topics Widget
 * Real-time trending content powered by time-decay algorithm
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Flame, MessageCircle, Eye, ChevronRight } from 'lucide-react'

interface TrendingItem {
  id: string
  title: string
  category: string
  score: number
  views: number
  replies: number
  author: {
    name: string
    avatar?: string
  }
  createdAt: string
  trendingRank: number
}

interface TrendingTopicsProps {
  category?: string
  limit?: number
  showHeader?: boolean
}

export default function TrendingTopics({ 
  category, 
  limit = 5,
  showHeader = true 
}: TrendingTopicsProps) {
  const [trending, setTrending] = useState<TrendingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTrending()
    
    // Refresh trending every 5 minutes
    const interval = setInterval(fetchTrending, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [category, limit])

  const fetchTrending = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: limit.toString(),
        type: 'posts'
      })

      if (category) {
        params.set('category', category)
      }

      const response = await fetch(`/api/trending?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch trending')
      }

      const data = await response.json()
      setTrending(data.trending || [])

    } catch (err) {
      console.error('Error fetching trending:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMins > 0) return `${diffMins}m ago`
    return 'Just now'
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500'
    if (rank === 2) return 'text-gray-400'
    if (rank === 3) return 'text-orange-500'
    return 'text-muted-foreground'
  }

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  if (loading) {
    return (
      <div className="glass-morphism p-6 rounded-2xl">
        {showHeader && (
          <div className="flex items-center gap-3 mb-6">
            <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
            <h2 className="text-xl font-bold">Trending Now</h2>
          </div>
        )}
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-morphism p-6 rounded-2xl border border-red-500/20">
        <p className="text-sm text-red-500">Failed to load trending</p>
      </div>
    )
  }

  if (trending.length === 0) {
    return (
      <div className="glass-morphism p-6 rounded-2xl">
        {showHeader && (
          <div className="flex items-center gap-3 mb-6">
            <Flame className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold">Trending Now</h2>
          </div>
        )}
        <p className="text-sm text-muted-foreground">No trending topics yet</p>
      </div>
    )
  }

  return (
    <div className="glass-morphism p-6 rounded-2xl">
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold">Trending Now</h2>
          </div>
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
        </div>
      )}

      <div className="space-y-4">
        {trending.map((item, index) => (
          <Link
            key={item.id}
            href={`/community/topic/${item.id}`}
            className="group block"
          >
            <div className="flex gap-4 items-start hover:bg-muted/50 p-3 rounded-lg transition">
              {/* Rank Badge */}
              <div className={`flex-shrink-0 text-2xl font-bold ${getRankColor(item.trendingRank)}`}>
                {getRankEmoji(item.trendingRank)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm group-hover:text-[#FF3CAC] transition line-clamp-2 mb-1">
                  {item.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="px-2 py-0.5 bg-gradient-to-r from-[#FF3CAC]/20 to-[#784BA0]/20 rounded-full">
                    {item.category}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{item.views}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{item.replies}</span>
                  </div>

                  <span>{getTimeAgo(item.createdAt)}</span>
                </div>

                {/* Score indicator */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                      style={{ width: `${Math.min(item.score * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-orange-500">
                    {(item.score * 100).toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[#FF3CAC] group-hover:translate-x-1 transition flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      {!category && (
        <Link
          href="/community?tab=trending"
          className="mt-4 block text-center text-sm text-[#FF3CAC] hover:underline"
        >
          View All Trending →
        </Link>
      )}
    </div>
  )
}
