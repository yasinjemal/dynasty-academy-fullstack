'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, Loader2, TrendingUp, Users, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedItem, type FeedItemData } from '@/components/community/FeedItem';
import { CreatePostModal } from '@/components/community/CreatePostModal';
import { useToast } from '@/hooks/use-toast';

type Tab = 'hot' | 'following' | 'topic';

export default function CommunityPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [stats, setStats] = useState<Stats>({ totalTopics: 0, totalPosts: 0, activeUsers: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCommunityData()
  }, [])

  const fetchCommunityData = async () => {
    try {
      const [communityRes, topicsRes] = await Promise.all([
        fetch('/api/community'),
        fetch('/api/community/topics?limit=5'),
      ])
      
      const communityData = await communityRes.json()
      const topicsData = await topicsRes.json()
      
      setCategories(communityData.categories || [])
      setStats(communityData.stats || { totalTopics: 0, totalPosts: 0, activeUsers: 0 })
      setTopics(topicsData.topics || [])
    } catch (error) {
      console.error('Error fetching community data:', error)
      // Fallback to empty arrays if API fails
      setCategories([])
      setTopics([])
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Navigation */}
      <nav className="border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                <span className="text-white font-bold text-xl">DB</span>
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Dynasty Built Academy
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">Dashboard</Button>
              </Link>
              {status === 'authenticated' ? (
                <Link href="/community/new">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    + Start Discussion
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-900/50 to-green-900/50 border border-purple-500/30 rounded-full backdrop-blur-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
            <span className="text-sm text-purple-200 font-medium">{stats.activeUsers} members online</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-green-200 mb-4">
            Dynasty Community 🌟
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Connect with fellow learners, share ideas, and grow together
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{stats.totalTopics}</div>
              <div className="text-sm text-gray-400">Discussions</div>
            </div>
            <div className="h-12 w-px bg-purple-500/30"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{stats.totalPosts}</div>
              <div className="text-sm text-gray-400">Posts</div>
            </div>
            <div className="h-12 w-px bg-purple-500/30"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{stats.activeUsers}</div>
              <div className="text-sm text-gray-400">Active Users</div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-3xl">📂</span>
            Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/community/category/${category.slug}`}>
                <div className="group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden">
                  {/* Animated Border */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-[-2px] bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-sm animate-pulse" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="text-4xl w-14 h-14 flex items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {category.icon}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{category.topicCount}</div>
                        <div className="text-xs text-gray-400">Topics</div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 transition-all">
                      {category.name}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                        </svg>
                        {category.postCount} posts
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Topics */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">🔥</span>
              Recent Discussions
            </h2>
            <select className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white text-sm">
              <option>Latest Activity</option>
              <option>Most Replies</option>
              <option>Most Liked</option>
              <option>Trending</option>
            </select>
          </div>

          <div className="space-y-4">
            {topics.map((topic) => (
              <Link key={topic.id} href={`/community/topic/${topic.slug}`}>
                <div className="group bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {topic.author.name?.charAt(0) || 'U'}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {topic.isPinned && (
                          <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-400 rounded-full text-xs font-semibold">📌 Pinned</span>
                        )}
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs">{topic.category.name}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                        {topic.title}
                      </h3>
                      
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{topic.content}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-400">
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
                          {topic.views} views
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
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-2xl font-bold text-white mb-2">No discussions yet</h3>
              <p className="text-gray-400 mb-6">Be the first to start a conversation!</p>
              {status === 'authenticated' && (
                <Link href="/community/new">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600">Start First Discussion</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
