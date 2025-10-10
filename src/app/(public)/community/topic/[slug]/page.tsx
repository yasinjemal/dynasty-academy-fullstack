'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Post {
  id: string
  content: string
  author: {
    id: string
    name: string
    image: string | null
  }
  createdAt: string
  updatedAt: string
  likes: number
  isLiked: boolean
  replies: Post[]
  parentId: string | null
  isAnswer: boolean
}

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
  category: {
    id: string
    name: string
    slug: string
    icon: string
    color: string
  }
  isPinned: boolean
  isLocked: boolean
  viewCount: number
  likes: number
  isLiked: boolean
  isBookmarked: boolean
  createdAt: string
  updatedAt: string
  posts: Post[]
}

export default function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTopic()
  }, [resolvedParams.slug])

  const fetchTopic = async () => {
    try {
      const res = await fetch(`/api/community/topics/${resolvedParams.slug}`)
      if (res.ok) {
        const data = await res.json()
        setTopic(data.topic)
      }
    } catch (error) {
      console.error('Error fetching topic:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLikeTopic = async () => {
    if (status !== 'authenticated') {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`/api/community/topics/${resolvedParams.slug}/like`, {
        method: 'POST',
      })
      if (res.ok) {
        fetchTopic()
      }
    } catch (error) {
      console.error('Error liking topic:', error)
    }
  }

  const handleBookmark = async () => {
    if (status !== 'authenticated') {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`/api/community/topics/${resolvedParams.slug}/bookmark`, {
        method: 'POST',
      })
      if (res.ok) {
        fetchTopic()
      }
    } catch (error) {
      console.error('Error bookmarking:', error)
    }
  }

  const handleLikePost = async (postId: string) => {
    if (status !== 'authenticated') {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
      })
      if (res.ok) {
        fetchTopic()
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleSubmitReply = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault()
    
    if (status !== 'authenticated') {
      router.push('/login')
      return
    }

    if (!replyContent.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/community/topics/${resolvedParams.slug}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent, parentId }),
      })

      if (res.ok) {
        setReplyContent('')
        setReplyingTo(null)
        fetchTopic()
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const renderPost = (post: Post, depth: number = 0) => (
    <div key={post.id} className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-6'}`}>
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all">
        {/* Post Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
            {post.author.image ? (
              <img src={post.author.image} alt={post.author.name} className="w-12 h-12 rounded-full" />
            ) : (
              post.author.name.charAt(0)
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-white">{post.author.name}</span>
              {post.isAnswer && (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">✓ Answer</span>
              )}
              <span className="text-gray-400 text-sm">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="prose prose-invert prose-purple max-w-none mb-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

        {/* Post Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleLikePost(post.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              post.isLiked
                ? 'bg-purple-600/20 text-purple-400'
                : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill={post.isLiked ? 'currentColor' : 'none'} viewBox="0 0 20 20" stroke="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            {post.likes}
          </button>
          
          <button
            onClick={() => setReplyingTo(post.id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700/50 text-gray-400 hover:bg-slate-700 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Reply
          </button>
        </div>

        {/* Reply Form */}
        {replyingTo === post.id && (
          <form onSubmit={(e) => handleSubmitReply(e, post.id)} className="mt-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <Button type="submit" disabled={submitting} size="sm">
                {submitting ? 'Posting...' : 'Post Reply'}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Render nested replies */}
      {post.replies && post.replies.length > 0 && (
        <div className="space-y-4">
          {post.replies.map((reply) => renderPost(reply, depth + 1))}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Topic Not Found</h1>
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/community" className="flex items-center space-x-2 text-gray-300 hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Community</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Topic Header */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl p-8 border border-purple-500/30 mb-8">
          {/* Category & Status Badges */}
          <div className="flex items-center gap-2 mb-4">
            {topic.category && (
              <Link href={`/community/category/${topic.category.slug}`}>
                <span 
                  className="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: `${topic.category.color}20`, color: topic.category.color }}
                >
                  {topic.category.icon} {topic.category.name}
                </span>
              </Link>
            )}
            {topic.isPinned && (
              <span className="px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-xs font-semibold">📌 Pinned</span>
            )}
            {topic.isLocked && (
              <span className="px-2 py-1 bg-red-400/20 text-red-400 rounded-full text-xs font-semibold">🔒 Locked</span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 mb-6">
            {topic.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
              {topic.author.image ? (
                <img src={topic.author.image} alt={topic.author.name} className="w-14 h-14 rounded-full" />
              ) : (
                topic.author.name.charAt(0)
              )}
            </div>
            <div>
              <div className="font-semibold text-white text-lg">{topic.author.name}</div>
              <div className="text-gray-400 text-sm">
                Posted {new Date(topic.createdAt).toLocaleDateString()} • {topic.viewCount} views
              </div>
            </div>
          </div>

          {/* Topic Content */}
          <div className="prose prose-invert prose-purple prose-lg max-w-none mb-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{topic.content}</ReactMarkdown>
          </div>

          {/* Topic Actions */}
          <div className="flex items-center gap-4 pt-6 border-t border-slate-700">
            <button
              onClick={handleLikeTopic}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                topic.isLiked
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/50'
                  : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <svg className="w-5 h-5" fill={topic.isLiked ? 'currentColor' : 'none'} viewBox="0 0 20 20" stroke="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              {topic.likes} Likes
            </button>

            <button
              onClick={handleBookmark}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                topic.isBookmarked
                  ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/50'
                  : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <svg className="w-5 h-5" fill={topic.isBookmarked ? 'currentColor' : 'none'} viewBox="0 0 20 20" stroke="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              {topic.isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>

            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 text-gray-400 hover:bg-slate-700 border border-slate-700 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* Replies Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>💬</span>
            {topic.posts.length} {topic.posts.length === 1 ? 'Reply' : 'Replies'}
          </h2>

          {/* Main Reply Form */}
          {!topic.isLocked && status === 'authenticated' && !replyingTo && (
            <form onSubmit={(e) => handleSubmitReply(e)} className="mb-8">
              <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl p-6 border border-purple-500/20">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                  rows={4}
                />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-400">Markdown supported</span>
                  <Button type="submit" disabled={submitting || !replyContent.trim()}>
                    {submitting ? 'Posting...' : 'Post Reply'}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {status !== 'authenticated' && !topic.isLocked && (
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl p-8 border border-purple-500/20 text-center mb-8">
              <p className="text-gray-300 mb-4">Sign in to join the discussion</p>
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            </div>
          )}

          {topic.isLocked && (
            <div className="bg-gradient-to-br from-red-900/20 to-slate-800/90 rounded-2xl p-6 border border-red-500/20 text-center mb-8">
              <span className="text-2xl mb-2 block">🔒</span>
              <p className="text-gray-300">This topic is locked. No new replies can be posted.</p>
            </div>
          )}

          {/* Render all posts */}
          <div className="space-y-6">
            {topic.posts.map((post) => renderPost(post))}
          </div>

          {topic.posts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-white mb-2">No replies yet</h3>
              <p className="text-gray-400">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
