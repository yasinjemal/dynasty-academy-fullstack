'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface QuickViewButtonProps {
  book: {
    id: string
    title: string
    slug: string
    description: string
    author: {
      name: string
      image?: string | null
    } | null
    coverImage?: string | null
    price: number
    salePrice?: number | null
    category: string
    rating: number
    reviewCount: number
  }
}

export default function QuickViewButton({ book }: QuickViewButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => setShowModal(true)}
      >
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Quick View
      </Button>

      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick View</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg overflow-hidden">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-24 h-24 text-purple-300 dark:text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      by {book.author?.name || 'Unknown Author'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(book.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {book.rating?.toFixed(1) || '0.0'} ({book.reviewCount || 0} reviews)
                    </span>
                  </div>

                  <div>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium">
                      {book.category}
                    </span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300">
                    {book.description}
                  </p>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    {book.salePrice ? (
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          ${book.salePrice}
                        </span>
                        <span className="text-xl text-gray-500 line-through">
                          ${book.price}
                        </span>
                      </div>
                    ) : (
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-4">
                        ${book.price}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button 
                        className="flex-1"
                        onClick={() => window.location.href = `/books/${book.slug}`}
                      >
                        View Full Details
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setShowModal(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
