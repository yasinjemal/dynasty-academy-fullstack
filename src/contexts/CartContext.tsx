'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface CartItem {
  id: string
  quantity: number
  book: {
    id: string
    title: string
    author: string
    price: number
    compareAtPrice: number | null
    coverImage: string | null
    slug: string
    stockQuantity?: number
  }
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  total: number
  loading: boolean
  addToCart: (bookId: string, quantity?: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [items, setItems] = useState<CartItem[]>([])
  const [itemCount, setItemCount] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      refreshCart()
    } else if (status === 'unauthenticated') {
      setItems([])
      setItemCount(0)
      setTotal(0)
      setLoading(false)
    }
  }, [status])

  const refreshCart = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
        setItemCount(data.itemCount || 0)
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (bookId: string, quantity = 1) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, quantity }),
      })

      if (res.ok) {
        await refreshCart()
      } else {
        throw new Error('Failed to add to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw error
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })

      if (res.ok) {
        await refreshCart()
      } else {
        throw new Error('Failed to update quantity')
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      throw error
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await refreshCart()
      } else {
        throw new Error('Failed to remove item')
      }
    } catch (error) {
      console.error('Error removing item:', error)
      throw error
    }
  }

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      total,
      loading,
      addToCart,
      updateQuantity,
      removeItem,
      refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
