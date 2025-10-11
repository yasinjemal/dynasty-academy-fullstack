'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface BookActionsProps {
  bookId: string
  price: number
  salePrice?: number | null
}

export default function BookActions({ bookId, price, salePrice }: BookActionsProps) {
  const router = useRouter()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, quantity: 1 }),
      })

      if (!res.ok) {
        const data = await res.json()
        if (res.status === 401) {
          router.push('/login')
          return
        }
        throw new Error(data.message || 'Failed to add to cart')
      }

      alert('Book added to cart successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to add to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleSaveForLater = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      })

      if (!res.ok) {
        const data = await res.json()
        if (res.status === 401) {
          router.push('/login')
          return
        }
        throw new Error(data.message || 'Failed to save bookmark')
      }

      alert('Book saved for later!')
    } catch (error: any) {
      alert(error.message || 'Failed to save bookmark')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        {salePrice ? (
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">
              ${salePrice}
            </span>
            <span className="text-xl text-gray-500 line-through">
              ${price}
            </span>
          </div>
        ) : (
          <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">
            ${price}
          </span>
        )}
      </div>

      <Button 
        className="w-full" 
        size="lg" 
        onClick={handleAddToCart}
        disabled={isAddingToCart}
      >
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        {isAddingToCart ? 'Adding...' : 'Add to Cart'}
      </Button>

      <Button 
        variant="outline" 
        className="w-full"
        onClick={handleSaveForLater}
        disabled={isSaving}
      >
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        {isSaving ? 'Saving...' : 'Save for Later'}
      </Button>
    </div>
  )
}
