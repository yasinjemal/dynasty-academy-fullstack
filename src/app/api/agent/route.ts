/**
 * Dynasty Built Academy - Agent Monitoring API
 * Real-time automation agent metrics and control
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { AutomationAgent } from '@/lib/automation/agent'

// Singleton agent instance
let agentInstance: AutomationAgent | null = null

function getAgent(): AutomationAgent {
  if (!agentInstance) {
    agentInstance = new AutomationAgent()
    agentInstance.start()
  }
  return agentInstance
}

/**
 * GET - Fetch agent metrics and status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can view agent metrics
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const agent = getAgent()
    const metrics = agent.getMetrics()

    return NextResponse.json({
      status: 'active',
      metrics,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error fetching agent metrics:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch agent metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST - Control agent operations
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can control the agent
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, taskType } = body

    const agent = getAgent()

    switch (action) {
      case 'start':
        agent.start()
        return NextResponse.json({
          success: true,
          message: 'Agent started'
        })

      case 'stop':
        agent.stop()
        return NextResponse.json({
          success: true,
          message: 'Agent stopped'
        })

      case 'execute':
        if (!taskType) {
          return NextResponse.json(
            { error: 'Missing taskType parameter' },
            { status: 400 }
          )
        }

        // Execute specific task immediately
        await agent.executeTaskNow(taskType)
        
        return NextResponse.json({
          success: true,
          message: `Executed task: ${taskType}`,
          timestamp: new Date().toISOString()
        })

      case 'health-check':
        const health = await agent.performHealthCheck()
        return NextResponse.json({
          success: true,
          health,
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: start, stop, execute, or health-check' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('❌ Error controlling agent:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to control agent',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Clear agent task queue
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const agent = getAgent()
    agent.stop()
    
    // Reinitialize with fresh queue
    agentInstance = new AutomationAgent()
    agentInstance.start()

    return NextResponse.json({
      success: true,
      message: 'Agent restarted with cleared queue'
    })

  } catch (error) {
    console.error('❌ Error restarting agent:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to restart agent',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
