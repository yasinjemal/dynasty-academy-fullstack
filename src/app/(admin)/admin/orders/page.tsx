'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminOrdersPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Orders Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage customer orders</p>
        </div>
        <Button>
          <span className="mr-2">📊</span>
          Export Orders
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 text-center py-12">
            Order management interface coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
