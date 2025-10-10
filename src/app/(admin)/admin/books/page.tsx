'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'

interface Book {
  id: string
  title: string
  author: string
  isbn: string
  category: string
  price: number
  compareAtPrice: number | null
  coverImage: string | null
  stockQuantity: number
  status: string
  featured: boolean
  _count?: {
    reviews: number
    orderItems: number
  }
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    category: '',
    price: '',
    compareAtPrice: '',
    coverImage: '',
    pdfFile: '',
    contentType: 'EBOOK',
    stockQuantity: '0',
    status: 'PUBLISHED',
    featured: false,
  })

  useEffect(() => {
    fetchBooks()
  }, [search, category])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category) params.append('category', category)

      const res = await fetch(`/api/admin/books?${params}`)
      const data = await res.json()
      setBooks(data.books || [])
    } catch (error) {
      console.error('Error fetching books:', error)
      showAlert('error', 'Failed to fetch books')
    } finally {
      setLoading(false)
    }
  }

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showAlert('error', 'Image size should be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        showAlert('error', 'Please select a valid image file')
        return
      }

      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setFormData({ ...formData, coverImage: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Validate required fields
      if (!formData.title || !formData.author || !formData.isbn || !formData.category || !formData.price) {
        showAlert('error', 'Please fill in all required fields')
        setSubmitting(false)
        return
      }

      const url = editingBook ? `/api/admin/books/${editingBook.id}` : '/api/admin/books'
      const method = editingBook ? 'PATCH' : 'POST'

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
        stockQuantity: parseInt(formData.stockQuantity),
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        showAlert('success', editingBook ? 'Book updated successfully!' : 'Book created successfully!')
        setShowModal(false)
        resetForm()
        fetchBooks()
      } else {
        showAlert('error', data.error || 'Failed to save book')
      }
    } catch (error) {
      console.error('Error saving book:', error)
      showAlert('error', 'An error occurred while saving the book')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return

    try {
      const res = await fetch(`/api/admin/books/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showAlert('success', 'Book deleted successfully')
        fetchBooks()
      } else {
        showAlert('error', 'Failed to delete book')
      }
    } catch (error) {
      console.error('Error deleting book:', error)
      showAlert('error', 'An error occurred')
    }
  }

  const openEditModal = (book: Book) => {
    setEditingBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      description: '',
      category: book.category,
      price: book.price.toString(),
      compareAtPrice: book.compareAtPrice?.toString() || '',
      coverImage: book.coverImage || '',
      pdfFile: '',
      contentType: 'EBOOK',
      stockQuantity: book.stockQuantity.toString(),
      status: book.status,
      featured: book.featured,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      description: '',
      category: '',
      price: '',
      compareAtPrice: '',
      coverImage: '',
      pdfFile: '',
      contentType: 'EBOOK',
      stockQuantity: '0',
      status: 'PUBLISHED',
      featured: false,
    })
    setEditingBook(null)
    setImageFile(null)
    setImagePreview('')
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Alert Toast */}
      {alert && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`rounded-lg shadow-xl p-4 min-w-[300px] ${
            alert.type === 'error' 
              ? 'bg-red-500 text-white' 
              : 'bg-green-500 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {alert.type === 'error' ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className="font-medium">{alert.message}</span>
              </div>
              <button
                onClick={() => setAlert(null)}
                className="ml-4 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Books Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your book catalog</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true) }}>
          <span className="mr-2">➕</span>
          Add New Book
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Search</Label>
              <Input
                placeholder="Title, author, or ISBN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <Label>Category</Label>
              <select
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Programming">Programming</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Business">Business</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => { setSearch(''); setCategory('') }}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Books List */}
      <Card>
        <CardHeader>
          <CardTitle>All Books ({books.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-12 text-gray-600 dark:text-gray-400">Loading...</p>
          ) : books.length === 0 ? (
            <p className="text-center py-12 text-gray-600 dark:text-gray-400">No books found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-900 dark:text-white">Book</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-900 dark:text-white">Author</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-900 dark:text-white">Category</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-900 dark:text-white">Price</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-900 dark:text-white">Stock</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-900 dark:text-white">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          {book.coverImage ? (
                            <img src={book.coverImage} alt={book.title} className="w-12 h-16 object-cover rounded" />
                          ) : (
                            <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs">
                              No image
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{book.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">ISBN: {book.isbn}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-300">{book.author}</td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-300">{book.category}</td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-300">${book.price}</td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-300">{book.stockQuantity}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded ${
                          book.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {book.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => openEditModal(book)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(book.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Title *</Label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Author *</Label>
                    <Input
                      required
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>ISBN *</Label>
                    <Input
                      required
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Description</Label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Category *</Label>
                    <select
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      <option value="Programming">Programming</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </div>
                  <div>
                    <Label>Price *</Label>
                    <Input
                      required
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Compare At Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.compareAtPrice}
                      onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Stock Quantity</Label>
                    <Input
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Cover Image</Label>
                    <div className="space-y-3">
                      {/* Image Preview */}
                      {(imagePreview || formData.coverImage) && (
                        <div className="relative w-32 h-40 rounded-lg overflow-hidden border-2 border-purple-200 dark:border-purple-700">
                          <img
                            src={imagePreview || formData.coverImage}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview('')
                              setImageFile(null)
                              setFormData({ ...formData, coverImage: '' })
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      
                      {/* Upload Button */}
                      <div>
                        <input
                          type="file"
                          id="cover-upload"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="cover-upload"
                          className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-colors"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Upload Image
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Max 5MB • JPG, PNG, GIF
                        </p>
                      </div>
                      
                      {/* OR divider */}
                      <div className="flex items-center">
                        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                        <span className="px-3 text-sm text-gray-500 dark:text-gray-400">OR</span>
                        <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                      </div>
                      
                      {/* URL Input */}
                      <Input
                        value={formData.coverImage && !imagePreview ? formData.coverImage : ''}
                        onChange={(e) => {
                          setImagePreview('')
                          setImageFile(null)
                          setFormData({ ...formData, coverImage: e.target.value })
                        }}
                        placeholder="Or paste image URL"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label>PDF File URL</Label>
                    <Input
                      value={formData.pdfFile}
                      onChange={(e) => setFormData({ ...formData, pdfFile: e.target.value })}
                      placeholder="https://example.com/book.pdf"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Featured Book</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowModal(false); resetForm() }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {editingBook ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        {editingBook ? '✓ Update Book' : '+ Create Book'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
