/**
 * Advanced Analytics Dashboard
 *
 * Deep insights into platform performance
 */

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  BookOpen,
  Activity,
  Target,
  AlertCircle,
  Download,
  RefreshCw,
} from "lucide-react";

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Mock data for now
    setData({
      overview: {
        totalUsers: 8450,
        activeUsers: 1280,
        totalCourses: 127,
        totalRevenue: 125000,
        avgCompletionRate: 67.5,
      },
      engagement: {
        dailyActiveUsers: generateDailyData(30),
        avgSessionDuration: 24.5,
        avgLessonsPerDay: 2.3,
        peakHours: [
          { hour: 9, users: 450 },
          { hour: 14, users: 380 },
          { hour: 20, users: 520 },
        ],
      },
      predictions: {
        revenueNextMonth: 143750,
        growthTrend: "up" as const,
        churnRisk: [
          { userId: "1", risk: 85, reason: "No activity for 14 days" },
          { userId: "2", risk: 72, reason: "Completion rate dropped" },
        ],
        recommendedActions: [
          "Send re-engagement email to inactive users",
          "Offer discount on 'Advanced TypeScript' course",
          "Create beginner version of 'Data Structures'",
          "Launch weekend learning challenge",
        ],
      },
    });
    setLoading(false);
  }, []);

  if (loading || !data) {
    return <div>Loading...</div>;
  }

  const { overview, engagement, predictions } = data;
  const revenueGrowth = (
    ((predictions.revenueNextMonth - overview.totalRevenue) /
      overview.totalRevenue) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Advanced Analytics
          </h1>
          <p className="text-muted-foreground">
            Deep insights into your platform's performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.totalUsers.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
              <TrendingUp className="mr-1 h-3 w-3" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.activeUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((overview.activeUsers / overview.totalUsers) * 100).toFixed(1)}%
              of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${overview.totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
              <TrendingUp className="mr-1 h-3 w-3" />+{revenueGrowth}% predicted
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Published courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.avgCompletionRate}%
            </div>
            <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
              <TrendingUp className="mr-1 h-3 w-3" />
              +3.2% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
            <CardDescription>User activity patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Avg Session Duration
                </span>
                <span className="text-2xl font-bold">
                  {engagement.avgSessionDuration} min
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(engagement.avgSessionDuration / 60) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Avg Lessons Per Day</span>
                <span className="text-2xl font-bold">
                  {engagement.avgLessonsPerDay}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full"
                  style={{
                    width: `${(engagement.avgLessonsPerDay / 10) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Peak Activity Hours</h4>
              <div className="space-y-2">
                {engagement.peakHours.map((peak: any) => (
                  <div
                    key={peak.hour}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {peak.hour}:00 - {peak.hour + 1}:00
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(peak.users / 600) * 100}%` }}
                        />
                      </div>
                      <span className="font-medium w-12 text-right">
                        {peak.users}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Predictive Analytics</CardTitle>
            <CardDescription>
              AI-powered insights and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-900 dark:text-green-100">
                  Revenue Forecast
                </span>
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                ${predictions.revenueNextMonth.toLocaleString()}
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Expected revenue next month (+{revenueGrowth}%)
              </p>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold text-amber-900 dark:text-amber-100">
                  Churn Risk Alerts
                </span>
              </div>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                {predictions.churnRisk.length}
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                High-risk users identified
              </p>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Recommended Actions</h4>
              <div className="space-y-2">
                {predictions.recommendedActions.map(
                  (action: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Badge variant="outline" className="mt-0.5">
                        {i + 1}
                      </Badge>
                      <span className="text-muted-foreground">{action}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Active Users Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Active Users (Last 30 Days)</CardTitle>
          <CardDescription>User activity trend over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-1">
            {engagement.dailyActiveUsers.map((users: number, i: number) => {
              const maxUsers = Math.max(...engagement.dailyActiveUsers);
              const height = (users / maxUsers) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-purple-600 to-blue-600 rounded-t hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ height: `${height}%` }}
                  title={`Day ${i + 1}: ${users} users`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function generateDailyData(days: number): number[] {
  return Array.from({ length: days }, (_, i) => {
    const baseUsers = 800;
    const trend = i * 5;
    const variance = Math.random() * 100;
    const weekendDip = [0, 6].includes(i % 7) ? -100 : 0;
    return Math.round(baseUsers + trend + variance + weekendDip);
  });
}
