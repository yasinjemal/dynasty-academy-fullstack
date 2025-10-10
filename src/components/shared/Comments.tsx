'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
    image: string | null
  }
}

interface CommentsProps {
  resourceType: 'BOOK' | 'BLOG'
  resourceId: string
}

export default function Comments({ resourceType, resourceId }: CommentsProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [resourceType, resourceId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/comments?resourceType=${resourceType}&resourceId=${resourceId}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      setSubmitting(true)
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          resourceType,
          resourceId,
        }),
      })

      if (res.ok) {
        setNewComment('')
        await fetchComments()
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return

    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchComments()
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
        Comments ({comments.length})
      </h3>

      {/* Add Comment Form */}
      {session ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            disabled={submitting}
          />
          <Button type="submit" disabled={submitting || !newComment.trim()}>
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </form>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            Sign in to leave a comment
          </p>
          <Link href="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-3">
                {comment.user.image ? (
                  <img
                    src={comment.user.image}
                    alt={comment.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {comment.user.name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {comment.user.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      {session?.user.id === comment.user.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(comment.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
