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
            salePrice: true,
            coverImage: true,
            slug: true,
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
      return NextResponse.json({ message: 'Please login to add items to cart' }, { status: 401 })
    }

    const { bookId, quantity = 1 } = await request.json()

    if (!bookId) {
      return NextResponse.json({ message: 'Book ID is required' }, { status: 400 })
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    })

    if (!book) {
      return NextResponse.json({ message: 'Book not found' }, { status: 404 })
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
              salePrice: true,
              coverImage: true,
              slug: true,
            },
          },
        },
      })
      return NextResponse.json({ 
        message: 'Cart updated successfully',
        item: updatedItem 
      })
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
            salePrice: true,
            coverImage: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json({ 
      message: 'Book added to cart successfully',
      item: cartItem 
    }, { status: 201 })
  } catch (error: any) {
    console.error('Add to cart error:', error)
    return NextResponse.json({ 
      message: error.message || 'Failed to add to cart' 
    }, { status: 500 })
  }
}

// PATCH update cart item quantity
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { itemId, quantity } = await request.json()

    if (!itemId || quantity === undefined) {
      return NextResponse.json({ error: 'Item ID and quantity are required' }, { status: 400 })
    }

    if (quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 })
    }

    // Update cart item
    const updatedItem = await prisma.cartItem.update({
      where: { 
        id: itemId,
        userId: session.user.id // Ensure user owns this cart item
      },
      data: { quantity },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            price: true,
            salePrice: true,
          },
        },
      },
    })

    return NextResponse.json({ 
      message: 'Cart updated successfully',
      item: updatedItem 
    })
  } catch (error: any) {
    console.error('Update cart error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to update cart' 
    }, { status: 500 })
  }
}

// DELETE remove item from cart
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { 
        id: itemId,
        userId: session.user.id // Ensure user owns this cart item
      },
    })

    return NextResponse.json({ message: 'Item removed from cart' })
  } catch (error: any) {
    console.error('Delete cart item error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to remove item from cart' 
    }, { status: 500 })
  }
}
