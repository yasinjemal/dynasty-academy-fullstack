'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { items, itemCount, total, loading, updateQuantity, removeItem } = useCart()
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading cart...</p>
        </div>
      </div>
    )
  }

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true)
      const res = await fetch('/api/checkout', { method: 'POST' })
      
      if (res.ok) {
        const { url } = await res.json()
        window.location.href = url
      } else {
        alert('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('An error occurred during checkout')
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sign in required</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please sign in to view your cart
            </p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

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
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/dashboard"><Button variant="ghost" size="sm" className="text-sm">Dashboard</Button></Link>
              <Link href="/books"><Button variant="ghost" size="sm" className="text-sm">Books</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl shadow-xl">
            🛒
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
              Shopping Cart
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="py-20 text-center">
              <div className="text-7xl mb-6 animate-bounce-slow">🛒</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Your cart is empty</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                Discover amazing books and start your learning journey!
              </p>
              <Link href="/books">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg shadow-xl">
                  Browse Books
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <Card 
                  key={item.id} 
                  className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Book Cover */}
                      {item.book.coverImage ? (
                        <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                          <img
                            src={item.book.coverImage}
                            alt={item.book.title}
                            className="w-32 h-44 sm:w-24 sm:h-32 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300"
                          />
                          {item.book.compareAtPrice && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                              SALE
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-32 h-44 sm:w-24 sm:h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg mx-auto sm:mx-0">
                          <span className="text-xs text-gray-500">📚</span>
                        </div>
                      )}
                      
                      {/* Book Details */}
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <Link href={`/books/${item.book.slug}`}>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 mb-1 transition-colors">
                            {item.book.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          by <span className="font-semibold">{item.book.author}</span>
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Qty:</label>
                            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full shadow-inner">
                              <button
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="w-10 h-10 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors flex items-center justify-center font-bold text-lg"
                              >
                                −
                              </button>
                              <span className="px-6 py-2 font-bold text-lg text-purple-600 dark:text-purple-400">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-10 h-10 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors flex items-center justify-center font-bold text-lg"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeItem(item.id)}
                            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg"
                          >
                            🗑️ Remove
                          </Button>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="text-center sm:text-right flex-shrink-0 border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-700 pt-4 sm:pt-0 sm:pl-6">
                        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          ${(item.book.price * item.quantity).toFixed(2)}
                        </div>
                        {item.book.compareAtPrice && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-through mt-1">
                            ${(item.book.compareAtPrice * item.quantity).toFixed(2)}
                          </div>
                        )}
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full inline-block">
                          ${item.book.price.toFixed(2)} each
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary - Sticky */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-0 shadow-2xl bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/30 backdrop-blur-sm">
                <CardHeader className="border-b border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-sm">
                      💰
                    </div>
                    <CardTitle className="text-xl">Order Summary</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                    <span className="text-lg font-bold">${total.toFixed(2)}</span>
                  </div>
                  
                  {/* Shipping */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 font-semibold">Shipping</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs line-through text-gray-400">$9.99</span>
                      <span className="text-green-600 dark:text-green-400 font-bold">FREE ✨</span>
                    </div>
                  </div>
                  
                  {/* Discount */}
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                      <span>🎉</span>
                      <span className="font-semibold">You're saving on shipping!</span>
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tax included</p>
                  </div>
                  
                  {/* Checkout Button */}
                  <Button 
                    className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" 
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        🔒 Secure Checkout
                      </span>
                    )}
                  </Button>
                  
                  {/* Continue Shopping */}
                  <Link href="/books" className="block">
                    <Button variant="outline" className="w-full h-12 font-semibold border-2 hover:bg-purple-50 dark:hover:bg-purple-900/30">
                      ← Continue Shopping
                    </Button>
                  </Link>
                  
                  {/* Trust Badges */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">🔒 Secure</span>
                      <span className="flex items-center gap-1">✓ Trusted</span>
                      <span className="flex items-center gap-1">🚀 Fast</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
