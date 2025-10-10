'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import FollowButton from '@/components/shared/FollowButton'

interface User {
  id: string
  name: string
  email: string
  image: string | null
  bio: string | null
  role: string
  createdAt: string
  _count?: {
    orders: number
    reviews: number
    blogPosts: number
    comments: number
    followers: number
    following: number
  }
}

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.userId as string
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [followers, setFollowers] = useState<any[]>([])
  const [following, setFollowing] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'activity' | 'followers' | 'following'>('activity')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [userId])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const [userRes, followersRes, followingRes] = await Promise.all([
        fetch(`/api/admin/users/${userId}`),
        fetch(`/api/users/${userId}/followers`),
        fetch(`/api/users/${userId}/following`),
      ])

      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData)
      }

      if (followersRes.ok) {
        const followersData = await followersRes.json()
        setFollowers(followersData.followers || [])
      }

      if (followingRes.ok) {
        const followingData = await followingRes.json()
        setFollowing(followingData.following || [])
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User not found</h2>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
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
              <Link href="/books"><Button variant="ghost" size="sm">Books</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              {user.image ? (
                <img src={user.image} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                  {user.name[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                  </div>
                  <FollowButton userId={user.id} userName={user.name} />
                </div>
                {user.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{user.bio}</p>
                )}
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white">{followers.length}</span>
                    <span className="text-gray-600 dark:text-gray-400"> Followers</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white">{following.length}</span>
                    <span className="text-gray-600 dark:text-gray-400"> Following</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white">{user._count?.blogPosts || 0}</span>
                    <span className="text-gray-600 dark:text-gray-400"> Posts</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'activity' ? 'default' : 'outline'}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </Button>
          <Button
            variant={activeTab === 'followers' ? 'default' : 'outline'}
            onClick={() => setActiveTab('followers')}
          >
            Followers ({followers.length})
          </Button>
          <Button
            variant={activeTab === 'following' ? 'default' : 'outline'}
            onClick={() => setActiveTab('following')}
          >
            Following ({following.length})
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'activity' && (
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {user._count?.orders || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Orders</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {user._count?.reviews || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Reviews</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {user._count?.blogPosts || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Blog Posts</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {user._count?.comments || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Comments</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'followers' && (
          <Card>
            <CardHeader>
              <CardTitle>Followers</CardTitle>
            </CardHeader>
            <CardContent>
              {followers.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No followers yet</p>
              ) : (
                <div className="space-y-3">
                  {followers.map((follower: any) => (
                    <div key={follower.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Link href={`/users/${follower.id}`} className="flex items-center gap-3 flex-1">
                        {follower.image ? (
                          <img src={follower.image} alt={follower.name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {follower.name[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{follower.name}</div>
                          {follower.bio && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{follower.bio}</div>
                          )}
                        </div>
                      </Link>
                      <FollowButton userId={follower.id} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'following' && (
          <Card>
            <CardHeader>
              <CardTitle>Following</CardTitle>
            </CardHeader>
            <CardContent>
              {following.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">Not following anyone yet</p>
              ) : (
                <div className="space-y-3">
                  {following.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Link href={`/users/${user.id}`} className="flex items-center gap-3 flex-1">
                        {user.image ? (
                          <img src={user.image} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{user.name}</div>
                          {user.bio && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{user.bio}</div>
                          )}
                        </div>
                      </Link>
                      <FollowButton userId={user.id} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
