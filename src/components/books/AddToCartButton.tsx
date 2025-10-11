'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface AddToCartButtonProps {
  bookId: string
  bookTitle: string
}

export default function AddToCartButton({ bookId, bookTitle }: AddToCartButtonProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    setIsAdding(true)
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

      alert(`"${bookTitle}" added to cart successfully!`)
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Failed to add to cart')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Button 
      className="flex-1" 
      onClick={handleAddToCart}
      disabled={isAdding}
    >
      {isAdding ? 'Adding...' : 'Add to Cart'}
    </Button>
  )
}
