"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Zap,
  Flame,
  Headphones,
  TrendingUp,
  Calendar,
  Award,
  Activity,
} from "lucide-react";

interface AnalyticsDashboardProps {
  bookId?: string;
  timeRange?: number; // days
}

export default function AnalyticsDashboard({
  bookId,
  timeRange = 30,
}: AnalyticsDashboardProps) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetch(
          `/api/listening/analytics/dashboard?range=${timeRange}`
        );
        if (!response.ok) throw new Error("Failed to load analytics");
        const data = await response.json();
        setInsights(data.insights);
      } catch (error) {
        console.error("[Analytics Dashboard] Error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-24 bg-gray-800 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Total Hours"
          value={insights.totalHours}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={Headphones}
          label="Sessions"
          value={insights.totalSessions}
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          icon={Zap}
          label="Avg Speed"
          value={`${insights.avgSpeed}x`}
          gradient="from-yellow-500 to-orange-500"
        />
        <StatCard
          icon={Activity}
          label="Completion"
          value={`${insights.avgCompletionRate}%`}
          gradient="from-green-500 to-emerald-500"
        />
      </div>

      {/* Calendar Heatmap */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">30-Day Activity</h3>
        </div>
        <div className="grid grid-cols-10 gap-1">
          {insights.heatmap.slice(-30).map((day: any, idx: number) => (
            <div
              key={idx}
              className="aspect-square rounded-sm relative group"
              style={{
                backgroundColor: getHeatmapColor(day.minutes),
              }}
              title={`${day.date}: ${day.minutes} minutes`}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {day.date}: {day.minutes}m
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 15, 30, 60, 120].map((mins) => (
              <div
                key={mins}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: getHeatmapColor(mins) }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Voice Preferences */}
        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Headphones className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Voice Preferences</h3>
          </div>
          <div className="space-y-3">
            {insights.voicePreferences.map((voice: any) => (
              <div key={voice.voiceId} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{voice.voiceId}</span>
                  <span className="text-gray-400">{voice.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${voice.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Speed Distribution */}
        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-bold text-white">Speed Distribution</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(insights.speedDistribution).map(
              ([range, count]: [string, any]) => {
                const total = Object.values(insights.speedDistribution).reduce(
                  (sum: number, val: any) => sum + val,
                  0
                ) as number;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={range} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{range}</span>
                      <span className="text-gray-400">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </Card>
      </div>

      {/* Peak Hours */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-bold text-white">Peak Listening Hours</h3>
        </div>
        <div className="flex gap-4">
          {insights.peakHours.map((peak: any, idx: number) => (
            <Badge
              key={peak.hour}
              variant="outline"
              className="px-4 py-2 border-orange-500/30 bg-orange-500/10 text-orange-400"
            >
              #{idx + 1} {peak.label} ({peak.count} sessions)
            </Badge>
          ))}
        </div>
      </Card>

      {/* Favorite Books */}
      {insights.favoriteBooks.length > 0 && (
        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-bold text-white">Favorite Books</h3>
          </div>
          <div className="space-y-4">
            {insights.favoriteBooks.map((book: any, idx: number) => (
              <div key={book.bookId} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {book.title}
                  </p>
                  <p className="text-sm text-gray-400">
                    {book.author} • {book.totalMinutes}m • {book.sessions}{" "}
                    sessions
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Device Breakdown */}
      {insights.deviceBreakdown.length > 0 && (
        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Device Usage</h3>
          </div>
          <div className="flex gap-4">
            {insights.deviceBreakdown.map((device: any) => (
              <Badge
                key={device.device}
                variant="outline"
                className="px-4 py-2 border-cyan-500/30 bg-cyan-500/10 text-cyan-400 capitalize"
              >
                {device.device}: {device.percentage}%
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// Helper Components
function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: any;
  label: string;
  value: string | number;
  gradient: string;
}) {
  return (
    <Card className={`p-6 bg-gradient-to-br ${gradient} border-0`}>
      <div className="flex items-center gap-3">
        <Icon className="w-8 h-8 text-white" />
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-white/80">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function getHeatmapColor(minutes: number): string {
  if (minutes === 0) return "#1f2937"; // gray-800
  if (minutes < 15) return "#3b82f6"; // blue-500
  if (minutes < 30) return "#8b5cf6"; // purple-500
  if (minutes < 60) return "#ec4899"; // pink-500
  return "#f59e0b"; // amber-500
}
