'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Users, ThumbsUp, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface CommunityReflection {
  id: string
  content: string
  author: {
    name: string
    image: string | null
  }
  communityPost: {
    id: string
    slug: string
    viewCount: number
    _count: {
      likes: number
      posts: number
    }
  } | null
  createdAt: string
}

interface CommunityInsightsProps {
  bookId: string
  bookSlug: string
  chapterNumber: number
}

export default function CommunityInsights({ bookId, bookSlug, chapterNumber }: CommunityInsightsProps) {
  const [reflections, setReflections] = useState<CommunityReflection[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchReflections()
  }, [bookId, chapterNumber])

  const fetchReflections = async () => {
    try {
      const res = await fetch(`/api/community/reflections/public?bookId=${bookId}&chapterNumber=${chapterNumber}&limit=3`)
      if (!res.ok) throw new Error('Failed to fetch reflections')
      
      const data = await res.json()
      setReflections(data.reflections || [])
      setTotalCount(data.total || 0)
    } catch (error) {
      console.error('Error fetching community insights:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="my-8 p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Loading Community Insights...
          </h3>
        </div>
      </div>
    )
  }

  if (totalCount === 0) {
    return (
      <div className="my-8 p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Community Insights
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Be the first to share your reflection on this chapter!
        </p>
        <div className="text-center py-4 opacity-60">
          <MessageCircle className="w-12 h-12 mx-auto mb-2 text-purple-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No reflections yet
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="my-8 p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Community Insights
          </h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full">
            {totalCount} {totalCount === 1 ? 'reflection' : 'reflections'}
          </span>
        </div>
      </div>

      {/* Reflections List */}
      <div className="space-y-4">
        {reflections.map((reflection) => (
          <div
            key={reflection.id}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900/50 hover:shadow-md transition-shadow"
          >
            {/* Author */}
            <div className="flex items-center gap-2 mb-2">
              {reflection.author.image ? (
                <img
                  src={reflection.author.image}
                  alt={reflection.author.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-sm font-semibold">
                  {reflection.author.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {reflection.author.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(reflection.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Content */}
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
              {reflection.content}
            </p>

            {/* Footer with stats and link */}
            {reflection.communityPost && (
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {reflection.communityPost._count.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {reflection.communityPost._count.posts}
                  </span>
                </div>
                <Link
                  href={`/community/topic/${reflection.communityPost.slug}`}
                  className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                >
                  View discussion →
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View All Link */}
      {totalCount > 3 && (
        <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
          <Link
            href={`/books/${bookSlug}/reflections?chapter=${chapterNumber}`}
            className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center justify-center gap-1"
          >
            <span>View all {totalCount} reflections</span>
            <span>→</span>
          </Link>
        </div>
      )}
    </div>
  )
}
