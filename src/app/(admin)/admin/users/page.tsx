'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'

interface User {
  id: string
  name: string
  email: string
  role: string
  emailVerified: string | null
  image: string | null
  bio: string | null
  createdAt: string
  _count?: {
    orders: number
    reviews: number
    blogPosts: number
    comments: number
    followers?: number
    following?: number
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'USER',
    bio: '',
    image: '',
  })

  useEffect(() => {
    fetchUsers()
  }, [search, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (roleFilter) params.append('role', roleFilter)

      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      showAlert('error', 'Failed to fetch users')
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
      const url = `/api/admin/users/${editingUser?.id}`
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        showAlert('success', 'User updated successfully')
        setShowModal(false)
        resetForm()
        fetchUsers()
      } else {
        const error = await res.json()
        showAlert('error', error.message || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      showAlert('error', 'An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showAlert('success', 'User deleted successfully')
        fetchUsers()
      } else {
        const error = await res.json()
        showAlert('error', error.message || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      showAlert('error', 'An error occurred')
    }
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio || '',
      image: user.image || '',
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'USER',
      bio: '',
      image: '',
    })
    setEditingUser(null)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'MODERATOR':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
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

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Users Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage platform users and their roles</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Search</Label>
              <Input
                placeholder="Name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <Label>Role</Label>
              <select
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="USER">User</option>
                <option value="MODERATOR">Moderator</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => { setSearch(''); setRoleFilter('') }}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-12 text-gray-600 dark:text-gray-400">Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-center py-12 text-gray-600 dark:text-gray-400">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-900 dark:text-white">User</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-900 dark:text-white">Role</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-900 dark:text-white">Activity</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-900 dark:text-white">Joined</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          {user.image ? (
                            <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                              {user.name[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded font-medium ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          <div>{user._count?.orders || 0} orders</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {user._count?.reviews || 0} reviews, {user._count?.blogPosts || 0} posts
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => openEditModal(user)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}>
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

      {/* Edit Modal */}
      {showModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Edit User
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Role *</Label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="USER">User</option>
                    <option value="MODERATOR">Moderator</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <Label>Bio</Label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Profile Image URL</Label>
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
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
                    Update User
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
