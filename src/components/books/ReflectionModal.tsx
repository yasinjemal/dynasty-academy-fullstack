'use client'

import { useState } from 'react'
import { X, Sparkles, MessageCircle, Users, Lightbulb } from 'lucide-react'
import ShareReflectionModal from '@/components/shared/ShareReflectionModal'

interface ReflectionModalProps {
  isOpen: boolean
  onClose: () => void
  bookId: string
  bookTitle: string
  chapterNumber: number
  chapterTitle?: string
  onSubmit: (reflection: ReflectionData) => Promise<{ reflectionId: string }>
}

export interface ReflectionData {
  content: string
  postToCommunity: boolean
  category: string
  isPublic: boolean
}

const CATEGORIES = [
  { id: 'learning-education', label: '📚 Learning & Education', icon: Lightbulb },
  { id: 'project-showcase', label: '🚀 Project Showcase', icon: Sparkles },
  { id: 'general-discussion', label: '💬 General Discussion', icon: MessageCircle },
  { id: 'community-support', label: '🤝 Community Support', icon: Users },
]

export default function ReflectionModal({
  isOpen,
  onClose,
  bookId,
  bookTitle,
  chapterNumber,
  chapterTitle,
  onSubmit,
}: ReflectionModalProps) {
  const [content, setContent] = useState('')
  const [postToCommunity, setPostToCommunity] = useState(true)
  const [category, setCategory] = useState('learning-education')
  const [isPublic, setIsPublic] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [reflectionId, setReflectionId] = useState<string | null>(null)

  if (!isOpen && !showShareModal) return null

  const handleSubmit = async () => {
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      const result = await onSubmit({
        content: content.trim(),
        postToCommunity,
        category,
        isPublic,
      })
      
      setReflectionId(result.reflectionId)
      setShowSuccess(true)
      
      // Show success animation, then open share modal
      setTimeout(() => {
        setShowSuccess(false)
        onClose()
        setShowShareModal(true)
      }, 2000)
    } catch (error) {
      console.error('Failed to submit reflection:', error)
      alert('Failed to submit reflection. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleShareModalClose = () => {
    setShowShareModal(false)
    setReflectionId(null)
    setContent('')
  }

  const characterCount = content.length
  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 rounded-3xl border border-purple-500/30 max-w-2xl w-full shadow-2xl shadow-purple-500/20 animate-scaleIn">
        {/* Header */}
        <div className="relative p-6 sm:p-8 border-b border-purple-500/20">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-purple-300/70 hover:text-purple-200 transition-colors rounded-lg hover:bg-purple-500/10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Reflect & Share
              </h2>
              <p className="text-sm text-purple-300/70">
                Turn knowledge into wisdom
              </p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/10">
            <p className="text-sm text-purple-200/80">
              <span className="font-semibold text-purple-300">{bookTitle}</span>
              {chapterTitle && (
                <>
                  {' '}→ <span className="text-purple-400">Chapter {chapterNumber}: {chapterTitle}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Success State */}
        {showSuccess ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-green-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Reflection Shared! 🎉
            </h3>
            <p className="text-purple-300/70">
              Your insight has been added to the Dynasty community
            </p>
          </div>
        ) : (
          <>
            {/* Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Reflection Prompt */}
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-3">
                  💭 What was your biggest realization or lesson from this chapter?
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your takeaway, insight, or advice to others...

Example: 'I realized my biggest enemy was comfort. This chapter made me restart my 100-day discipline streak.'"
                  className="w-full h-40 bg-slate-800/50 text-purple-100 placeholder:text-purple-400/30 rounded-xl p-4 border border-purple-500/20 focus:border-purple-500/50 focus:outline-none resize-none transition-colors"
                  maxLength={2000}
                />
                <div className="flex justify-between items-center mt-2 text-xs text-purple-300/50">
                  <span>{wordCount} words</span>
                  <span>{characterCount}/2000 characters</span>
                </div>
              </div>

              {/* Community Options */}
              <div className="space-y-4">
                {/* Post to Community Toggle */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={postToCommunity}
                    onChange={(e) => setPostToCommunity(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-purple-500/30 bg-slate-800/50 text-purple-600 focus:ring-purple-500/50 focus:ring-offset-0 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-200 group-hover:text-purple-100 transition-colors">
                        Post to Community Discussion
                      </span>
                    </div>
                    <p className="text-xs text-purple-300/60">
                      Share your reflection with the Dynasty community and inspire others
                    </p>
                  </div>
                </label>

                {/* Category Selection (only shown if posting) */}
                {postToCommunity && (
                  <div className="pl-8 space-y-3 animate-fadeIn">
                    <label className="block text-xs font-medium text-purple-300/80 mb-2">
                      Select Category
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setCategory(cat.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            category === cat.id
                              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-lg shadow-purple-500/20'
                              : 'bg-slate-800/30 text-purple-300/70 border border-slate-700/50 hover:bg-slate-800/50'
                          }`}
                        >
                          <span>{cat.label.split(' ')[0]}</span>
                          <span className="text-[10px]">{cat.label.split(' ').slice(1).join(' ')}</span>
                        </button>
                      ))}
                    </div>

                    {/* Public/Private Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-purple-300/70 hover:text-purple-200 transition-colors">
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="w-4 h-4 rounded border-purple-500/30 bg-slate-800/50 text-purple-600 focus:ring-purple-500/50 cursor-pointer"
                      />
                      <span>Make this reflection public (recommended for community growth)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-purple-200/80 space-y-1">
                    <p className="font-medium text-purple-200">💡 Why reflect?</p>
                    <ul className="space-y-1 text-purple-300/60">
                      <li>• Turns passive reading into active learning</li>
                      <li>• Your insight might transform someone's life</li>
                      <li>• Earn Dynasty Points and "Chapter Contributor" badge</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 sm:p-8 pt-0 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-purple-300 font-medium rounded-xl transition-all border border-slate-700/50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:shadow-none disabled:cursor-not-allowed disabled:text-purple-400"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sharing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Share Reflection
                  </span>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>

      {/* Share Modal */}
      {showShareModal && reflectionId && (
        <ShareReflectionModal
          isOpen={showShareModal}
          onClose={handleShareModalClose}
          reflectionId={reflectionId}
          bookTitle={bookTitle}
          content={content}
        />
      )}
    </div>
  )
}
