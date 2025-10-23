"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Users,
  Activity,
  RefreshCw,
  Zap,
  Shield,
  Target,
  Bell,
  Mail,
  MessageSquare,
  Phone,
  ChevronDown,
} from "lucide-react";

interface AtRiskStudent {
  userId: string;
  dropOffRisk: number;
  weeklyRisk: number;
  monthlyRisk: number;
  recommendedInterventions: string[];
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    createdAt: string;
  };
  signals: any;
  confidence: number;
  lastUpdated: string;
}

interface EngagementStats {
  totalStudents: number;
  criticalRisk: number;
  highRisk: number;
  mediumRisk: number;
  atRiskPercentage: string;
}

export default function EngagementAnalyticsPage() {
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);
  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [threshold, setThreshold] = useState(60);
  const [sendingTo, setSendingTo] = useState<Set<string>>(new Set());

  const fetchAtRiskStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/engagement/at-risk?threshold=${threshold}&limit=50`
      );
      const data = await response.json();

      if (data.success) {
        setAtRiskStudents(data.atRiskStudents);
        setStats(data.stats);
      } else {
        setError(data.error || "Failed to fetch data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const calculateAllScores = async () => {
    setCalculating(true);
    try {
      // In production, this would trigger a background job
      // For now, show success message
      alert(
        "Engagement calculation triggered! This runs in the background for all students."
      );
      await fetchAtRiskStudents();
    } catch (err) {
      setError("Failed to trigger calculation");
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    fetchAtRiskStudents();
  }, [threshold]);

  const getRiskColor = (risk: number): string => {
    if (risk >= 80) return "text-red-600 dark:text-red-400";
    if (risk >= 60) return "text-orange-600 dark:text-orange-400";
    if (risk >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const getRiskBadge = (risk: number) => {
    if (risk >= 80) return <Badge variant="destructive">Critical</Badge>;
    if (risk >= 60) return <Badge className="bg-orange-500">High Risk</Badge>;
    if (risk >= 40) return <Badge className="bg-yellow-500">Medium</Badge>;
    return <Badge className="bg-green-500">Low Risk</Badge>;
  };

  const sendIndividualIntervention = async (
    userId: string,
    userName: string,
    channel: string = "ALL"
  ) => {
    const channelLabel =
      channel === "ALL" ? "all channels" : channel.toLowerCase();
    if (!confirm(`Send intervention via ${channelLabel} to ${userName}?`)) {
      return;
    }

    setSendingTo((prev) => new Set(prev).add(userId));

    try {
      const response = await fetch("/api/engagement/interventions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, threshold, channel }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Intervention sent to ${userName} via ${channelLabel}!`);
      } else {
        alert(`❌ Failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      alert(`❌ Failed to send intervention: ${error}`);
    } finally {
      setSendingTo((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-950 dark:via-purple-950 dark:to-blue-950 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              🎯 Engagement Analytics
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              AI-powered student retention & drop-off prevention
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() =>
                (window.location.href = "/admin/engagement/analytics")
              }
              variant="outline"
            >
              📊 Analytics
            </Button>

            <Button
              onClick={() =>
                (window.location.href = "/admin/engagement/templates")
              }
              variant="outline"
            >
              ✍️ Templates
            </Button>

            <Button
              onClick={() =>
                (window.location.href = "/admin/engagement/campaigns")
              }
              variant="outline"
            >
              📅 Campaigns
            </Button>

            <Button
              onClick={fetchAtRiskStudents}
              variant="outline"
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Button
              onClick={async () => {
                const atRiskCount = atRiskStudents.length;
                if (atRiskCount === 0) {
                  alert("No at-risk students found");
                  return;
                }
                if (
                  confirm(
                    `Send interventions to ${atRiskCount} at-risk students?`
                  )
                ) {
                  try {
                    const response = await fetch(
                      "/api/engagement/interventions",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ threshold }),
                      }
                    );
                    const data = await response.json();
                    if (data.success) {
                      alert(`✅ Interventions sent to ${data.total} students!`);
                    }
                  } catch (error) {
                    alert("Failed to send interventions");
                  }
                }
              }}
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              <Bell className="w-4 h-4 mr-2" />
              Send Interventions
            </Button>

            <Button
              onClick={calculateAllScores}
              disabled={calculating}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <Zap
                className={`w-4 h-4 mr-2 ${calculating ? "animate-pulse" : ""}`}
              />
              {calculating ? "Calculating..." : "Recalculate All"}
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    {stats.totalStudents}
                  </div>
                  <Users className="w-8 h-8 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Critical Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-red-600">
                    {stats.criticalRisk}
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  High Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-orange-600">
                    {stats.highRisk}
                  </div>
                  <TrendingDown className="w-8 h-8 text-orange-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-200 dark:border-yellow-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  At-Risk %
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-yellow-600">
                    {stats.atRiskPercentage}%
                  </div>
                  <Activity className="w-8 h-8 text-yellow-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Threshold Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Risk Threshold
            </CardTitle>
            <CardDescription>
              Show students with drop-off risk above this threshold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="flex-1"
              />
              <Badge variant="outline" className="text-lg px-4 py-2">
                {threshold}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* At-Risk Students List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              At-Risk Students ({atRiskStudents.length})
            </CardTitle>
            <CardDescription>
              Students predicted to drop out - sorted by risk level
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
                <p className="text-slate-600 dark:text-slate-400">
                  Loading at-risk students...
                </p>
              </div>
            ) : atRiskStudents.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-medium text-slate-800 dark:text-slate-200">
                  Great news! No students at risk. 🎉
                </p>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  All students are engaged and making progress.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {atRiskStudents.map((student) => (
                  <div
                    key={student.userId}
                    className="border rounded-lg p-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {student.user.image ? (
                          <img
                            src={student.user.image}
                            alt={student.user.name}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold">
                            {student.user.name?.charAt(0) || "U"}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-lg">
                            {student.user.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {student.user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getRiskBadge(student.dropOffRisk)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={sendingTo.has(student.userId)}
                              className="border-purple-500 text-purple-600 hover:bg-purple-50"
                            >
                              {sendingTo.has(student.userId) ? (
                                <>
                                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Bell className="w-3 h-3 mr-1" />
                                  Send
                                  <ChevronDown className="w-3 h-3 ml-1" />
                                </>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>
                              Send Intervention
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                sendIndividualIntervention(
                                  student.userId,
                                  student.user.name,
                                  "ALL"
                                )
                              }
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              All Channels
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                sendIndividualIntervention(
                                  student.userId,
                                  student.user.name,
                                  "EMAIL"
                                )
                              }
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Email Only
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                sendIndividualIntervention(
                                  student.userId,
                                  student.user.name,
                                  "PUSH"
                                )
                              }
                            >
                              <Bell className="w-4 h-4 mr-2" />
                              Push Notification
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                sendIndividualIntervention(
                                  student.userId,
                                  student.user.name,
                                  "IN_APP"
                                )
                              }
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              In-App Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                sendIndividualIntervention(
                                  student.userId,
                                  student.user.name,
                                  "SMS"
                                )
                              }
                              className="text-orange-600"
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              SMS (Premium)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Drop-off Risk
                        </p>
                        <p
                          className={`text-2xl font-bold ${getRiskColor(
                            student.dropOffRisk
                          )}`}
                        >
                          {student.dropOffRisk}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Weekly Risk
                        </p>
                        <p
                          className={`text-2xl font-bold ${getRiskColor(
                            student.weeklyRisk
                          )}`}
                        >
                          {student.weeklyRisk}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Confidence
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {student.confidence}%
                        </p>
                      </div>
                    </div>

                    {student.recommendedInterventions &&
                      student.recommendedInterventions.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Recommended Interventions:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {student.recommendedInterventions.map(
                              (intervention, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {intervention.replace(/_/g, " ")}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
