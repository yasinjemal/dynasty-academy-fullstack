'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function BookDetailPage() {
  const params = useParams()
  const [book, setBook] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`/api/books/${params.slug}`)
        if (!res.ok) throw new Error('Book not found')
        const data = await res.json()
        setBook(data.book)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchBook()
    }
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading book details...</p>
        </div>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Book Not Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The book you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/books">
            <Button>Browse Books</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-purple-100 dark:border-purple-900 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">DB</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Dynasty Built Academy
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex text-sm text-gray-600 dark:text-gray-400">
          <Link href="/" className="hover:text-purple-600 dark:hover:text-purple-400">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/books" className="hover:text-purple-600 dark:hover:text-purple-400">Books</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white">{book.title}</span>
        </nav>
      </div>

      {/* Book Detail */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Book Cover */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="overflow-hidden border-purple-100 dark:border-purple-900">
                  <div className="relative h-96 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-32 h-32 text-purple-300 dark:text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                    {book.isPremium && (
                      <div className="absolute top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        Premium
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        {book.discountPrice ? (
                          <div className="flex items-center gap-3">
                            <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                              ${book.discountPrice}
                            </span>
                            <span className="text-xl text-gray-500 line-through">
                              ${book.price}
                            </span>
                          </div>
                        ) : (
                          <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                            ${book.price}
                          </span>
                        )}
                      </div>

                      <Button className="w-full" size="lg">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Add to Cart
                      </Button>

                      <Button variant="outline" className="w-full">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Save for Later
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Book Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {book.title}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                  by {book.author}
                </p>
                
                <div className="flex items-center gap-6 mb-6">
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

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {book.views || 0} views
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium">
                    {book.category}
                  </span>
                  {book.tags?.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <h2>About This Book</h2>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                    {book.description}
                  </p>

                  {book.content && (
                    <>
                      <h2 className="mt-8">Full Description</h2>
                      <div dangerouslySetInnerHTML={{ __html: book.content }} />
                    </>
                  )}
                </div>
              </div>

              {/* Reviews Section */}
              {book.reviews && book.reviews.length > 0 && (
                <Card className="border-purple-100 dark:border-purple-900">
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {book.reviews.map((review: any) => (
                        <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-purple-600 dark:text-purple-400 font-semibold">
                                {review.user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {review.user.name}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <svg
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < review.rating
                                              ? 'text-yellow-400 fill-current'
                                              : 'text-gray-300 dark:text-gray-600'
                                          }`}
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                        </svg>
                                      ))}
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300">
                                {review.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
