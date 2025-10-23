/**
 * Similarity Testing API
 * 
 * POST /api/ai/concepts/test
 * - Run similarity accuracy tests
 * - Validate 85%+ accuracy target
 * - Performance benchmarks
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { runSimilarityTests } from '@/lib/ai/similarity-tester';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const results = await runSimilarityTests();

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error('Similarity testing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run similarity tests',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
