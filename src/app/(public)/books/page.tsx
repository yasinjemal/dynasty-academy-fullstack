import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import BookFilters from '@/components/books/BookFilters'
import Pagination from '@/components/books/Pagination'
import QuickViewButton from '@/components/books/QuickViewButton'
import Navigation from '@/components/shared/Navigation'
import AddToCartButton from '@/components/books/AddToCartButton'

async function getBooks(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    const params = new URLSearchParams()
    params.set('limit', '50')
    
    if (searchParams.search) params.set('search', searchParams.search as string)
    if (searchParams.category) params.set('category', searchParams.category as string)
    if (searchParams.sort) params.set('sortBy', searchParams.sort as string)
    
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/books?${params.toString()}`, {
      cache: 'no-store',
    })
    if (!res.ok) return { books: [], pagination: null }
    return await res.json()
  } catch (error) {
    return { books: [], pagination: null }
  }
}

export default async function BooksPage({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  const { books, pagination } = await getBooks(searchParams)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <Navigation />

      {/* Page Header */}
      <section className="py-12 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Browse Our Book Collection
            </h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Discover premium books written by industry experts. Learn, grow, and build your dynasty.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <BookFilters />

      {/* Books Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {books.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-6">
                <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Books Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Books will appear here once they are added by administrators.
              </p>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map((book: any) => (
                  <Card key={book.id} className="group hover:shadow-xl transition-all duration-300 border-purple-100 dark:border-purple-900 overflow-hidden">
                    <div className="relative h-64 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 overflow-hidden">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-20 h-20 text-purple-300 dark:text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                      {book.featured && (
                        <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </div>
                      )}
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {book.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-1">
                        by {book.author?.name || 'Unknown Author'}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                        {book.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          {book.salePrice ? (
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                ${book.salePrice}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ${book.price}
                              </span>
                            </div>
                          ) : (
                            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              ${book.price}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {book.rating?.toFixed(1) || '0.0'} ({book.reviewCount || 0})
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex flex-col gap-2">
                      <div className="flex gap-2 w-full">
                        <Link href={`/books/${book.slug}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            View Details
                          </Button>
                        </Link>
                        <AddToCartButton bookId={book.id} bookTitle={book.title} />
                      </div>
                      <QuickViewButton book={book} />
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <Pagination 
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                />
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
