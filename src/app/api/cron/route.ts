/**
 * Dynasty Built Academy - Cron Automation Endpoint
 * Runs background tasks automatically via Vercel Cron
 * 
 * Configure in vercel.json to run every 5 minutes
 */

import { NextRequest, NextResponse } from 'next/server'
import { AutomationAgent } from '@/lib/automation/agent'

// Singleton agent instance
let agentInstance: AutomationAgent | null = null

function getAgent(): AutomationAgent {
  if (!agentInstance) {
    agentInstance = new AutomationAgent()
  }
  return agentInstance
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (recommended for production)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const agent = getAgent()
    
    // Execute high-priority tasks
    const tasks = [
      'content-moderation',
      'performance-monitoring',
      'notification-dispatch'
    ]

    const results = await Promise.allSettled(
      tasks.map(taskType => agent.executeTaskNow(taskType))
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    console.log(`✅ Cron job completed: ${successful} successful, ${failed} failed`)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tasksExecuted: successful,
      tasksFailed: failed,
      results: results.map((r, i) => ({
        task: tasks[i],
        status: r.status,
        error: r.status === 'rejected' ? (r as any).reason?.message : null
      }))
    })

  } catch (error) {
    console.error('❌ Cron job error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// POST endpoint for manual triggering (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secret, tasks: customTasks } = body

    // Verify admin secret
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const agent = getAgent()
    
    // Execute custom tasks or all tasks
    const tasksToRun = customTasks || [
      'content-moderation',
      'performance-monitoring',
      'database-cleanup',
      'user-engagement',
      'notification-dispatch'
    ]

    const results = await Promise.allSettled(
      tasksToRun.map((task: string) => agent.executeTaskNow(task))
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      message: 'Manual cron execution completed',
      timestamp: new Date().toISOString(),
      tasksExecuted: successful,
      tasksFailed: failed,
      results: results.map((r, i) => ({
        task: tasksToRun[i],
        status: r.status,
        error: r.status === 'rejected' ? (r as any).reason?.message : null
      }))
    })

  } catch (error) {
    console.error('❌ Manual cron error:', error)
    
    return NextResponse.json(
      { 
        error: 'Manual cron failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
