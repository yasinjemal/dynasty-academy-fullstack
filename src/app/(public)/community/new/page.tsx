'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  color: string
}

export default function NewTopicPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchCategories()
    }
  }, [status])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/community')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories)
        if (data.categories.length > 0) {
          setSelectedCategory(data.categories[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !content.trim() || !selectedCategory) {
      setError('Please fill in all fields')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/community/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          categoryId: selectedCategory,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/community/topic/${data.slug}`)
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to create topic')
      }
    } catch (error) {
      console.error('Error creating topic:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || status === 'loading') {
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-green-200 mb-4">
            Start a Discussion 💬
          </h1>
          <p className="text-xl text-gray-300">
            Share your ideas and connect with the community
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl p-6 border border-purple-500/20">
            <label className="block text-white font-semibold mb-4">
              Select Category <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedCategory === category.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{category.icon}</span>
                    <span className="text-white font-medium text-sm">{category.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl p-6 border border-purple-500/20">
            <label htmlFor="title" className="block text-white font-semibold mb-3">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your discussion about?"
              maxLength={200}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            <div className="mt-2 text-right text-sm text-gray-400">
              {title.length}/200 characters
            </div>
          </div>

          {/* Content */}
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl p-6 border border-purple-500/20">
            <label htmlFor="content" className="block text-white font-semibold mb-3">
              Content <span className="text-red-400">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, questions, or ideas... (Markdown supported)"
              rows={12}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none font-mono text-sm"
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-400 space-y-1">
                <p>✨ Markdown supported:</p>
                <p className="text-xs text-gray-500">**bold** • *italic* • `code` • [link](url) • # heading</p>
              </div>
              <div className="text-sm text-gray-400">
                {content.length} characters
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim() || !selectedCategory}
              className="flex-1 h-12 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Discussion
                </>
              )}
            </Button>
            
            <Link href="/community" className="flex-shrink-0">
              <Button type="button" variant="ghost" className="h-12">
                Cancel
              </Button>
            </Link>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-blue-900/20 to-slate-800/90 rounded-2xl p-6 border border-blue-500/20">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span>💡</span> Tips for a great discussion
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Use a clear, descriptive title that summarizes your topic</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Provide context and details in the content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Choose the most relevant category</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Be respectful and constructive</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Use Markdown to format your content nicely</span>
              </li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  )
}
