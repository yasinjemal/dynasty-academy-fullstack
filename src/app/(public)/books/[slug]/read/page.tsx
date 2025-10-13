import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'
import BookReaderLuxury from '@/components/books/BookReaderLuxury'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function BookReadPage({ params }: PageProps) {
  const { slug } = await params
  const session = await getServerSession(authOptions)

  // Get book details
  const book = await prisma.book.findUnique({
    where: { slug },
  })

  if (!book) {
    redirect('/books')
  }

  // Check if user has purchased this book  
  // For now, treat all users as not having purchased (free preview only)
  // TODO: Implement proper purchase checking after fixing enum issue
  const isPurchased = false

  // Check if book content exists
  if (!book.totalPages || book.totalPages === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-6">
            <svg
              className="w-10 h-10 text-yellow-600 dark:text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Book Content Not Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The reading content for this book hasn't been uploaded yet.
          </p>
          <a
            href={`/books/${slug}`}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Book Details
          </a>
        </div>
      </div>
    )
  }

  return (
    <BookReaderLuxury
      bookId={book.id}
      slug={slug}
      bookTitle={book.title}
      totalPages={book.totalPages}
      freePages={book.previewPages || 0}
      isPurchased={isPurchased}
      price={book.price}
      salePrice={book.salePrice}
    />
  )
}
