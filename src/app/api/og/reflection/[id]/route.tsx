import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Removed 'edge' runtime - Prisma requires Node.js runtime
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch reflection data
    const reflection = await prisma.bookReflection.findFirst({
      where: { 
        id,
        isPublic: true,
      },
      select: {
        content: true,
        chapterNumber: true,
        createdAt: true,
        communityPostId: true,
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        book: {
          select: {
            title: true,
          },
        },
      },
    })

    if (!reflection) {
      return new Response('Reflection not found', { status: 404 })
    }

    // Get likes count if community post exists
    let likesCount = 0
    if (reflection.communityPostId) {
      const communityPost = await prisma.forumTopic.findUnique({
        where: { id: reflection.communityPostId },
        select: {
          _count: {
            select: {
              likes: true,
            },
          },
        },
      })
      likesCount = communityPost?._count.likes || 0
    }

    // Truncate content to 200 characters
    const excerpt =
      reflection.content.length > 200
        ? reflection.content.substring(0, 200) + '...'
        : reflection.content

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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'Inter, sans-serif',
            padding: '60px',
          }}
        >
          {/* Top Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              padding: '12px 24px',
              borderRadius: '50px',
              marginBottom: '40px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: '32px',
              }}
            >
              🏛️
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '28px',
                fontWeight: '700',
                color: 'white',
                letterSpacing: '-0.5px',
              }}
            >
              Dynasty Built
            </div>
          </div>

          {/* Main Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '32px',
              padding: '48px',
              width: '90%',
              maxWidth: '900px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Book + Chapter Info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: '20px',
                }}
              >
                📖
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: '22px',
                  fontWeight: '600',
                  color: '#4C1D95',
                }}
              >
                {reflection.book.title}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: '20px',
                  color: '#9333EA',
                  fontWeight: '500',
                }}
              >
                · Chapter {reflection.chapterNumber}
              </div>
            </div>

            {/* Reflection Content */}
            <div
              style={{
                display: 'flex',
                fontSize: '32px',
                lineHeight: '1.5',
                color: '#1F2937',
                fontWeight: '400',
                marginBottom: '32px',
                fontStyle: 'italic',
              }}
            >
              "{excerpt}"
            </div>

            {/* Author + Stats */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '24px',
                borderTop: '2px solid #E5E7EB',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                {reflection.user.image ? (
                  <img
                    src={reflection.user.image}
                    alt={reflection.user.name}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      border: '3px solid #9333EA',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      fontWeight: '700',
                      color: 'white',
                    }}
                  >
                    {reflection.user.name[0]?.toUpperCase()}
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#111827',
                    }}
                  >
                    {reflection.user.name}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      fontSize: '18px',
                      color: '#6B7280',
                    }}
                  >
                    Dynasty Builder
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                  padding: '16px 28px',
                  borderRadius: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: '28px',
                  }}
                >
                  ❤️
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#92400E',
                  }}
                >
                  {likesCount}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom URL */}
          <div
            style={{
              display: 'flex',
              marginTop: '40px',
              fontSize: '24px',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '600',
            }}
          >
            dynastybuilt.com/reflection/{id.slice(0, 8)}...
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
