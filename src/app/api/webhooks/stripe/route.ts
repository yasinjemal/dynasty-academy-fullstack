import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db/prisma'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      // Get metadata
      const userId = session.metadata?.userId
      const cartItemsData = session.metadata?.cartItems

      if (!userId || !cartItemsData) {
        throw new Error('Missing metadata')
      }

      const cartItems = JSON.parse(cartItemsData) as Array<{
        bookId: string
        quantity: number
        price: number
      }>

      // Calculate total
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )

      // Create order
      const order = await prisma.order.create({
        data: {
          userId,
          totalAmount,
          status: 'COMPLETED',
          paymentMethod: 'STRIPE',
          stripePaymentId: session.payment_intent as string,
          items: {
            create: cartItems.map((item) => ({
              bookId: item.bookId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              book: true,
            },
          },
        },
      })

      // Clear user's cart
      await prisma.cartItem.deleteMany({
        where: { userId },
      })

      // Create notification
      await prisma.notification.create({
        data: {
          userId,
          type: 'ORDER',
          title: 'Order Confirmed',
          message: `Your order #${order.id.slice(0, 8)} has been confirmed!`,
          read: false,
        },
      })

      console.log('Order created successfully:', order.id)
    } catch (error) {
      console.error('Error processing payment:', error)
      return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
