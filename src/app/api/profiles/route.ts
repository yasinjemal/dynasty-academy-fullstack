import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      where: {
        bookReflections: {
          some: {
            isPublic: true,
          },
        },
      },
      select: {
        name: true,
        createdAt: true,
        _count: {
          select: {
            bookReflections: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    })

    return NextResponse.json({
      users: users.map((user) => ({
        username: user.name,
        profileUrl: `/@${encodeURIComponent(user.name)}`,
        reflectionsCount: user._count.bookReflections,
        joinedAt: user.createdAt,
      })),
      total: users.length,
    })
  } catch (error: any) {
    console.error('Error fetching public profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}
