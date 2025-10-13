'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Topic {
  id: string
  title: string
  slug: string
  content: string
  author: {
    id: string
    name: string
    image: string | null
  }
  isPinned: boolean
  isLocked: boolean
  viewCount: number
  likes: number
  replies: number
  createdAt: string
}

interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  topicCount: number
  postCount: number
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategoryData()
  }, [resolvedParams.slug])

  const fetchCategoryData = async () => {
    try {
      // Fetch category info
      const categoryRes = await fetch('/api/community')
      if (categoryRes.ok) {
        const { categories } = await categoryRes.json()
        const foundCategory = categories.find((cat: Category) => cat.slug === resolvedParams.slug)
        
        if (foundCategory) {
          setCategory(foundCategory)
          
          // Fetch topics for this category
          const topicsRes = await fetch(`/api/community/topics?category=${resolvedParams.slug}&limit=50`)
          if (topicsRes.ok) {
            const topicsData = await topicsRes.json()
            setTopics(topicsData.topics || [])
          }
        }
      }
    } catch (error) {
      console.error('Error fetching category:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Category Not Found</h1>
          <Link href="/community">
            <Button>Back to Community</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Navigation */}
      <nav className="border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/community" className="flex items-center space-x-2 text-gray-300 hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Community</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/community/new">
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
                  + New Discussion
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Category Header */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl p-8 border border-purple-500/30 mb-8">
          <div className="flex items-start gap-6">
            <div 
              className="text-6xl w-20 h-20 flex items-center justify-center rounded-2xl flex-shrink-0"
              style={{ backgroundColor: `${category.color}20` }}
            >
              {category.icon}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 mb-3">
                {category.name}
              </h1>
              <p className="text-xl text-gray-300 mb-4">{category.description}</p>
              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center gap-2 text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                  <span className="font-semibold text-white">{category.topicCount}</span> discussions
                </span>
                <span className="flex items-center gap-2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-semibold text-white">{category.postCount}</span> posts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sort & Filter */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">All Discussions</h2>
          <select className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm">
            <option>Latest Activity</option>
            <option>Most Replies</option>
            <option>Most Liked</option>
            <option>Most Viewed</option>
          </select>
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          {topics.map((topic) => (
            <Link key={topic.id} href={`/community/topic/${topic.slug}`}>
              <div className="group bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {topic.author.image ? (
                      <img src={topic.author.image} alt={topic.author.name} className="w-12 h-12 rounded-full" />
                    ) : (
                      topic.author.name.charAt(0)
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {topic.isPinned && (
                        <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-400 rounded-full text-xs font-semibold">📌 Pinned</span>
                      )}
                      {topic.isLocked && (
                        <span className="px-2 py-0.5 bg-red-400/20 text-red-400 rounded-full text-xs font-semibold">🔒 Locked</span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {topic.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{topic.content}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <span className="font-medium text-gray-300">{topic.author.name}</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {topic.replies} replies
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {topic.viewCount} views
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        {topic.likes}
                      </span>
                      <span className="ml-auto text-xs">{new Date(topic.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {topics.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">{category.icon}</div>
            <h3 className="text-2xl font-bold text-white mb-2">No discussions yet</h3>
            <p className="text-gray-400 mb-6">Be the first to start a conversation in this category!</p>
            {session && (
              <Link href="/community/new">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600">Start First Discussion</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
