import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Removed 'edge' runtime - Prisma requires Node.js runtime
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    // Fetch user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        image: true,
        progress: {
          select: {
            reflectionsCount: true,
            completed: true,
          },
        },
        achievements: {
          select: {
            id: true,
            achievementId: true,
          },
        },
        bookReflections: {
          where: {
            communityPostId: { not: null },
          },
          select: {
            communityPost: {
              select: {
                _count: {
                  select: {
                    likes: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      return new Response('User not found', { status: 404 })
    }

    // Filter out achievements where the achievement was deleted
    const achievementIds = user.achievements.map((ua: any) => ua.achievementId)
    const validAchievements = await prisma.achievement.findMany({
      where: {
        id: { in: achievementIds },
      },
      select: { id: true },
    })
    const validAchievementIds = new Set(validAchievements.map((a: any) => a.id))
    const achievementsCount = user.achievements.filter((ua: any) => validAchievementIds.has(ua.achievementId)).length

    // Calculate stats
    const reflectionsCount = user.progress.reduce(
      (sum: number, p: any) => sum + (p.reflectionsCount || 0),
      0
    )
    const completedBooks = user.progress.filter((p: any) => p.completed).length
    const totalLikes = user.bookReflections.reduce(
      (sum: number, r: any) => sum + (r.communityPost?._count.likes || 0),
      0
    )

    // Calculate Dynasty Points
    const dynastyPoints =
      reflectionsCount * 10 +
      completedBooks * 50 +
      totalLikes * 2 +
      achievementsCount * 25

    // Calculate level
    const level = Math.floor(dynastyPoints / 100) + 1

    // Get rank title based on level
    const getRankTitle = (lvl: number) => {
      if (lvl >= 50) return '👑 Dynasty Emperor'
      if (lvl >= 40) return '🏛️ Grand Architect'
      if (lvl >= 30) return '⚔️ War General'
      if (lvl >= 20) return '🎖️ Master Builder'
      if (lvl >= 10) return '🛡️ Elite Warrior'
      if (lvl >= 5) return '⚡ Rising Builder'
      return '🌱 New Builder'
    }

    const rankTitle = getRankTitle(level)

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
            background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #1e1b4b 100%)',
            fontFamily: 'Inter, sans-serif',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Animated Background Particles */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.4) 0%, transparent 50%)',
            }}
          />

          {/* Top Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '16px 32px',
              borderRadius: '50px',
              marginBottom: '48px',
              border: '3px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ fontSize: '40px' }}>🏛️</div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: '800',
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
              alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '40px',
              padding: '64px',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              position: 'relative',
            }}
          >
            {/* Glow Effect */}
            <div
              style={{
                position: 'absolute',
                inset: '-2px',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.5), rgba(59, 130, 246, 0.5))',
                borderRadius: '40px',
                filter: 'blur(20px)',
                opacity: 0.5,
                zIndex: '-1',
              }}
            />

            {/* User Avatar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '32px',
                position: 'relative',
              }}
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  style={{
                    width: '160px',
                    height: '160px',
                    borderRadius: '50%',
                    border: '6px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 0 60px rgba(168, 85, 247, 0.8)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '160px',
                    height: '160px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '80px',
                    fontWeight: '700',
                    color: 'white',
                    border: '6px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 0 60px rgba(168, 85, 247, 0.8)',
                  }}
                >
                  {user.name[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* User Name */}
            <div
              style={{
                fontSize: '48px',
                fontWeight: '800',
                color: 'white',
                marginBottom: '16px',
                textAlign: 'center',
                textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              }}
            >
              {user.name}
            </div>

            {/* Rank Title */}
            <div
              style={{
                fontSize: '28px',
                fontWeight: '600',
                background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                backgroundClip: 'text',
                color: 'transparent',
                marginBottom: '32px',
                textAlign: 'center',
              }}
            >
              {rankTitle}
            </div>

            {/* Level & Points */}
            <div
              style={{
                display: 'flex',
                gap: '48px',
                marginBottom: '40px',
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
                    fontSize: '20px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '8px',
                  }}
                >
                  Level
                </div>
                <div
                  style={{
                    fontSize: '64px',
                    fontWeight: '800',
                    color: 'white',
                    textShadow: '0 4px 12px rgba(168, 85, 247, 0.8)',
                  }}
                >
                  {level}
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
                    fontSize: '20px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '8px',
                  }}
                >
                  Dynasty Points
                </div>
                <div
                  style={{
                    fontSize: '64px',
                    fontWeight: '800',
                    background: 'linear-gradient(90deg, #a855f7, #3b82f6)',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {dynastyPoints.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div
              style={{
                display: 'flex',
                gap: '32px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '20px 32px',
                  background: 'rgba(168, 85, 247, 0.2)',
                  borderRadius: '20px',
                  border: '2px solid rgba(168, 85, 247, 0.4)',
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>📚</div>
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: 'white',
                  }}
                >
                  {completedBooks}
                </div>
                <div style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  Books
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '20px 32px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  borderRadius: '20px',
                  border: '2px solid rgba(59, 130, 246, 0.4)',
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>💭</div>
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: 'white',
                  }}
                >
                  {reflectionsCount}
                </div>
                <div style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  Reflections
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '20px 32px',
                  background: 'rgba(251, 191, 36, 0.2)',
                  borderRadius: '20px',
                  border: '2px solid rgba(251, 191, 36, 0.4)',
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🏆</div>
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: 'white',
                  }}
                >
                  {achievementsCount}
                </div>
                <div style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  Achievements
                </div>
              </div>
            </div>
          </div>

          {/* Bottom URL */}
          <div
            style={{
              marginTop: '48px',
              fontSize: '28px',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '700',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            }}
          >
            dynastybuilt.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating Dynasty Card:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
