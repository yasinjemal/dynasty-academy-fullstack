'use client'

import { use, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Author {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  category: string
  tags: string[]
  readTime: string | null
  viewCount: number
  publishedAt: Date | null
  featured: boolean
  createdAt: Date
  author: Author
  _count: {
    likes: number
    comments: number
  }
}

interface Comment {
  id: string
  content: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
  }
  replies?: Comment[]
}

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentCount, setCommentCount] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Fetch blog post
  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/blog/${slug}`)
        if (!res.ok) {
          notFound()
        }
        const data = await res.json()
        setPost(data)
        setLikeCount(data._count.likes)
        setCommentCount(data._count.comments)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching post:', error)
        setLoading(false)
      }
    }
    fetchPost()
  }, [slug])

  // Fetch like status
  useEffect(() => {
    async function checkLiked() {
      if (!session) return
      try {
        const res = await fetch(`/api/blog/${slug}/like`)
        const data = await res.json()
        setLiked(data.liked)
      } catch (error) {
        console.error('Error checking like:', error)
      }
    }
    checkLiked()
  }, [slug, session])

  // Fetch comments
  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`/api/blog/${slug}/comments`)
        const data = await res.json()
        setComments(data.comments || [])
      } catch (error) {
        console.error('Error fetching comments:', error)
      }
    }
    fetchComments()
  }, [slug])

  const handleLike = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`/api/blog/${slug}/like`, {
        method: 'POST',
      })
      const data = await res.json()
      setLiked(data.liked)
      setLikeCount(prev => data.liked ? prev + 1 : prev - 1)
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      router.push('/login')
      return
    }

    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/blog/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          parentId: replyTo,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (replyTo) {
          // Refresh comments to show new reply
          const commentsRes = await fetch(`/api/blog/${slug}/comments`)
          const commentsData = await commentsRes.json()
          setComments(commentsData.comments || [])
        } else {
          setComments(prev => [data.comment, ...prev])
        }
        setNewComment('')
        setReplyTo(null)
        setCommentCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleShare = async (platform: string) => {
    const url = window.location.href
    const title = post?.title || 'Check out this article'

    const shareUrls: { [key: string]: string } = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
      copy: url,
    }

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
      } catch (error) {
        console.error('Error copying link:', error)
      }
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Hero Section with Cover Image */}
      <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
        {post.coverImage ? (
          <>
            <div className="absolute inset-0">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover scale-105 transition-transform duration-700 hover:scale-110"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-blue-900/30 mix-blend-overlay" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-900" />
        )}
        
        {/* Floating Particles Effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '4s' }} />
        </div>

        {/* Title Overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full relative z-10">
            <div className="space-y-6 animate-fade-in">
              {/* Category & Featured Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="group relative px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full text-sm font-semibold shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80 transition-all duration-300 hover:scale-105 cursor-pointer border border-purple-400/30">
                  <span className="relative z-10">{post.category}</span>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
                </span>
                {post.featured && (
                  <span className="group relative px-5 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 rounded-full text-sm font-bold shadow-lg shadow-yellow-500/50 hover:shadow-yellow-500/80 transition-all duration-300 hover:scale-105 cursor-pointer flex items-center gap-2 border border-yellow-300/50">
                    <svg className="w-4 h-4 animate-spin-slow" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Featured
                  </span>
                )}
              </div>

              {/* Title with Gradient */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200 drop-shadow-2xl leading-tight">
                {post.title}
              </h1>

              {/* Decorative Line */}
              <div className="flex items-center gap-4">
                <div className="h-1 w-20 bg-gradient-to-r from-yellow-400 to-purple-600 rounded-full" />
                <div className="h-1 w-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full" />
                <div className="h-1 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Author Info & Meta - Premium Card */}
        <div className="mb-8 group">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-purple-500/20 shadow-2xl shadow-purple-900/20 hover:shadow-purple-500/30 transition-all duration-500">
            {/* Glassmorphism Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 backdrop-blur-sm" />
            
            {/* Animated Border Gradient */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-[-2px] bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-2xl blur-sm animate-pulse" />
            </div>

            <div className="relative p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Author Section */}
                <div className="flex items-center gap-5">
                  <div className="relative group/avatar">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-purple-600 to-blue-600 rounded-full blur opacity-75 group-hover/avatar:opacity-100 transition duration-1000 animate-pulse" />
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-slate-900 shadow-xl">
                      {post.author.image ? (
                        <img
                          src={post.author.image}
                          alt={post.author.name || 'Author'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                          <span className="text-white font-bold text-3xl">
                            {post.author.name?.charAt(0).toUpperCase() || 'A'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-white text-xl tracking-tight">
                      {post.author.name || 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(post.publishedAt!).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                  {/* Read Time */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-purple-500/50 transition-colors">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-300">{post.readTime || '5 min'}</span>
                  </div>

                  {/* Views */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-blue-500/50 transition-colors">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-300">{post.viewCount}</span>
                  </div>

                  {/* Likes */}
                  <button
                    onClick={handleLike}
                    className={`group/like flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border transition-all duration-300 hover:scale-105 ${
                      liked 
                        ? 'border-red-500/50 bg-red-500/10' 
                        : 'border-slate-700/50 hover:border-red-500/50'
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 transition-all duration-300 ${
                        liked 
                          ? 'text-red-500 scale-110' 
                          : 'text-gray-400 group-hover/like:text-red-400 group-hover/like:scale-110'
                      }`}
                      fill={liked ? 'currentColor' : 'none'}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className={`text-sm font-medium ${liked ? 'text-red-400' : 'text-gray-300'}`}>
                      {likeCount}
                    </span>
                  </button>

                  {/* Comments */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-purple-500/50 transition-colors">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-300">{commentCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Excerpt - Highlighted Quote */}
        {post.excerpt && (
          <div className="mb-8 group/excerpt">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-purple-900/30 border border-purple-500/30 p-8 shadow-xl shadow-purple-900/20">
              {/* Decorative Quote Icon */}
              <div className="absolute top-4 left-4 opacity-10 group-hover/excerpt:opacity-20 transition-opacity">
                <svg className="w-16 h-16 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {/* Gradient Border Effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/excerpt:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-[-1px] bg-gradient-to-r from-yellow-400 via-purple-600 to-blue-600 rounded-2xl blur" />
              </div>

              <div className="relative z-10">
                <p className="text-xl md:text-2xl text-gray-200 italic leading-relaxed font-light">
                  "{post.excerpt}"
                </p>
                <div className="mt-4 h-1 w-24 bg-gradient-to-r from-yellow-400 to-purple-600 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Premium Article Card */}
        <div className="mb-8 group/content">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border border-slate-700/50 shadow-2xl backdrop-blur-sm">
            {/* Subtle Pattern Background */}
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(147, 51, 234) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            <div className="relative z-10 p-8 md:p-12">
              <div className="markdown-body text-gray-300 leading-relaxed">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-4xl font-bold text-white mt-8 mb-4">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-3xl font-bold text-white mt-6 mb-3">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-2xl font-bold text-white mt-5 mb-2">{children}</h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className="text-xl font-semibold text-white mt-4 mb-2">{children}</h4>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 leading-relaxed">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-yellow-400 font-bold">{children}</strong>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside ml-6 mb-4 space-y-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside ml-6 mb-4 space-y-2">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed">{children}</li>
                    ),
                    a: ({ href, children }) => (
                      <a 
                        href={href} 
                        className="text-purple-400 hover:text-purple-300 underline transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    code: ({ inline, children }: any) => (
                      inline ? (
                        <code className="px-2 py-1 bg-gray-800 text-purple-400 rounded text-sm font-mono">
                          {children}
                        </code>
                      ) : (
                        <code className="block p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto font-mono text-sm">
                          {children}
                        </code>
                      )
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-purple-600 pl-4 py-2 my-4 bg-purple-900/20 italic text-gray-300">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>

        {/* Tags - Stylish Badge Cloud */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 border border-slate-700/50 p-8 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Tags
              </h3>
              <div className="flex flex-wrap gap-3">
                {post.tags.map((tag, index) => (
                  <span
                    key={tag}
                    className="group/tag relative px-5 py-2.5 bg-gradient-to-r from-slate-800 to-slate-700 text-gray-200 rounded-xl text-sm font-medium border border-slate-600/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg hover:shadow-purple-500/20"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="text-purple-400">#</span>
                      {tag}
                    </span>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-blue-600/0 opacity-0 group-hover/tag:opacity-100 transition-opacity duration-300" />
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Share Section - Premium Social Share */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/80 via-purple-900/20 to-slate-900/80 border border-purple-500/30 p-8 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Back to Blog Button */}
              <Link href="/blog" className="w-full lg:w-auto">
                <button className="group relative w-full lg:w-auto px-8 py-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-xl font-semibold border border-slate-600 hover:border-purple-500 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/20 overflow-hidden">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Blog
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/20 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </Link>

              {/* Share Section */}
              <div className="w-full lg:w-auto">
                <p className="text-sm font-semibold text-gray-400 mb-3 text-center lg:text-left">Share this article</p>
                <div className="flex flex-wrap justify-center lg:justify-end gap-3">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="group relative px-6 py-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/50 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      <span className="hidden sm:inline">Twitter</span>
                    </span>
                  </button>

                  <button
                    onClick={() => handleShare('facebook')}
                    className="group relative px-6 py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-600/50 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span className="hidden sm:inline">Facebook</span>
                    </span>
                  </button>

                  <button
                    onClick={() => handleShare('linkedin')}
                    className="group relative px-6 py-3 bg-[#0077b5] hover:bg-[#006399] text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-700/50 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      <span className="hidden sm:inline">LinkedIn</span>
                    </span>
                  </button>

                  <button
                    onClick={() => handleShare('copy')}
                    className="group relative px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium border border-purple-500/30 hover:border-purple-500 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/30 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">Copy</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle>Comments ({commentCount})</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Comment Form */}
            {session ? (
              <form onSubmit={handleComment} className="mb-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold">
                        {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    {replyTo && (
                      <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                        Replying to comment...{' '}
                        <button
                          type="button"
                          onClick={() => setReplyTo(null)}
                          className="text-purple-600 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        type="submit"
                        disabled={submitting || !newComment.trim()}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        {submitting ? 'Posting...' : 'Post Comment'}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Please sign in to comment
                </p>
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  No comments yet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Be the first to share your thoughts!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-4">
                    {/* Main Comment */}
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        {comment.user.image ? (
                          <img
                            src={comment.user.image}
                            alt={comment.user.name || 'User'}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {comment.user.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {comment.user.name || 'Anonymous'}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                          {comment.content}
                        </p>
                        <button
                          onClick={() => setReplyTo(comment.id)}
                          className="text-sm text-purple-600 hover:underline"
                        >
                          Reply
                        </button>
                      </div>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-14 space-y-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              {reply.user.image ? (
                                <img
                                  src={reply.user.image}
                                  alt={reply.user.name || 'User'}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold text-xs">
                                  {reply.user.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                  {reply.user.name || 'Anonymous'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(reply.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  )
}
