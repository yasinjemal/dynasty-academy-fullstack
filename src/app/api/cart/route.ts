import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// GET user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            price: true,
            compareAtPrice: true,
            coverImage: true,
            slug: true,
            stockQuantity: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const total = cartItems.reduce((sum: number, item: any) => sum + (item.book.price * item.quantity), 0)
    const itemCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0)

    return NextResponse.json({
      items: cartItems,
      total,
      itemCount,
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

// POST add item to cart
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookId, quantity = 1 } = await request.json()

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 })
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        bookId,
      },
    })

    if (existingItem) {
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              price: true,
              compareAtPrice: true,
              coverImage: true,
              slug: true,
            },
          },
        },
      })
      return NextResponse.json(updatedItem)
    }

    // Create new cart item
    const cartItem = await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        bookId,
        quantity,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            price: true,
            compareAtPrice: true,
            coverImage: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json(cartItem, { status: 201 })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}
