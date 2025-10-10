import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            price: true,
            coverImage: true,
            slug: true,
          },
        },
      },
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Create Stripe checkout session
    const line_items = cartItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.book.title,
          images: item.book.coverImage ? [item.book.coverImage] : [],
        },
        unit_amount: Math.round(item.book.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id,
        cartItems: JSON.stringify(
          cartItems.map((item) => ({
            bookId: item.bookId,
            quantity: item.quantity,
            price: item.book.price,
          }))
        ),
      },
    })

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
