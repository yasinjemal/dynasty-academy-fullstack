"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  Activity,
  Users,
  Lock,
  TrendingUp,
  Eye,
  XCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  failedLogins: number;
  unauthorizedAccess: number;
  suspiciousActivity: number;
  activeUsers: number;
  recentEvents: SecurityEvent[];
  threatLevel: "low" | "medium" | "high" | "critical";
  topThreats: { type: string; count: number }[];
}

interface SecurityEvent {
  id: string;
  action: string;
  severity: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  timestamp: string;
  details: any;
}

export default function SecurityDashboardPage() {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");

  useEffect(() => {
    fetchSecurityStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSecurityStats, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchSecurityStats = async () => {
    try {
      const response = await fetch(
        `/api/admin/security/stats?range=${timeRange}`
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch security stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!stats) return null;

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case "critical":
        return "from-red-500 to-orange-500";
      case "high":
        return "from-orange-500 to-yellow-500";
      case "medium":
        return "from-yellow-500 to-green-500";
      default:
        return "from-green-500 to-blue-500";
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: "bg-red-500/20 text-red-400 border-red-500/30",
      high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      low: "bg-green-500/20 text-green-400 border-green-500/30",
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
              <Shield className="w-10 h-10 text-purple-400" />
              Security Command Center
            </h1>
            <p className="text-gray-400 mt-2">
              Real-time threat monitoring and security analytics
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-slate-800/50 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            {/* Live Status */}
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Live Monitoring</span>
            </div>
          </div>
        </div>

        {/* Threat Level Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${getThreatLevelColor(
            stats.threatLevel
          )} bg-opacity-10 border border-white/10 rounded-xl p-6 backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/10 rounded-lg">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <div className="text-2xl font-bold uppercase">
                  {stats.threatLevel} Threat Level
                </div>
                <div className="text-sm opacity-80">
                  {stats.criticalEvents} critical events detected in the last{" "}
                  {timeRange}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{stats.totalEvents}</div>
              <div className="text-sm opacity-80">Total Security Events</div>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
              <div className="text-red-400 text-2xl font-bold">
                {stats.failedLogins}
              </div>
            </div>
            <div className="text-lg font-semibold">Failed Logins</div>
            <div className="text-sm text-gray-400 mt-1">
              Potential brute force attacks
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <Lock className="w-8 h-8 text-orange-400" />
              <div className="text-orange-400 text-2xl font-bold">
                {stats.unauthorizedAccess}
              </div>
            </div>
            <div className="text-lg font-semibold">Unauthorized Access</div>
            <div className="text-sm text-gray-400 mt-1">
              Blocked access attempts
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-8 h-8 text-purple-400" />
              <div className="text-purple-400 text-2xl font-bold">
                {stats.suspiciousActivity}
              </div>
            </div>
            <div className="text-lg font-semibold">Suspicious Activity</div>
            <div className="text-sm text-gray-400 mt-1">Anomaly detections</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <div className="text-blue-400 text-2xl font-bold">
                {stats.activeUsers}
              </div>
            </div>
            <div className="text-lg font-semibold">Active Users</div>
            <div className="text-sm text-gray-400 mt-1">Currently online</div>
          </motion.div>
        </div>

        {/* Top Threats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Top Threats
            </h2>

            <div className="space-y-4">
              {stats.topThreats.map((threat, index) => {
                const maxCount = Math.max(
                  ...stats.topThreats.map((t) => t.count)
                );
                const percentage = (threat.count / maxCount) * 100;

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{threat.type}</span>
                      <span className="font-semibold text-purple-400">
                        {threat.count} events
                      </span>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Recent Security Events
            </h2>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {stats.recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 bg-slate-800/30 border border-purple-500/10 rounded-lg hover:border-purple-500/30 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getSeverityBadge(
                          event.severity
                        )}`}
                      >
                        {event.severity.toUpperCase()}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {event.action}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {event.userEmail || "Anonymous"} • {event.ipAddress}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm"
        >
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              View All Logs
            </button>
            <button className="py-3 px-4 bg-slate-800/50 border border-purple-500/20 hover:border-purple-500/40 rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alert Settings
            </button>
            <button className="py-3 px-4 bg-slate-800/50 border border-purple-500/20 hover:border-purple-500/40 rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              Security Report
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
