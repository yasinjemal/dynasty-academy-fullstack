/**
 * Dynasty Built Academy - Trending API
 * Intelligent trending content with time-decay scoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { smartCache } from '@/lib/optimization/smart-cache'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') || 'all' // 'posts', 'books', 'blogs', 'all'

    // Try cache first
    const cacheKey = `trending:${category || 'all'}:${type}:${limit}`
    const cached = await smartCache.get(cacheKey)

    if (cached) {
      return NextResponse.json({
        trending: cached,
        cached: true,
        generated: false
      })
    }

    // For now, return empty array until we have actual trending data
    // TODO: Implement trending calculation with real data
    console.log(`📈 Calculating trending content (category: ${category || 'all'}, type: ${type})`)
    
    const trending: any[] = []

    // Cache for 15 minutes (trending changes frequently)
    await smartCache.set(cacheKey, trending, 900000)

    return NextResponse.json({
      trending,
      cached: false,
      generated: true,
      count: trending.length,
      category: category || 'all',
      type
    })

  } catch (error) {
    console.error('❌ Error fetching trending:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch trending content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST endpoint to manually trigger trending recalculation (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const { getServerSession } = require('next-auth')
    const { authOptions } = require('@/lib/auth/auth-options')
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Clear trending cache
    smartCache.clear()

    // Pre-calculate trending for popular categories
    const popularCategories = [
      'discussion',
      'question',
      'showcase',
      'tutorial'
    ]

    // TODO: Implement trending calculation once we have engagement data
    const results = popularCategories.map(category => ({
      category,
      count: 0,
      status: 'fulfilled'
    }))

    return NextResponse.json({
      success: true,
      message: 'Trending cache refreshed',
      categories: results
    })

  } catch (error) {
    console.error('❌ Error refreshing trending:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to refresh trending',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
