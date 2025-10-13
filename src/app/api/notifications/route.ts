import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

// GET user notifications
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        ...(unreadOnly && { seen: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        seen: false,
      },
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// POST mark notification as read
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationId, markAllRead } = await request.json()

    if (markAllRead) {
      // Mark all notifications as seen
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          seen: false,
        },
        data: { seen: true },
      })
      return NextResponse.json({ message: 'All notifications marked as seen' })
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'Missing notificationId' }, { status: 400 })
    }

    // Mark single notification as seen
    await prisma.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
      data: { seen: true },
    })

    return NextResponse.json({ message: 'Notification marked as read' })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 })
  }
}

// DELETE notification
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')

    if (!notificationId) {
      return NextResponse.json({ error: 'Missing notification ID' }, { status: 400 })
    }

    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: 'Notification deleted' })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 })
  }
}
