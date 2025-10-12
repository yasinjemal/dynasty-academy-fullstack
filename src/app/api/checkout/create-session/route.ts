import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { bookId, type = 'book' } = await req.json()

    if (type === 'book' && !bookId) {
      return NextResponse.json(
        { error: 'Book ID required' },
        { status: 400 }
      )
    }

    // For book purchase
    if (type === 'book') {
      const book = await prisma.book.findUnique({
        where: { id: bookId },
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          salePrice: true,
          coverImage: true
        }
      })

      if (!book) {
        return NextResponse.json(
          { error: 'Book not found' },
          { status: 404 }
        )
      }

      // Check if already purchased
      const existingPurchase = await prisma.purchase.findFirst({
        where: {
          userId: session.user.id,
          bookId,
          status: 'completed'
        }
      })

      if (existingPurchase) {
        return NextResponse.json({
          error: 'Book already purchased',
          purchased: true
        }, { status: 400 })
      }

      const amount = (book.salePrice || book.price) * 100 // Convert to cents

      // Create Stripe checkout session
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'zar',
              product_data: {
                name: book.title,
                description: 'Full book access - Lifetime',
                images: book.coverImage ? [book.coverImage] : []
              },
              unit_amount: amount
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: `${process.env.NEXTAUTH_URL}/books/${book.slug}/read?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/books/${book.slug}/read?canceled=true`,
        client_reference_id: session.user.id,
        metadata: {
          userId: session.user.id,
          bookId: book.id,
          type: 'book_purchase'
        }
      })

      return NextResponse.json({
        sessionId: checkoutSession.id,
        url: checkoutSession.url
      })
    }

    // For subscription
    if (type === 'subscription') {
      const { planId } = await req.json()
      
      // Get plan details (you can create these in Stripe dashboard)
      const prices = {
        basic: { price: 9900, name: 'Basic - 3 Books/Month' }, // R99
        pro: { price: 29900, name: 'Pro - Unlimited Books' }, // R299
        premium: { price: 49900, name: 'Premium - Books + Audio' } // R499
      }

      const plan = prices[planId as keyof typeof prices]
      if (!plan) {
        return NextResponse.json(
          { error: 'Invalid plan' },
          { status: 400 }
        )
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'zar',
              product_data: {
                name: plan.name,
                description: 'Monthly subscription'
              },
              unit_amount: plan.price,
              recurring: {
                interval: 'month'
              }
            },
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
        client_reference_id: session.user.id,
        metadata: {
          userId: session.user.id,
          type: 'subscription',
          planId
        }
      })

      return NextResponse.json({
        sessionId: checkoutSession.id,
        url: checkoutSession.url
      })
    }

    return NextResponse.json(
      { error: 'Invalid checkout type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
