/**
 * Dynasty Built Academy - Recommendations Dashboard
 * Personalized content recommendations powered by AI algorithms
 */

'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Sparkles, BookOpen, TrendingUp, Clock, Star } from 'lucide-react'

interface Recommendation {
  id: string
  title: string
  type: 'book' | 'blog' | 'topic'
  score: number
  reason: string
  category?: string
  author?: string
  thumbnail?: string
  estimatedTime?: number
}

export default function RecommendationsDashboard() {
  const { data: session } = useSession()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user) return

    fetchRecommendations()
  }, [session])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/recommendations?limit=6')
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }

      const data = await response.json()
      setRecommendations(data.recommendations || [])

    } catch (err) {
      console.error('Error fetching recommendations:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const trackInteraction = async (contentId: string, action: string, contentType: string) => {
    try {
      await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, action, contentType })
      })
    } catch (err) {
      console.error('Error tracking interaction:', err)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book': return <BookOpen className="w-4 h-4" />
      case 'blog': return <Star className="w-4 h-4" />
      case 'topic': return <TrendingUp className="w-4 h-4" />
      default: return <Sparkles className="w-4 h-4" />
    }
  }

  const getTypeLink = (item: Recommendation) => {
    switch (item.type) {
      case 'book': return `/books/${item.id}`
      case 'blog': return `/blog/${item.id}`
      case 'topic': return `/community/topic/${item.id}`
      default: return '#'
    }
  }

  if (!session?.user) {
    return (
      <div className="glass-morphism p-8 rounded-2xl text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-[#FF3CAC]" />
        <h3 className="text-xl font-bold mb-2">Sign in for Personalized Recommendations</h3>
        <p className="text-muted-foreground">
          Our AI-powered recommendation engine creates a unique learning path just for you
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="glass-morphism p-8 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-[#FF3CAC] animate-pulse" />
          <h2 className="text-2xl font-bold">Recommended for You</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-morphism p-6 rounded-xl animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-morphism p-8 rounded-2xl border border-red-500/20">
        <p className="text-red-500">Error loading recommendations: {error}</p>
        <button
          onClick={fetchRecommendations}
          className="mt-4 px-4 py-2 bg-[#FF3CAC] text-white rounded-lg hover:opacity-90 transition"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="glass-morphism p-8 rounded-2xl text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-[#FF3CAC] opacity-50" />
        <h3 className="text-xl font-bold mb-2">No Recommendations Yet</h3>
        <p className="text-muted-foreground mb-4">
          Start exploring content to get personalized recommendations
        </p>
        <Link
          href="/community"
          className="inline-block px-6 py-3 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white rounded-lg hover:opacity-90 transition"
        >
          Explore Community
        </Link>
      </div>
    )
  }

  return (
    <div className="glass-morphism p-8 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[#FF3CAC]" />
          <h2 className="text-2xl font-bold">Recommended for You</h2>
        </div>
        <button
          onClick={fetchRecommendations}
          className="text-sm text-muted-foreground hover:text-foreground transition"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((item) => (
          <Link
            key={item.id}
            href={getTypeLink(item)}
            onClick={() => trackInteraction(item.id, 'view', item.type)}
            className="group glass-morphism p-6 rounded-xl hover:scale-105 transition-all duration-300 hover:shadow-xl"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-[#FF3CAC]">
                {getTypeIcon(item.type)}
                <span className="text-xs font-medium uppercase tracking-wide">
                  {item.type}
                </span>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs font-bold">
                  {(item.score * 100).toFixed(0)}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-bold mb-2 group-hover:text-[#FF3CAC] transition line-clamp-2">
              {item.title}
            </h3>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {item.reason}
            </p>

            {item.estimatedTime && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{item.estimatedTime} min read</span>
              </div>
            )}

            {item.author && (
              <div className="mt-2 text-xs text-muted-foreground">
                by {item.author}
              </div>
            )}

            {item.category && (
              <div className="mt-2">
                <span className="inline-block px-2 py-1 text-xs bg-gradient-to-r from-[#FF3CAC]/20 to-[#784BA0]/20 rounded-full">
                  {item.category}
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
