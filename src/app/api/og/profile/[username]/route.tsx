import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const username = decodeURIComponent(params.username.replace('@', ''))
    // Convert hyphens back to spaces for lookup
    const normalizedWithSpaces = username.replace(/-/g, ' ').trim()

    // Get user data
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: username },
          { name: normalizedWithSpaces },
          { email: username },
        ],
      },
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
      },
    })

    if (!user) {
      return new Response('User not found', { status: 404 })
    }

    // Get user stats
    const [reflectionsCount, booksCount, achievementsCount] = await Promise.all([
      prisma.bookReflection.count({
        where: {
          userId: user.id,
          isPublic: true,
        },
      }),
      prisma.bookProgress.count({
        where: {
          userId: user.id,
          status: 'COMPLETED',
        },
      }),
      prisma.userAchievement.count({
        where: {
          userId: user.id,
        },
      }),
    ])

    // Calculate points and level
    const totalPoints = (reflectionsCount * 10) + (booksCount * 50) + (achievementsCount * 25)
    const level = Math.floor(totalPoints / 100) + 1

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
            position: 'relative',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              display: 'flex',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'white',
                filter: 'blur(100px)',
                display: 'flex',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-10%',
                right: '-10%',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'white',
                filter: 'blur(100px)',
                display: 'flex',
              }}
            />
          </div>

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
              zIndex: 1,
            }}
          >
            {/* Logo */}
            <div
              style={{
                fontSize: 60,
                marginBottom: 30,
                display: 'flex',
              }}
            >
              🏛️
            </div>

            {/* User Avatar/Initial */}
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 80,
                fontWeight: 'bold',
                color: 'white',
                border: '6px solid rgba(255,255,255,0.3)',
                marginBottom: 30,
              }}
            >
              {user.name[0]?.toUpperCase() || 'D'}
            </div>

            {/* User Name */}
            <div
              style={{
                fontSize: 56,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 20,
                textAlign: 'center',
                display: 'flex',
              }}
            >
              {user.name}
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: 28,
                color: 'rgba(255,255,255,0.9)',
                marginBottom: 50,
                display: 'flex',
              }}
            >
              Dynasty Builder • Level {level}
            </div>

            {/* Stats */}
            <div
              style={{
                display: 'flex',
                gap: 60,
                marginBottom: 40,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: 'white',
                    display: 'flex',
                  }}
                >
                  {totalPoints}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    color: 'rgba(255,255,255,0.8)',
                    display: 'flex',
                  }}
                >
                  Points
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: 'white',
                    display: 'flex',
                  }}
                >
                  {booksCount}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    color: 'rgba(255,255,255,0.8)',
                    display: 'flex',
                  }}
                >
                  Books
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: 'white',
                    display: 'flex',
                  }}
                >
                  {reflectionsCount}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    color: 'rgba(255,255,255,0.8)',
                    display: 'flex',
                  }}
                >
                  Reflections
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                fontSize: 22,
                color: 'rgba(255,255,255,0.9)',
                display: 'flex',
              }}
            >
              dynastybuilt.com/@{username}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error: any) {
    console.error('OG Image Error:', error)
    return new Response(`Failed to generate image: ${error.message}`, { status: 500 })
  }
}
