"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  FileText,
  Users,
  TrendingUp,
  Activity,
  Calendar,
  Eye,
  CheckCircle,
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
  actor: {
    name: string;
    email: string;
    image?: string;
  };
  before?: Record<string, any>;
  after?: Record<string, any>;
  reason?: string;
}

interface AuditStats {
  totalLogs: number;
  uniqueActors: number;
  actionCounts: Record<string, number>;
  entityCounts: Record<string, number>;
  timeframe: string;
}

export default function GovernanceDashboard() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("week");
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<string>("all");
  const [selectedAction, setSelectedAction] = useState<string>("all");

  useEffect(() => {
    fetchGovernanceData();
  }, [timeframe, selectedEntity, selectedAction]);

  async function fetchGovernanceData() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        timeframe,
        ...(selectedEntity !== "all" && { entity: selectedEntity }),
        ...(selectedAction !== "all" && { action: selectedAction }),
      });

      const [logsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/governance/logs?${params}`),
        fetch(`/api/admin/governance/stats?timeframe=${timeframe}`),
      ]);

      if (logsRes.ok && statsRes.ok) {
        const logsData = await logsRes.json();
        const statsData = await statsRes.json();
        setLogs(logsData.logs || []);
        setStats(statsData.stats || null);
      }
    } catch (error) {
      console.error("Failed to fetch governance data:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatAction(action: string): string {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  const topActions = stats
    ? Object.entries(stats.actionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    : [];

  const topEntities = stats
    ? Object.entries(stats.entityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Shield className="w-12 h-12 text-purple-400" />
            <div>
              <h1 className="text-4xl font-bold text-white">
                Governance Dashboard
              </h1>
              <p className="text-gray-400 mt-1">
                Transparent audit trail of all admin actions
              </p>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex gap-2">
            {(["day", "week", "month"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeframe === tf
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {tf === "day" && "Last 24 Hours"}
                {tf === "week" && "Last 7 Days"}
                {tf === "month" && "Last 30 Days"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-8 h-8 text-purple-400" />
                <h3 className="text-gray-400 font-medium">Total Actions</h3>
              </div>
              <p className="text-4xl font-bold text-white">{stats.totalLogs}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-blue-400" />
                <h3 className="text-gray-400 font-medium">Active Admins</h3>
              </div>
              <p className="text-4xl font-bold text-white">
                {stats.uniqueActors}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-600/20 to-green-600/5 border border-green-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <h3 className="text-gray-400 font-medium">Entities Modified</h3>
              </div>
              <p className="text-4xl font-bold text-white">
                {Object.keys(stats.entityCounts).length}
              </p>
            </div>
          </motion.div>
        )}

        {/* Top Actions & Entities */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                Top Actions
              </h3>
              <div className="space-y-3">
                {topActions.map(([action, count]) => (
                  <div
                    key={action}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-300">
                      {formatAction(action)}
                    </span>
                    <span className="text-purple-400 font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-400" />
                Top Entities
              </h3>
              <div className="space-y-3">
                {topEntities.map(([entity, count]) => (
                  <div
                    key={entity}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-300">
                      {formatAction(entity)}
                    </span>
                    <span className="text-blue-400 font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-white mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">
                Entity Type
              </label>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="all">All Entities</option>
                <option value="course">Courses</option>
                <option value="user">Users</option>
                <option value="instructor_application">Applications</option>
                <option value="governance_settings">Settings</option>
                <option value="ranking">Rankings</option>
              </select>
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-2 block">
                Action Type
              </label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="all">All Actions</option>
                <option value="create_course">Create Course</option>
                <option value="update_course">Update Course</option>
                <option value="delete_course">Delete Course</option>
                <option value="approve_instructor_application">
                  Approve Application
                </option>
                <option value="reject_instructor_application">
                  Reject Application
                </option>
                <option value="update_user_role">Update User Role</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Audit Log Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden"
        >
          <div className="p-6 border-b border-gray-700/50">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Eye className="w-6 h-6 text-purple-400" />
              Audit Log
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 mt-4">Loading audit logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400">No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900/50 text-left">
                    <th className="px-6 py-3 text-gray-400 font-medium">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-gray-400 font-medium">
                      Actor
                    </th>
                    <th className="px-6 py-3 text-gray-400 font-medium">
                      Action
                    </th>
                    <th className="px-6 py-3 text-gray-400 font-medium">
                      Entity
                    </th>
                    <th className="px-6 py-3 text-gray-400 font-medium">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-900/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {log.actor.image && (
                            <img
                              src={log.actor.image}
                              alt={log.actor.name}
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <div>
                            <p className="text-white text-sm font-medium">
                              {log.actor.name}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {log.actor.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium">
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {formatAction(log.entity)}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {log.reason || "No reason provided"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
