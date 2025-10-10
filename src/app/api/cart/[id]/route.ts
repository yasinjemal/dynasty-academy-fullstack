import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// PATCH update cart item quantity
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quantity } = await request.json()

    if (quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 })
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: params.id },
      data: { quantity },
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
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 })
  }
}

// DELETE remove item from cart
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    await prisma.cartItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Item removed from cart' })
  } catch (error) {
    console.error('Error removing cart item:', error)
    return NextResponse.json({ error: 'Failed to remove cart item' }, { status: 500 })
  }
}
