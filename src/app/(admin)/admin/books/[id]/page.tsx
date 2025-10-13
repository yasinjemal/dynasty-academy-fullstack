'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import BookFileUploader from '@/components/admin/BookFileUploader'

interface Book {
  id: string
  title: string
  slug: string
  description: string
  coverImage: string | null
  price: number
  salePrice: number | null
  category: string
  tags: string[]
  contentType: string
  fileUrl: string | null
  totalPages: number | null
  previewPages: number | null
  featured: boolean
}

export default function AdminBookEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  
  // Editable fields
  const [editedBook, setEditedBook] = useState<Book | null>(null)

  useEffect(() => {
    fetchBook()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchBook = async () => {
    try {
      const res = await fetch(`/api/admin/books/${id}`)
      if (!res.ok) throw new Error('Failed to fetch book')
      const data = await res.json()
      setBook(data.book)
      setEditedBook(data.book) // Initialize edited book
    } catch (error) {
      console.error('Error fetching book:', error)
      showAlert('error', 'Failed to load book details')
    } finally {
      setLoading(false)
    }
  }

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  const handleFileUploadSuccess = (data: any) => {
    showAlert('success', `File uploaded! ${data.totalPages} pages processed.`)
    // Refresh book data
    fetchBook()
  }

  const handleSave = async () => {
    if (!editedBook) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedBook.title,
          description: editedBook.description,
          price: editedBook.price,
          salePrice: editedBook.salePrice,
          category: editedBook.category,
          tags: editedBook.tags,
          featured: editedBook.featured,
          previewPages: editedBook.previewPages,
        }),
      })

      if (!res.ok) throw new Error('Failed to save changes')
      
      const data = await res.json()
      setBook(data.book)
      setEditedBook(data.book)
      showAlert('success', '✅ Book updated successfully!')
    } catch (error) {
      console.error('Error saving book:', error)
      showAlert('error', 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleFieldChange = (field: keyof Book, value: any) => {
    setEditedBook(prev => prev ? { ...prev, [field]: value } : null)
  }

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean)
    handleFieldChange('tags', tags)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Book Not Found</h2>
          <Button onClick={() => router.push('/admin/books')}>
            Back to Books
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/books')}
            className="mb-4"
          >
            ← Back to Books
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Book: {book.title}
          </h1>
        </div>

        {/* Alert */}
        {alert && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              alert.type === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {alert.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Book Info Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Book Information</CardTitle>
                <Button
                  onClick={handleSave}
                  disabled={saving || !editedBook}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {saving ? '💾 Saving...' : '💾 Save Changes'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editedBook?.title || ''}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    className="font-semibold"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={editedBook?.category || ''}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={editedBook?.price || 0}
                      onChange={(e) => handleFieldChange('price', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="salePrice">Sale Price ($)</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      value={editedBook?.salePrice || ''}
                      onChange={(e) => handleFieldChange('salePrice', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="previewPages">Free Preview Pages</Label>
                  <Input
                    id="previewPages"
                    type="number"
                    min="0"
                    value={editedBook?.previewPages || 0}
                    onChange={(e) => handleFieldChange('previewPages', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of pages users can read for free
                  </p>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={editedBook?.tags.join(', ') || ''}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    placeholder="finance, success, wealth"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={editedBook?.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </CardContent>
            </Card>

            {/* File Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle>📖 Book Content</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Upload the book file to enable the reader feature. Supports PDF, DOCX, Markdown, and TXT files.
                </p>
              </CardHeader>
              <CardContent>
                {book.totalPages && book.totalPages > 0 ? (
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100">
                          Book content uploaded successfully!
                        </h4>
                        <div className="mt-2 space-y-1 text-sm text-green-800 dark:text-green-200">
                          <p>📄 Total Pages: <strong>{book.totalPages}</strong></p>
                          <p>🔓 Free Preview Pages: <strong>{book.previewPages || 0}</strong></p>
                          {book.fileUrl && (
                            <p>📁 File: <a href={book.fileUrl} target="_blank" rel="noopener noreferrer" className="underline">{book.fileUrl}</a></p>
                          )}
                        </div>
                        <div className="mt-4">
                          <a
                            href={`/books/${book.slug}/read`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Preview Reader
                          </a>
                        </div>
                        <p className="mt-4 text-xs text-green-700 dark:text-green-300">
                          💡 Upload a new file below to replace the existing content
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
                          No book content uploaded yet
                        </h4>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                          Upload a file below to enable the reader feature for customers.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <BookFileUploader
                  bookId={book.id}
                  onUploadComplete={handleFileUploadSuccess}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cover Image */}
            <Card>
              <CardHeader>
                <CardTitle>Cover Image</CardTitle>
              </CardHeader>
              <CardContent>
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Content Type</Label>
                  <div className="mt-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-medium">
                    {book.contentType}
                  </div>
                </div>
                <div>
                  <Label>Featured</Label>
                  <div className="mt-2">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editedBook?.featured || false}
                        onChange={(e) => handleFieldChange('featured', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        {editedBook?.featured ? '⭐ Featured' : 'Not Featured'}
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <Label>Tags</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {book.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => window.open(`/books/${book.slug}`, '_blank')}
                  className="w-full"
                  variant="outline"
                >
                  👁️ View Public Page
                </Button>
                {book.totalPages && book.totalPages > 0 && (
                  <Button
                    onClick={() => window.open(`/books/${book.slug}/read`, '_blank')}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    📖 Open Reader
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
