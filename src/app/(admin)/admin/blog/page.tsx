'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  featuredImage: string | null
  status: string
  featured: boolean
  createdAt: string
  author: {
    id: string
    name: string
    email: string
  }
  _count?: {
    comments: number
    likes: number
  }
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    featuredImage: '',
    status: 'PUBLISHED',
    featured: false,
  })

  useEffect(() => {
    fetchPosts()
  }, [search, category])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category) params.append('category', category)

      const res = await fetch(`/api/admin/blog?${params}`)
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      showAlert('error', 'Failed to fetch blog posts')
    } finally {
      setLoading(false)
    }
  }

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingPost ? `/api/admin/blog/${editingPost.id}` : '/api/admin/blog'
      const method = editingPost ? 'PATCH' : 'POST'

      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        showAlert('success', editingPost ? 'Post updated successfully' : 'Post created successfully')
        setShowModal(false)
        resetForm()
        fetchPosts()
      } else {
        showAlert('error', 'Failed to save post')
      }
    } catch (error) {
      console.error('Error saving post:', error)
      showAlert('error', 'An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showAlert('success', 'Post deleted successfully')
        fetchPosts()
      } else {
        showAlert('error', 'Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      showAlert('error', 'An error occurred')
    }
  }

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags.join(', '),
      featuredImage: post.featuredImage || '',
      status: post.status,
      featured: post.featured,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: '',
      tags: '',
      featuredImage: '',
      status: 'PUBLISHED',
      featured: false,
    })
    setEditingPost(null)
  }

  return (
    <div className="p-8">
      {alert && (
        <div className="mb-4">
          <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
            {alert.message}
          </Alert>
        </div>
      )}

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Blog Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your blog posts</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true) }}>
          <span className="mr-2">➕</span>
          Create New Post
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Search</Label>
              <Input
                placeholder="Title or content..."
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
                <option value="Technology">Technology</option>
                <option value="Programming">Programming</option>
                <option value="Education">Education</option>
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

      {/* Posts List */}
      <Card>
        <CardHeader>
          <CardTitle>All Blog Posts ({posts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-12 text-gray-600 dark:text-gray-400">Loading...</p>
          ) : posts.length === 0 ? (
            <p className="text-center py-12 text-gray-600 dark:text-gray-400">No posts found</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex gap-4">
                  {post.featuredImage ? (
                    <img src={post.featuredImage} alt={post.title} className="w-32 h-24 object-cover rounded flex-shrink-0" />
                  ) : (
                    <div className="w-32 h-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0 text-xs text-gray-500">
                      No image
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{post.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{post.excerpt}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>By {post.author.name}</span>
                          <span>•</span>
                          <span>{post.category}</span>
                          <span>•</span>
                          <span>{post._count?.comments || 0} comments</span>
                          <span>•</span>
                          <span>{post._count?.likes || 0} likes</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded ${
                            post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {post.status}
                          </span>
                          {post.featured && (
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" onClick={() => openEditModal(post)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(post.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {editingPost ? 'Edit Blog Post' : 'Create New Post'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Excerpt *</Label>
                  <textarea
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={2}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Content *</Label>
                  <textarea
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    rows={12}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your blog post content here... You can use markdown formatting."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category *</Label>
                    <select
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      <option value="Technology">Technology</option>
                      <option value="Programming">Programming</option>
                      <option value="Education">Education</option>
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
                </div>
                <div>
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="javascript, react, tutorial"
                  />
                </div>
                <div>
                  <Label>Featured Image URL</Label>
                  <Input
                    value={formData.featuredImage}
                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Featured Post</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowModal(false); resetForm() }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPost ? 'Update Post' : 'Create Post'}
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
