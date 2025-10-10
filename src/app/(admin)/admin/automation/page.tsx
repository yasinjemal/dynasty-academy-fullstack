/**
 * Dynasty Built Academy - Agent Monitoring Dashboard
 * Real-time automation agent monitoring and control (Admin Only)
 */

'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Activity, 
  Brain, 
  CheckCircle, 
  XCircle, 
  PlayCircle, 
  StopCircle, 
  RefreshCw,
  TrendingUp,
  Clock,
  AlertTriangle,
  Zap
} from 'lucide-react'

interface AgentMetrics {
  tasksExecuted: number
  tasksFailed: number
  tasksQueued: number
  averageExecutionTime: number
  lastExecution: string | null
  systemHealth: {
    cpu: number
    memory: number
    activeConnections: number
  }
  taskBreakdown: {
    [key: string]: {
      executions: number
      failures: number
      avgDuration: number
    }
  }
}

export default function AgentMonitoringDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [executing, setExecuting] = useState<string | null>(null)

  useEffect(() => {
    // Redirect if not admin
    if (status === 'authenticated' && !session?.user?.isAdmin) {
      router.push('/dashboard')
      return
    }

    if (status === 'authenticated' && session?.user?.isAdmin) {
      fetchMetrics()

      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchMetrics, 30000)
      return () => clearInterval(interval)
    }
  }, [session, status, router])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/agent')
      
      if (!response.ok) {
        throw new Error('Failed to fetch agent metrics')
      }

      const data = await response.json()
      setMetrics(data.metrics)

    } catch (err) {
      console.error('Error fetching metrics:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const executeTask = async (taskType: string) => {
    try {
      setExecuting(taskType)
      setError(null)

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'execute', taskType })
      })

      if (!response.ok) {
        throw new Error('Failed to execute task')
      }

      await fetchMetrics()

    } catch (err) {
      console.error('Error executing task:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setExecuting(null)
    }
  }

  const performHealthCheck = async () => {
    try {
      setError(null)

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'health-check' })
      })

      if (!response.ok) {
        throw new Error('Health check failed')
      }

      const data = await response.json()
      alert(`Health Check Results:\n\n${JSON.stringify(data.health, null, 2)}`)

    } catch (err) {
      console.error('Error performing health check:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass-morphism p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-8 h-8 text-[#FF3CAC] animate-pulse" />
              <h1 className="text-3xl font-bold">Agent Monitoring</h1>
            </div>
            <p className="text-muted-foreground">Loading metrics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user?.isAdmin) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-morphism p-8 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Brain className="w-8 h-8 text-[#FF3CAC]" />
              <div>
                <h1 className="text-3xl font-bold">Automation Agent</h1>
                <p className="text-muted-foreground">Real-time monitoring and control</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchMetrics}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>

              <button
                onClick={performHealthCheck}
                className="px-4 py-2 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Health Check
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="glass-morphism p-4 rounded-xl border border-red-500/20 bg-red-500/10">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {metrics && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-morphism p-6 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Tasks Executed</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold">{metrics.tasksExecuted}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Success rate: {metrics.tasksExecuted > 0 
                    ? ((metrics.tasksExecuted / (metrics.tasksExecuted + metrics.tasksFailed)) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>

              <div className="glass-morphism p-6 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Tasks Failed</span>
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-3xl font-bold">{metrics.tasksFailed}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Failure rate: {metrics.tasksExecuted > 0
                    ? ((metrics.tasksFailed / (metrics.tasksExecuted + metrics.tasksFailed)) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>

              <div className="glass-morphism p-6 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Queued Tasks</span>
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-3xl font-bold">{metrics.tasksQueued}</p>
                <p className="text-xs text-muted-foreground mt-1">Pending execution</p>
              </div>

              <div className="glass-morphism p-6 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Avg Duration</span>
                  <Zap className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold">{metrics.averageExecutionTime.toFixed(0)}ms</p>
                <p className="text-xs text-muted-foreground mt-1">Per task</p>
              </div>
            </div>

            {/* System Health */}
            <div className="glass-morphism p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#FF3CAC]" />
                System Health
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">CPU Usage</span>
                    <span className="text-sm font-bold">{metrics.systemHealth.cpu.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        metrics.systemHealth.cpu > 80 ? 'bg-red-500' :
                        metrics.systemHealth.cpu > 60 ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(metrics.systemHealth.cpu, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Memory Usage</span>
                    <span className="text-sm font-bold">{metrics.systemHealth.memory.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        metrics.systemHealth.memory > 80 ? 'bg-red-500' :
                        metrics.systemHealth.memory > 60 ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(metrics.systemHealth.memory, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Active Connections</span>
                    <span className="text-sm font-bold">{metrics.systemHealth.activeConnections}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${Math.min((metrics.systemHealth.activeConnections / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Task Breakdown */}
            <div className="glass-morphism p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#FF3CAC]" />
                Task Breakdown
              </h2>

              <div className="space-y-4">
                {Object.entries(metrics.taskBreakdown).map(([taskType, stats]) => (
                  <div key={taskType} className="glass-morphism p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold capitalize">{taskType.replace(/-/g, ' ')}</h3>
                      <button
                        onClick={() => executeTask(taskType)}
                        disabled={executing === taskType}
                        className="px-3 py-1 text-sm bg-[#FF3CAC] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {executing === taskType ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-3 h-3" />
                            Execute Now
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Executions</span>
                        <p className="text-lg font-bold">{stats.executions}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Failures</span>
                        <p className="text-lg font-bold text-red-500">{stats.failures}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Duration</span>
                        <p className="text-lg font-bold">{stats.avgDuration.toFixed(0)}ms</p>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Success Rate</span>
                        <span>
                          {stats.executions > 0 
                            ? (((stats.executions - stats.failures) / stats.executions) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                          style={{ 
                            width: `${stats.executions > 0 
                              ? (((stats.executions - stats.failures) / stats.executions) * 100)
                              : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Execution */}
            {metrics.lastExecution && (
              <div className="glass-morphism p-4 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  Last execution: {new Date(metrics.lastExecution).toLocaleString()}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
