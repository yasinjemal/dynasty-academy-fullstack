'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface LikeButtonProps {
  resourceType: 'BOOK' | 'BLOG'
  resourceId: string
  initialCount?: number
}

export default function LikeButton({ resourceType, resourceId, initialCount = 0 }: LikeButtonProps) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) {
      checkLikeStatus()
    }
  }, [session, resourceType, resourceId])

  const checkLikeStatus = async () => {
    try {
      const res = await fetch(`/api/likes?resourceType=${resourceType}&resourceId=${resourceId}`)
      if (res.ok) {
        const data = await res.json()
        setLiked(data.liked)
      }
    } catch (error) {
      console.error('Error checking like status:', error)
    }
  }

  const handleToggleLike = async () => {
    if (!session) {
      alert('Please sign in to like')
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceType, resourceId }),
      })

      if (res.ok) {
        const data = await res.json()
        setLiked(data.liked)
        setLikeCount((prev) => data.liked ? prev + 1 : Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <Link href="/login">
        <Button variant="outline" size="sm">
          <span className="mr-2">❤️</span>
          {likeCount > 0 && <span>{likeCount}</span>}
        </Button>
      </Link>
    )
  }

  return (
    <Button
      variant={liked ? 'default' : 'outline'}
      size="sm"
      onClick={handleToggleLike}
      disabled={loading}
      className={liked ? 'bg-red-500 hover:bg-red-600' : ''}
    >
      <span className="mr-2">{liked ? '❤️' : '🤍'}</span>
      {likeCount > 0 && <span>{likeCount}</span>}
    </Button>
  )
}
