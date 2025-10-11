'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ReflectionModalProps {
  bookId: string
  bookTitle: string
  chapter: number
  onClose: () => void
  onSuccess?: () => void
}

export default function ReflectionModal({
  bookId,
  bookTitle,
  chapter,
  onClose,
  onSuccess,
}: ReflectionModalProps) {
  const [content, setContent] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [shareToForum, setShareToForum] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      alert('Please write your reflection')
      return
    }

    if (content.length < 10) {
      alert('Reflection must be at least 10 characters')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/books/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          chapter,
          content,
          isPublic,
          shareToForum,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save reflection')
      }

      const data = await res.json()
      alert(data.message || 'Reflection saved successfully!')
      
      if (onSuccess) {
        onSuccess()
      }
      
      onClose()
    } catch (error: any) {
      console.error('Error saving reflection:', error)
      alert(error.message || 'Failed to save reflection')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            Reflect on Chapter {chapter}
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {bookTitle}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Reflection Content */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Your Reflection
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What insights did you gain from this chapter? How will you apply this knowledge?"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={8}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {content.length} / 5000 characters
              </p>
            </div>

            {/* Sharing Options */}
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sharing Options
              </p>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => {
                    setIsPublic(e.target.checked)
                    if (!e.target.checked) {
                      setShareToForum(false)
                    }
                  }}
                  className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Make reflection public
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Allow others to see your reflection
                  </p>
                </div>
              </label>

              {isPublic && (
                <label className="flex items-start gap-3 cursor-pointer ml-7">
                  <input
                    type="checkbox"
                    checked={shareToForum}
                    onChange={(e) => setShareToForum(e.target.checked)}
                    className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Share to community forum
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Create a discussion topic in the community
                    </p>
                  </div>
                </label>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isSubmitting ? 'Saving...' : 'Save Reflection'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
