'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ShareProfileButtonProps {
  username: string
}

export default function ShareProfileButton({ username }: ShareProfileButtonProps) {
  const [copied, setCopied] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${encodeURIComponent(username)}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareToTwitter = () => {
    const text = `Check out my Dynasty Built profile! 🏛️ I'm building my legacy through knowledge and action.`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
  }

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
  }

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
  }

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
      >
        🔗 Share My Profile
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-purple-200 dark:border-purple-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Share Your Profile
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Profile URL */}
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Your Public Profile URL</div>
              <div className="text-sm font-mono text-purple-600 dark:text-purple-400 break-all">
                {profileUrl}
              </div>
            </div>

            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              className="w-full mb-4 py-3 px-4 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 border border-gray-300 dark:border-gray-600 transition-all duration-200 flex items-center justify-center gap-2 font-semibold"
            >
              <span className="text-xl">📋</span>
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            {/* Social Share Buttons */}
            <div className="space-y-3">
              <button
                onClick={shareToTwitter}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg"
              >
                <span className="text-xl">🐦</span>
                <span>Share on Twitter</span>
              </button>

              <button
                onClick={shareToLinkedIn}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg"
              >
                <span className="text-xl">💼</span>
                <span>Share on LinkedIn</span>
              </button>

              <button
                onClick={shareToFacebook}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg"
              >
                <span className="text-xl">📘</span>
                <span>Share on Facebook</span>
              </button>
            </div>

            {/* Info Text */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
              Share your Dynasty Built journey and inspire others! 🏛️
            </p>
          </div>
        </div>
      )}
    </>
  )
}
