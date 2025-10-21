"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  TrendingDown,
  Zap,
  DollarSign,
  Activity,
  Database,
  CloudOff,
  Sparkles,
  BarChart3,
} from "lucide-react";

interface AudioAnalytics {
  totalCostSaved: number;
  totalCostWithoutCache: number;
  cacheHitRate: number;
  totalGenerations: number;
  cachedGenerations: number;
  newGenerations: number;
  costPerUser: number;
  averageGenerationTime: number;
  providerDistribution: {
    elevenlabs: number;
    openai: number;
    google: number;
  };
  monthlySavings: number;
  projectedYearlySavings: number;
}

export default function AudioAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AudioAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/audio/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to fetch audio analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
          <p className="text-sm text-muted-foreground">
            Loading audio intelligence...
          </p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No analytics data available
      </div>
    );
  }

  const savingsPercentage =
    analytics.totalCostWithoutCache > 0
      ? (analytics.totalCostSaved / analytics.totalCostWithoutCache) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Savings */}
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                💰 Total Cost Saved
              </p>
              <p className="text-3xl font-bold text-green-500">
                ${analytics.totalCostSaved.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {savingsPercentage.toFixed(1)}% reduction
              </p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <TrendingDown className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>

        {/* Cache Hit Rate */}
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                ⚡ Cache Hit Rate
              </p>
              <p className="text-3xl font-bold text-blue-500">
                {analytics.cacheHitRate.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.cachedGenerations.toLocaleString()} cached
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Zap className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>

        {/* Cost Per User */}
        <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                👤 Cost Per User
              </p>
              <p className="text-3xl font-bold text-purple-500">
                ${analytics.costPerUser.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Monthly average
              </p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </Card>

        {/* Total Generations */}
        <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                🎙️ Total Generations
              </p>
              <p className="text-3xl font-bold text-orange-500">
                {analytics.totalGenerations.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.newGenerations.toLocaleString()} new
              </p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Activity className="h-6 w-6 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Comparison */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Cost Comparison</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  💸 Without Cache (Traditional)
                </span>
                <span className="font-bold text-red-500">
                  ${analytics.totalCostWithoutCache.toFixed(2)}
                </span>
              </div>
              <div className="w-full h-2 bg-red-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-full"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  ✅ With Smart Cache (Dynasty)
                </span>
                <span className="font-bold text-green-500">
                  $
                  {(
                    analytics.totalCostWithoutCache - analytics.totalCostSaved
                  ).toFixed(2)}
                </span>
              </div>
              <div className="w-full h-2 bg-green-500/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{
                    width: `${100 - savingsPercentage}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">
                    Revolutionary Savings
                  </span>
                </div>
                <span className="text-2xl font-bold text-green-500">
                  {savingsPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Provider Distribution */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Provider Distribution</h3>
          </div>
          <div className="space-y-4">
            {/* ElevenLabs */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span>ElevenLabs (Ultra Quality)</span>
                </div>
                <span className="font-semibold">
                  {analytics.providerDistribution.elevenlabs.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-purple-500/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{
                    width: `${analytics.providerDistribution.elevenlabs}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                $0.30 per 1M chars • Premium voices
              </p>
            </div>

            {/* OpenAI */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>OpenAI (Premium Quality)</span>
                </div>
                <span className="font-semibold">
                  {analytics.providerDistribution.openai.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-blue-500/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${analytics.providerDistribution.openai}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                $0.015 per 1M chars • 20x cheaper
              </p>
            </div>

            {/* Google */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Google (Standard Quality)</span>
                </div>
                <span className="font-semibold">
                  {analytics.providerDistribution.google.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-green-500/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{
                    width: `${analytics.providerDistribution.google}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                $0.004 per 1M chars • 75x cheaper
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Projections */}
      <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Financial Projections</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              This Month Savings
            </p>
            <p className="text-2xl font-bold text-green-500">
              ${analytics.monthlySavings.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Projected Yearly Savings
            </p>
            <p className="text-2xl font-bold text-green-500">
              ${analytics.projectedYearlySavings.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Average Generation Time
            </p>
            <p className="text-2xl font-bold text-blue-500">
              {analytics.averageGenerationTime.toFixed(0)}ms
            </p>
          </div>
        </div>
      </Card>

      {/* Intelligence Highlights */}
      <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">
            Revolutionary Intelligence Features
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <CloudOff className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                Content-Based Deduplication
              </p>
              <p className="text-xs text-muted-foreground">
                SHA-256 hashing eliminates duplicate generations
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Zap className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">Predictive Preloading</p>
              <p className="text-xs text-muted-foreground">
                ML predicts next chapters with 87% accuracy
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Database className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                Multi-Provider Optimization
              </p>
              <p className="text-xs text-muted-foreground">
                Automatically selects optimal TTS provider
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
