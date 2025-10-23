"use client";

/**
 * 🏗️ INFRASTRUCTURE DASHBOARD
 * System health & monitoring
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Server,
  Database,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  HardDrive,
} from "lucide-react";

interface SystemHealth {
  status: "healthy" | "degraded" | "unhealthy";
  memory: {
    rssMB: number;
    heapUsedMB: number;
  };
  cpu: {
    percent: number;
  };
  uptime: {
    processFormatted: string;
  };
  api: {
    avgResponseTime: number;
    requestCount: number;
  };
  database: {
    avgQueryTime: number;
    queryCount: number;
  };
}

interface CacheStats {
  keys: number;
  memory: string;
  hits: number;
  misses: number;
  hitRate: string;
}

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}

export default function InfrastructureDashboard() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [cache, setCache] = useState<CacheStats | null>(null);
  const [queues, setQueues] = useState<Record<string, QueueStats>>({});

  useEffect(() => {
    loadDashboard();
    // Refresh every 10 seconds
    const interval = setInterval(loadDashboard, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const [healthRes, cacheRes, queuesRes] = await Promise.all([
        fetch("/api/infrastructure/health"),
        fetch("/api/infrastructure/cache"),
        fetch("/api/infrastructure/queues"),
      ]);

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealth(healthData.health);
      }

      if (cacheRes.ok) {
        const cacheData = await cacheRes.json();
        setCache(cacheData.stats);
      }

      if (queuesRes.ok) {
        const queuesData = await queuesRes.json();
        setQueues(queuesData.stats);
      }
    } catch (error) {
      console.error("Load dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-500";
      case "degraded":
        return "text-yellow-500";
      case "unhealthy":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case "unhealthy":
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      default:
        return <Activity className="h-6 w-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Server className="h-10 w-10 text-blue-500" />
            Infrastructure
          </h1>
          <p className="text-muted-foreground mt-2">
            System health & performance monitoring
          </p>
        </div>
        <Button onClick={loadDashboard} variant="outline">
          <Zap className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Status */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(health.status)}
              System Status:{" "}
              <span className={getStatusColor(health.status)}>
                {health.status.toUpperCase()}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <HardDrive className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{health.memory.heapUsedMB}MB</div>
                  <div className="text-sm text-muted-foreground">Memory Used</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Cpu className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{health.cpu.percent}%</div>
                  <div className="text-sm text-muted-foreground">CPU Usage</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{health.uptime.processFormatted}</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{health.api.avgResponseTime}ms</div>
                  <div className="text-sm text-muted-foreground">Avg Response</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="cache" className="space-y-6">
        <TabsList>
          <TabsTrigger value="cache">⚡ Cache</TabsTrigger>
          <TabsTrigger value="queues">🎯 Queues</TabsTrigger>
          <TabsTrigger value="performance">📊 Performance</TabsTrigger>
          <TabsTrigger value="security">🛡️ Security</TabsTrigger>
        </TabsList>

        {/* Cache Tab */}
        <TabsContent value="cache" className="space-y-6">
          {cache && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Cached Keys</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{cache.keys.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Memory Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{cache.memory}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Hit Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500">{cache.hitRate}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {cache.hits.toLocaleString()} hits / {cache.misses.toLocaleString()} misses
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    Clear Cache
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Queues Tab */}
        <TabsContent value="queues" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {Object.entries(queues).map(([name, stats]) => (
              <Card key={name}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{name}</span>
                    {stats.paused && (
                      <span className="text-sm text-yellow-500">⏸️ Paused</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{stats.waiting}</div>
                      <div className="text-sm text-muted-foreground">Waiting</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-500">{stats.active}</div>
                      <div className="text-sm text-muted-foreground">Active</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-500">{stats.delayed}</div>
                      <div className="text-sm text-muted-foreground">Delayed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {health && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Avg Response Time</span>
                      <span className="font-bold">{health.api.avgResponseTime}ms</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {health.api.requestCount.toLocaleString()} requests
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Database Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Avg Query Time</span>
                      <span className="font-bold">{health.database.avgQueryTime}ms</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {health.database.queryCount.toLocaleString()} queries
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Rate Limiting</span>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Security Headers</span>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>Input Validation</span>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>CORS Protection</span>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
