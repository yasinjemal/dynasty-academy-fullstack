'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ShareReflectionModalProps {
  isOpen: boolean
  onClose: () => void
  reflectionId: string
  bookTitle: string
  content: string
}

export default function ShareReflectionModal({
  isOpen,
  onClose,
  reflectionId,
  bookTitle,
  content,
}: ShareReflectionModalProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/reflection/${reflectionId}`
  
  const excerpt = content.length > 100 ? content.substring(0, 100) + '...' : content

  const shareTexts = {
    twitter: `💭 My reflection on "${bookTitle}"\n\n"${excerpt}"\n\nJoin the Dynasty Built community and share your wisdom:\n\n`,
    linkedin: `I just shared a reflection on "${bookTitle}" on Dynasty Built.\n\n"${excerpt}"\n\nCheck it out and join our community of builders:\n\n`,
    general: `Check out my reflection on "${bookTitle}": ${shareUrl}`,
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTexts.twitter)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
  }

  const handleLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
  }

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Share Your Wisdom 🎯
          </DialogTitle>
          <DialogDescription className="text-base">
            Your reflection has been published! Share it with the world and inspire others.
          </DialogDescription>
        </DialogHeader>

        {/* Preview Card */}
        <div className="my-6 p-6 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📖</span>
            <span className="font-semibold text-purple-900 dark:text-purple-300">
              {bookTitle}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 italic text-lg leading-relaxed">
            "{excerpt}"
          </p>
        </div>

        {/* Share URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Share Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
            />
            <Button
              onClick={handleCopy}
              variant={copied ? 'default' : 'outline'}
              className={copied ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </Button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Share on social media:
          </p>
          
          <Button
            onClick={handleTwitterShare}
            className="w-full bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-semibold py-6 text-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Share on Twitter/X
          </Button>

          <Button
            onClick={handleLinkedInShare}
            className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold py-6 text-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Share on LinkedIn
          </Button>

          <Button
            onClick={handleFacebookShare}
            className="w-full bg-[#1877F2] hover:bg-[#0c63d4] text-white font-semibold py-6 text-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Share on Facebook
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            💡 <span className="font-semibold">Pro Tip:</span> Sharing your reflections helps others discover Dynasty Built and earns you +2 Dynasty Points per share!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
