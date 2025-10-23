"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Mail,
  Bell,
  MessageSquare,
  Eye,
  MousePointer,
  CheckCircle,
  Calendar,
  RefreshCw,
  Download,
  Filter,
} from "lucide-react";

interface InterventionStats {
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_converted: number;
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
  avg_time_to_open: number;
  by_channel: {
    EMAIL: { sent: number; opened: number; clicked: number };
    PUSH: { sent: number; opened: number; clicked: number };
    IN_APP: { sent: number; opened: number; clicked: number };
  };
  by_type: {
    [key: string]: {
      sent: number;
      opened: number;
      clicked: number;
      converted: number;
    };
  };
  by_day: Array<{
    date: string;
    sent: number;
    opened: number;
    clicked: number;
  }>;
}

const COLORS = {
  email: "#8B5CF6",
  push: "#EC4899",
  inApp: "#3B82F6",
  sms: "#F59E0B",
};

export default function EngagementAnalyticsPage() {
  const [stats, setStats] = useState<InterventionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/engagement/analytics?range=${timeRange}`
      );
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const channelData = stats
    ? [
        {
          name: "Email",
          value: stats.by_channel.EMAIL.sent,
          color: COLORS.email,
        },
        { name: "Push", value: stats.by_channel.PUSH.sent, color: COLORS.push },
        {
          name: "In-App",
          value: stats.by_channel.IN_APP.sent,
          color: COLORS.inApp,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-950 dark:via-purple-950 dark:to-blue-950 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              📊 Intervention Analytics
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Track engagement and effectiveness of your interventions
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex gap-2">
              {(["7d", "30d", "90d"] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range === "7d" && "7 Days"}
                  {range === "30d" && "30 Days"}
                  {range === "90d" && "90 Days"}
                </Button>
              ))}
            </div>
            <Button variant="outline" onClick={fetchAnalytics}>
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-slate-600 dark:text-slate-400">
              Loading analytics...
            </p>
          </div>
        ) : !stats ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400">
                No data available
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Sent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{stats.total_sent}</div>
                    <Mail className="w-8 h-8 text-purple-500 opacity-50" />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Across all channels
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Open Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-blue-600">
                      {stats.open_rate.toFixed(1)}%
                    </div>
                    <Eye className="w-8 h-8 text-blue-500 opacity-50" />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {stats.total_opened} opened
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Click Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-green-600">
                      {stats.click_rate.toFixed(1)}%
                    </div>
                    <MousePointer className="w-8 h-8 text-green-500 opacity-50" />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {stats.total_clicked} clicked
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Conversion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-orange-600">
                      {stats.conversion_rate.toFixed(1)}%
                    </div>
                    <CheckCircle className="w-8 h-8 text-orange-500 opacity-50" />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {stats.total_converted} converted
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Channel Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Interventions by Channel</CardTitle>
                  <CardDescription>
                    Distribution across email, push, and in-app
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={channelData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {channelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Performance Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Over Time</CardTitle>
                  <CardDescription>
                    Sent, opened, and clicked trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.by_day}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sent"
                        stroke={COLORS.email}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="opened"
                        stroke={COLORS.push}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="clicked"
                        stroke={COLORS.inApp}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* By Intervention Type */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Intervention Type</CardTitle>
                <CardDescription>
                  Compare effectiveness of different intervention strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.by_type).map(([type, data]) => (
                    <div
                      key={type}
                      className="border rounded-lg p-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold capitalize">
                          {type.replace(/_/g, " ")}
                        </h3>
                        <Badge variant="outline">{data.sent} sent</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">
                            Open Rate
                          </p>
                          <p className="text-lg font-bold text-blue-600">
                            {((data.opened / data.sent) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">
                            Click Rate
                          </p>
                          <p className="text-lg font-bold text-green-600">
                            {((data.clicked / data.sent) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">
                            Conversion
                          </p>
                          <p className="text-lg font-bold text-orange-600">
                            {((data.converted / data.sent) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Channel Performance Details */}
            <Card>
              <CardHeader>
                <CardTitle>Channel Performance Comparison</CardTitle>
                <CardDescription>
                  Detailed metrics for each communication channel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        channel: "Email",
                        sent: stats.by_channel.EMAIL.sent,
                        opened: stats.by_channel.EMAIL.opened,
                        clicked: stats.by_channel.EMAIL.clicked,
                      },
                      {
                        channel: "Push",
                        sent: stats.by_channel.PUSH.sent,
                        opened: stats.by_channel.PUSH.opened,
                        clicked: stats.by_channel.PUSH.clicked,
                      },
                      {
                        channel: "In-App",
                        sent: stats.by_channel.IN_APP.sent,
                        opened: stats.by_channel.IN_APP.opened,
                        clicked: stats.by_channel.IN_APP.clicked,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sent" fill={COLORS.email} />
                    <Bar dataKey="opened" fill={COLORS.push} />
                    <Bar dataKey="clicked" fill={COLORS.inApp} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
