'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Order {
  id: string
  totalAmount: number
  status: string
  paymentMethod: string
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    price: number
    book: {
      id: string
      title: string
      author: string
      coverImage: string | null
      slug: string
    }
  }>
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders()
    }
  }, [status])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sign in required</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please sign in to view your orders
            </p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
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

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No orders yet</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start shopping to see your orders here!
              </p>
              <Link href="/books">
                <Button>Browse Books</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Order #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${order.totalAmount.toFixed(2)}
                      </div>
                      <span className={`inline-block px-3 py-1 text-xs rounded-full mt-2 ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                        {item.book.coverImage ? (
                          <img
                            src={item.book.coverImage}
                            alt={item.book.title}
                            className="w-16 h-20 object-cover rounded flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-xs">No image</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <Link href={`/books/${item.book.slug}`}>
                            <h4 className="font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400">
                              {item.book.title}
                            </h4>
                          </Link>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            by {item.book.author}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Quantity: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
