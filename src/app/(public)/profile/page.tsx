'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import UserProfileDropdown from '@/components/shared/UserProfileDropdown'
import ThemeToggle from '@/components/shared/ThemeToggle'
import NotificationBell from '@/components/shared/NotificationBell'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    image: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
        bio: session.user.bio || '',
        image: session.user.image || '',
      }))
    }
  }, [status, session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Validate password fields if changing password
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage({ type: 'error', text: 'New passwords do not match' })
          setLoading(false)
          return
        }
        if (formData.newPassword.length < 8) {
          setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
          setLoading(false)
          return
        }
      }

      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
          image: formData.image,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        // Update session
        await update({
          ...session,
          user: {
            ...session?.user,
            name: formData.name,
            image: formData.image,
          }
        })
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }))
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' })
      }
    } catch (error) {
      console.error('Profile update error:', error)
      setMessage({ type: 'error', text: 'An error occurred while updating profile' })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/30 dark:to-blue-900/30">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/30 dark:to-blue-900/30">
      {/* Navigation */}
      <nav className="border-b border-white/20 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">DB</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dynasty Built
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/dashboard"><Button variant="ghost" size="sm">Dashboard</Button></Link>
              <Link href="/books"><Button variant="ghost" size="sm">Books</Button></Link>
              <Link href="/cart"><Button variant="ghost" size="sm">🛒</Button></Link>
              <ThemeToggle />
              <NotificationBell />
              <UserProfileDropdown />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl shadow-xl">
            👤
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        {message && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300'}`}>
            {message.text}
          </Alert>
        )}

        {/* Share Your Dynasty Profile - RESTORED */}
        <div className="mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 p-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-3xl">
                    🔗
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Share Your Dynasty Profile
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Show off your reading journey to the world
                    </p>
                  </div>
                </div>
                <Link href={`/u/${(session?.user?.name || '').toLowerCase().replace(/\s+/g, '-')}`} target="_blank">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    View Public Profile →
                  </Button>
                </Link>
              </div>
              <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between gap-3">
                  <code className="text-sm text-purple-800 dark:text-purple-300 font-mono flex-1">
                    {typeof window !== 'undefined' ? window.location.origin : 'https://dynastybuilt.com'}/u/{(session?.user?.name || '').toLowerCase().replace(/\s+/g, '-')}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const urlFriendlyUsername = (session?.user?.name || '').toLowerCase().replace(/\s+/g, '-')
                      const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://dynastybuilt.com'}/u/${urlFriendlyUsername}`
                      navigator.clipboard.writeText(url)
                      setMessage({ type: 'success', text: 'Profile link copied to clipboard!' })
                      setTimeout(() => setMessage(null), 3000)
                    }}
                  >
                    📋 Copy Link
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Preview Card */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle>Profile Preview</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {formData.image ? (
                <img
                  src={formData.image}
                  alt={formData.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-purple-500 shadow-xl"
                />
              ) : (
                <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-4xl border-4 border-purple-500 shadow-xl">
                  {formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {formData.name || 'Your Name'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {formData.email}
              </p>
              {formData.bio && (
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "{formData.bio}"
                </p>
              )}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Role:</span>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full font-semibold">
                      {session.user.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Member since:</span>
                    <span className="font-semibold">
                      {new Date(session.user.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Form */}
          <Card className="lg:col-span-2 border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formData.bio.length}/200 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="image">Profile Image URL</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>

                {/* Password Change */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold h-12 shadow-xl"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </span>
                    ) : (
                      '💾 Save Changes'
                    )}
                  </Button>
                  <Link href="/dashboard">
                    <Button type="button" variant="outline" className="h-12">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
