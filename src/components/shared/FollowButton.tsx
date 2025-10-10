'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface FollowButtonProps {
  userId: string
  userName?: string
}

export default function FollowButton({ userId, userName }: FollowButtonProps) {
  const { data: session } = useSession()
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session && session.user.id !== userId) {
      checkFollowStatus()
    }
  }, [session, userId])

  const checkFollowStatus = async () => {
    try {
      const res = await fetch(`/api/follows?followingId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setFollowing(data.following)
      }
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

  const handleToggleFollow = async () => {
    if (!session) {
      alert('Please sign in to follow users')
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followingId: userId }),
      })

      if (res.ok) {
        const data = await res.json()
        setFollowing(data.following)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setLoading(false)
    }
  }

  // Don't show button if viewing own profile
  if (session?.user.id === userId) {
    return null
  }

  if (!session) {
    return (
      <Link href="/login">
        <Button variant="outline" size="sm">
          Follow {userName}
        </Button>
      </Link>
    )
  }

  return (
    <Button
      variant={following ? 'outline' : 'default'}
      size="sm"
      onClick={handleToggleFollow}
      disabled={loading}
    >
      {loading ? 'Loading...' : following ? 'Following' : 'Follow'}
    </Button>
  )
}
