import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { bookId } = await params
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { paymentIntentId, amount, provider } = await req.json()

    if (!paymentIntentId || !amount) {
      return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      )
    }

    // Verify book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { id: true, price: true, salePrice: true, title: true }
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    // Verify amount matches book price
    const expectedAmount = book.salePrice || book.price
    if (Math.abs(amount - expectedAmount) > 0.01) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
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
        success: true,
        message: 'Book already purchased',
        purchase: existingPurchase
      })
    }

    // Create purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId: session.user.id,
        bookId,
        amount,
        status: 'completed',
        paymentProvider: provider || 'stripe',
        paymentIntentId,
        metadata: {
          bookTitle: book.title,
          purchasedAt: new Date().toISOString()
        }
      }
    })

    // Award achievement for first purchase
    try {
      await prisma.userAchievement.upsert({
        where: {
          userId_achievementId: {
            userId: session.user.id,
            achievementId: 'first-purchase'
          }
        },
        update: {
          progress: { increment: 1 }
        },
        create: {
          userId: session.user.id,
          achievementId: 'first-purchase',
          progress: 1,
          unlockedAt: new Date()
        }
      })
    } catch (error) {
      console.log('Achievement update skipped:', error)
    }

    return NextResponse.json({
      success: true,
      purchase,
      message: 'Purchase completed successfully'
    })
  } catch (error) {
    console.error('Purchase error:', error)
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    )
  }
}

// Check if user has purchased a book
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { bookId } = await params
    
    if (!session?.user) {
      return NextResponse.json({ purchased: false })
    }

    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        bookId,
        status: 'completed'
      }
    })

    return NextResponse.json({
      purchased: !!purchase,
      purchase: purchase || null
    })
  } catch (error) {
    console.error('Purchase check error:', error)
    return NextResponse.json({ purchased: false })
  }
}
