'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchNotifications()
    }
  }, [session, filter])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const url = filter === 'unread' 
        ? '/api/notifications?unreadOnly=true&limit=100'
        : '/api/notifications?limit=100'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })
      if (res.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      if (res.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LIKE': return '❤️'
      case 'COMMENT': return '💬'
      case 'FOLLOW': return '👤'
      case 'ORDER': return '🛒'
      case 'ACHIEVEMENT': return '🏆'
      default: return '🔔'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sign in to view notifications</h2>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-purple-100 dark:border-purple-900 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
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
              <Link href="/dashboard"><Button variant="ghost" size="sm">Dashboard</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">🔔 Notifications</h1>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread
            </Button>
            {notifications.some(n => !n.read) && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                <span className="text-6xl mb-4 block">🔔</span>
                <p className="text-lg">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {notification.title}
                          </h3>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors text-xl"
                            aria-label="Delete notification"
                          >
                            ×
                          </button>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatTimestamp(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
