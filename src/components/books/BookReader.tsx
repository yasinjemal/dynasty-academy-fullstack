'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ListenModeLuxury from './ListenModeLuxury'
import ReflectionModal, { type ReflectionData } from './ReflectionModal'

interface BookReaderProps {
  bookId: string
  slug: string
  bookTitle: string
  totalPages: number
  freePages: number
  isPurchased: boolean
  price: number
  salePrice?: number | null
}

export default function BookReader({
  bookId,
  slug,
  bookTitle,
  totalPages,
  freePages,
  isPurchased,
  price,
  salePrice,
}: BookReaderProps) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageContent, setPageContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light')
  const [showPaywall, setShowPaywall] = useState(false)
  const [readingTime, setReadingTime] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [listenMode, setListenMode] = useState(false)
  const [showReflectionModal, setShowReflectionModal] = useState(false)

  const canReadPage = isPurchased || currentPage <= freePages
  const progressPercentage = (currentPage / totalPages) * 100

  // Load saved preferences and bookmark on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('readerTheme') as 'light' | 'sepia' | 'dark' | null
    const savedFontSize = localStorage.getItem('readerFontSize')
    const savedPage = localStorage.getItem(`bookmark-${bookId}`)
    
    if (savedTheme) setTheme(savedTheme)
    if (savedFontSize) setFontSize(parseInt(savedFontSize))
    if (savedPage && !isPurchased) {
      const page = parseInt(savedPage)
      if (page <= freePages) setCurrentPage(page)
    } else if (savedPage) {
      setCurrentPage(parseInt(savedPage))
    }
  }, [bookId, freePages, isPurchased])

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem('readerTheme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('readerFontSize', fontSize.toString())
  }, [fontSize])

  // Save bookmark when page changes
  useEffect(() => {
    if (currentPage > 1) {
      localStorage.setItem(`bookmark-${bookId}`, currentPage.toString())
    }
  }, [currentPage, bookId])

  useEffect(() => {
    loadPage(currentPage)
  }, [currentPage])

  const loadPage = async (pageNum: number) => {
    if (!canReadPage && pageNum > freePages) {
      setShowPaywall(true)
      return
    }

    setIsTransitioning(true)
    setLoading(true)
    
    try {
      const res = await fetch(`/api/books/${slug}/read?page=${pageNum}`)
      if (!res.ok) throw new Error('Failed to load page')
      
      const data = await res.json()
      setPageContent(data.content)
      setShowPaywall(false)
      
      // Calculate reading time (avg 200 words per minute)
      const wordCount = data.content.replace(/<[^>]*>/g, '').split(/\s+/).length
      setReadingTime(Math.ceil(wordCount / 200))
      
      // Track reading progress
      trackReadingProgress(pageNum)
    } catch (error) {
      console.error('Error loading page:', error)
      setPageContent('<div class="text-center text-red-600"><h2>Error loading page content</h2><p>Please try again later.</p></div>')
    } finally {
      setLoading(false)
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }

  const trackReadingProgress = async (page: number) => {
    try {
      await fetch('/api/books/reading-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          currentPage: page,
          totalPages,
        }),
      })
    } catch (error) {
      // Silent fail - don't disrupt reading experience
      console.error('Error tracking progress:', error)
    }
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleReflectionSubmit = async (reflection: ReflectionData) => {
    try {
      const res = await fetch('/api/community/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          bookTitle,
          chapterNumber: currentPage,
          content: reflection.content,
          postToCommunity: reflection.postToCommunity,
          category: reflection.category,
          isPublic: reflection.isPublic,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to save reflection')
      }

      const data = await res.json()
      console.log('Reflection saved:', data)
      
      // Optional: Track analytics
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('reflection_submitted', {
          bookId,
          chapterNumber: currentPage,
          postToCommunity: reflection.postToCommunity,
          category: reflection.category,
        })
      }
    } catch (error) {
      console.error('Error submitting reflection:', error)
      throw error
    }
  }

  const handlePurchase = async (type: 'book' | 'subscription' = 'book') => {
    try {
      // Create Stripe checkout session
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          type,
        }),
      })

      if (!res.ok) throw new Error('Failed to create checkout')

      const { url } = await res.json()
      
      // Redirect to Stripe checkout
      window.location.href = url
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Failed to start checkout. Please try again.')
    }
  }

  const themeClasses = {
    light: 'bg-white text-gray-900',
    sepia: 'bg-[#f4ecd8] text-[#5f4b32]',
    dark: 'bg-gray-900 text-gray-100',
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Reader Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Button>
              <h1 className="text-lg font-semibold truncate max-w-md">
                {bookTitle}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Font Size Controls */}
              <div className="hidden sm:flex items-center gap-2 border-r pr-4 mr-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
                >
                  A-
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {fontSize}px
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFontSize(prev => Math.min(24, prev + 2))}
                >
                  A+
                </Button>
              </div>

              {/* Theme Switcher */}
              <div className="hidden sm:flex gap-2 border-r pr-4 mr-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`w-8 h-8 rounded-full bg-white border-2 ${
                    theme === 'light' ? 'border-purple-600' : 'border-gray-300'
                  }`}
                  title="Light"
                />
                <button
                  onClick={() => setTheme('sepia')}
                  className={`w-8 h-8 rounded-full bg-[#f4ecd8] border-2 ${
                    theme === 'sepia' ? 'border-purple-600' : 'border-gray-300'
                  }`}
                  title="Sepia"
                />
                <button
                  onClick={() => setTheme('dark')}
                  className={`w-8 h-8 rounded-full bg-gray-900 border-2 ${
                    theme === 'dark' ? 'border-purple-600' : 'border-gray-300'
                  }`}
                  title="Dark"
                />
              </div>

              {/* Listen Mode Toggle */}
              <Button
                variant={listenMode ? "default" : "outline"}
                size="sm"
                onClick={() => setListenMode(!listenMode)}
                className={listenMode ? "bg-gradient-to-r from-purple-600 to-blue-600" : ""}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                {listenMode ? '📖 Read' : '🎧 Listen'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Reader Content */}
      <main className="flex-1 flex">
        <div className={`flex-1 transition-all duration-300 ${themeClasses[theme]}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Page Info */}
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-medium opacity-60">
                Page {currentPage} of {totalPages}
              </span>
              
              {readingTime > 0 && (
                <div className="flex items-center gap-2 text-sm opacity-60">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {readingTime} min read
                </div>
              )}
            </div>
            
            {!isPurchased && currentPage <= freePages && (
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-sm font-semibold rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  FREE PREVIEW - {freePages - currentPage} pages remaining
                </span>
              </div>
            )}

            {/* Page Content */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : showPaywall ? (
              <div className="text-center py-20">
                {/* Animated Lock Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full mb-6 animate-pulse">
                  <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                
                <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                  🔒 Unlock Full Access
                </h3>
                
                <p className="text-lg font-medium mb-2">
                  You've reached the end of the free preview!
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Continue reading all {totalPages} pages + get lifetime access
                </p>

                {/* Pricing Display with Dynamic Savings */}
                <div className="bg-white dark:bg-gray-700/50 rounded-2xl p-6 mb-6 border-2 border-purple-200 dark:border-purple-800">
                  {salePrice ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-4">
                        <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                          R{salePrice.toFixed(2)}
                        </span>
                        <div>
                          <span className="text-2xl text-gray-400 line-through block">
                            R{price.toFixed(2)}
                          </span>
                          <span className="text-sm font-bold text-green-600 dark:text-green-400">
                            Save {Math.round(((price - salePrice) / price) * 100)}% 🔥
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                        💎 Early Reader Discount - Limited Time!
                      </p>
                    </div>
                  ) : (
                    <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                      R{price.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Trust Signals */}
                <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                  <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="font-semibold">Secure</span>
                    <span className="text-xs text-gray-500">Payment</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="font-semibold">Instant</span>
                    <span className="text-xs text-gray-500">Access</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-semibold">Lifetime</span>
                    <span className="text-xs text-gray-500">Access</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col items-center gap-3 w-full">
                  <Button 
                    size="lg" 
                    onClick={() => handlePurchase('book')}
                    className="w-full max-w-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Purchase Book - Full Access
                  </Button>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400">or</div>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => handlePurchase('subscription')}
                    className="w-full max-w-md border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold"
                  >
                    📚 Subscribe for Unlimited Books
                  </Button>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    🎯 Includes future updates • 💳 Cancel anytime
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Luxury Listen Mode - Full Screen Experience */}
                {listenMode ? (
                  <ListenModeLuxury
                    bookSlug={slug}
                    chapterNumber={currentPage}
                    pageContent={pageContent}
                    isPremiumUser={isPurchased}
                  />
                ) : (
                  <>
                    {/* Reading Content */}
                    <article
                      className={`prose prose-lg max-w-none leading-relaxed transition-opacity duration-300 ${
                        isTransitioning ? 'opacity-0' : 'opacity-100'
                      }`}
                      style={{ fontSize: `${fontSize}px` }}
                      dangerouslySetInnerHTML={{ __html: pageContent }}
                    />

                    {/* Reflect & Share Button */}
                    {!isTransitioning && pageContent && (
                      <div className="mt-12 pt-8 border-t border-purple-200 dark:border-purple-800">
                        <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-800">
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-4">
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                            
                            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">
                              ✨ Reflect on this Chapter
                            </h3>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                              What was your biggest realization? Share your insight with the Dynasty community and transform reading into wisdom.
                            </p>

                            <button
                              onClick={() => setShowReflectionModal(true)}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                              Share Your Reflection
                            </button>

                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-4">
                              💡 Earn Dynasty Points + "Chapter Contributor" badge
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )
                }
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Reflection Modal */}
      <ReflectionModal
        isOpen={showReflectionModal}
        onClose={() => setShowReflectionModal(false)}
        bookId={bookId}
        bookTitle={bookTitle}
        chapterNumber={currentPage}
        onSubmit={handleReflectionSubmit}
      />

      {/* Reader Footer Navigation */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Button>

            {/* Page Input */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">Go to page:</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-center"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">of {totalPages}</span>
            </div>

            <Button
              variant="ghost"
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
