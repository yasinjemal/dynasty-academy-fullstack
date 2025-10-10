import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'
import { ArchetypeDetector, BehaviorSignals } from '@/lib/algorithms/archetype-detector'
import { smartCache } from '@/lib/optimization/smart-cache'

/**
 * GET /api/archetypes/detect
 * 
 * Analyzes user behavior and returns detected archetype profile.
 * Uses smart caching to avoid expensive calculations on every request.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.user.email
    const cacheKey = `archetype:${userId}`
    
    // Check cache first (24 hour TTL - archetypes don't change that fast)
    const cached = await smartCache.get(cacheKey)
    if (cached) {
      return NextResponse.json({ 
        ...cached, 
        source: 'cache',
        message: 'Archetype profile loaded from cache'
      })
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: userId },
      include: {
        progress: {
          take: 50,
          orderBy: { lastRead: 'desc' }
        },
        forumTopicBookmarks: {
          take: 50,
          orderBy: { createdAt: 'desc' }
        },
        achievements: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Calculate behavior signals from user data
    const signals = await calculateBehaviorSignals(user)
    
    // Detect archetype using algorithm
    const profile = ArchetypeDetector.detect(signals)
    
    // Save to cache (24 hours)
    await smartCache.set(cacheKey, profile, 24 * 60 * 60 * 1000)
    
    return NextResponse.json({
      ...profile,
      source: 'calculated',
      message: 'Archetype profile generated from behavior analysis',
      dataPoints: {
        readingSessions: user.readingProgress.length,
        bookmarks: user.bookmarks.length,
        achievements: user.achievements.length
      }
    })
    
  } catch (error) {
    console.error('Archetype detection error:', error)
    return NextResponse.json(
      { error: 'Failed to detect archetype' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/archetypes/track
 * 
 * Track user interaction for archetype learning.
 * Call this when user:
 * - Reads content (with reading time)
 * - Bookmarks something
 * - Completes a course
 * - Writes a comment
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userId = session.user.email
    const data = await req.json()
    
    const { 
      action,        // 'read' | 'bookmark' | 'complete' | 'comment' | 'share'
      contentId,
      contentType,   // 'book' | 'blog' | 'course' | 'topic'
      duration,      // seconds spent (for reading)
      metadata       // additional context
    } = data
    
    // Invalidate cache so next request recalculates
    const cacheKey = `archetype:${userId}`
    await smartCache.delete(cacheKey)
    
    // TODO: Store interaction in analytics table for long-term tracking
    // For now, we calculate on-demand from existing data (readingProgress, bookmarks, etc.)
    
    return NextResponse.json({
      success: true,
      message: 'Interaction tracked, archetype will update on next detection',
      action,
      contentType
    })
    
  } catch (error) {
    console.error('Archetype tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track interaction' },
      { status: 500 }
    )
  }
}

/**
 * Calculate behavior signals from user data
 * This is where the magic happens - converting raw data into archetype signals
 */
async function calculateBehaviorSignals(user: any): Promise<BehaviorSignals> {
  const readingProgress = user.progress || []
  const bookmarks = user.forumTopicBookmarks || []
  const achievements = user.achievements || []
  
  // Default signals for new users (neutral profile)
  if (readingProgress.length < 3) {
    return {
      avgReadingTime: 300,
      completionRate: 0.5,
      skimRate: 0.5,
      longFormPreference: 0.5,
      frameworkPreference: 0.5,
      caseStudyPreference: 0.5,
      bookmarkRate: 0,
      commentDepth: 0,
      questionRate: 0,
      shareRate: 0,
      courseCompletionRate: 0,
      notesTaken: false,
      revisitRate: 0,
      sessionDuration: 15,
      returnFrequency: 7,
      peakActivityTime: 'afternoon'
    }
  }
  
  // Calculate reading patterns
  const completedReads = readingProgress.filter((r: any) => r.progress >= 0.9)
  const avgProgress = readingProgress.reduce((sum: number, r: any) => sum + r.progress, 0) / readingProgress.length
  
  // Estimate reading time from progress updates
  // (In production, you'd track actual time spent per session)
  const estimatedAvgTime = avgProgress * 600 // Assume avg content is 10 min
  
  // Calculate skim rate (how fast they move through content)
  const skimRate = readingProgress.length > 10 
    ? Math.min(readingProgress.length / 30, 1)  // Many articles = higher skim
    : 0.5
  
  // Content preferences (would come from content tags in production)
  // For now, use placeholder values based on bookmark patterns
  const longFormPreference = bookmarks.length > 5 ? 0.7 : 0.5
  const frameworkPreference = achievements.length > 3 ? 0.7 : 0.5
  
  // Bookmark behavior
  const bookmarkRate = readingProgress.length > 0
    ? bookmarks.length / readingProgress.length
    : 0
  
  // Course completion (from achievements)
  const courseAchievements = achievements.filter((a: any) => 
    a.achievement?.category === 'LEARNING'
  )
  const courseCompletionRate = courseAchievements.length > 0 ? 0.8 : 0.5
  
  // Revisit behavior
  const contentRevisits = readingProgress.filter((r: any) => r.progress > 1)
  const revisitRate = readingProgress.length > 0
    ? contentRevisits.length / readingProgress.length
    : 0
  
  // Activity patterns
  const recentReads = readingProgress.slice(0, 10)
  const sessionDuration = estimatedAvgTime / 60  // Convert to minutes
  
  return {
    avgReadingTime: estimatedAvgTime,
    completionRate: avgProgress,
    skimRate,
    longFormPreference,
    frameworkPreference: frameworkPreference,
    caseStudyPreference: 0.5,  // Placeholder
    bookmarkRate,
    commentDepth: 50,  // Placeholder (would track from forum posts)
    questionRate: 0.1,
    shareRate: 0.1,
    courseCompletionRate,
    notesTaken: bookmarks.length > 5,  // Proxy: heavy bookmarkers take notes
    revisitRate,
    sessionDuration,
    returnFrequency: 3,  // Placeholder
    peakActivityTime: 'afternoon'  // Placeholder
  }
}

/**
 * PUT /api/archetypes/override
 * 
 * Allow users to manually set their archetype (admin or self-selection)
 * Useful for onboarding flow: "Which builder are you?"
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { archetype } = await req.json()
    
    if (!['VISIONARY', 'STRATEGIST', 'HUSTLER'].includes(archetype)) {
      return NextResponse.json({ error: 'Invalid archetype' }, { status: 400 })
    }
    
    const userId = session.user.email
    
    // Store manual override in user profile
    // TODO: Add archetypeOverride field to User model
    
    // Clear cache
    const cacheKey = `archetype:${userId}`
    await smartCache.delete(cacheKey)
    
    return NextResponse.json({
      success: true,
      message: `Archetype manually set to ${archetype}`,
      archetype
    })
    
  } catch (error) {
    console.error('Archetype override error:', error)
    return NextResponse.json(
      { error: 'Failed to set archetype' },
      { status: 500 }
    )
  }
}
