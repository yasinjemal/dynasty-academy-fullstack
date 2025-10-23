/**
 * Admin Embedding Control Panel
 *
 * Centralized dashboard to manage all embeddings:
 * - Embed all content or select specific types
 * - Monitor progress in real-time
 * - View statistics and costs
 * - Retry failed embeddings
 * - Refresh outdated embeddings
 *
 * Dynasty Nexus 2.0 - Phase 1 Week 2
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Brain,
  Zap,
  BookOpen,
  FileText,
  HelpCircle,
  Library,
  RefreshCw,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  Clock,
  Database,
  Loader2,
} from "lucide-react";

interface EmbeddingStats {
  courses: number;
  lessons: number;
  questions: number;
  books: number;
  total: number;
  embedded: number;
  pending: number;
}

interface ProcessingProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
  estimatedTimeRemaining: number;
  totalCost: number;
  errors: Array<{ id: string; error: string }>;
}

export default function AdminEmbeddingControlPanel() {
  const [stats, setStats] = useState<EmbeddingStats | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "courses",
    "lessons",
    "questions",
    "books",
  ]);
  const [mode, setMode] = useState<"all" | "unembedded" | "retry">(
    "unembedded"
  );
  const [loading, setLoading] = useState(false);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Poll for progress when processing
  useEffect(() => {
    if (!processing) return;

    const interval = setInterval(() => {
      fetchStats();
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [processing]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/ai/batch-embeddings");
      const data = await response.json();

      if (data.success) {
        setStats(data.data.stats);

        // If processing is complete, stop polling
        if (data.data.isComplete && processing) {
          setProcessing(false);
          setProgress(null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const startEmbedding = async (contentType?: string) => {
    setLoading(true);
    setProcessing(true);

    try {
      const response = await fetch("/api/ai/batch-embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          contentTypes: contentType ? [contentType] : selectedTypes,
          async: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProgress(data.data);
        await fetchStats();
      } else {
        alert(`Error: ${data.error}`);
        setProcessing(false);
      }
    } catch (error) {
      console.error("Failed to start embedding:", error);
      alert("Failed to start embedding process");
      setProcessing(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleContentType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const contentTypes = [
    { id: "courses", name: "Courses", icon: BookOpen, color: "bg-blue-500" },
    { id: "lessons", name: "Lessons", icon: FileText, color: "bg-green-500" },
    {
      id: "questions",
      name: "Quiz Questions",
      icon: HelpCircle,
      color: "bg-purple-500",
    },
    { id: "books", name: "Books", icon: Library, color: "bg-orange-500" },
  ];

  const progressPercentage = stats ? (stats.embedded / stats.total) * 100 : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-500" />
          Embedding Control Panel
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate and manage vector embeddings for AI-powered search and
          recommendations
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>
            {stats
              ? `${stats.embedded.toLocaleString()} of ${stats.total.toLocaleString()} items embedded`
              : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progressPercentage} className="h-4" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {stats?.embedded || 0}
                </div>
                <div className="text-sm text-muted-foreground">Embedded</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {stats?.pending || 0}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {stats?.total || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {progressPercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Content Types</CardTitle>
          <CardDescription>Choose which content to embed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {contentTypes.map((type) => (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all ${
                  selectedTypes.includes(type.id)
                    ? "ring-2 ring-purple-500 shadow-lg"
                    : "hover:shadow-md"
                }`}
                onClick={() => toggleContentType(type.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-lg ${type.color} bg-opacity-10`}
                      >
                        <type.icon
                          className={`h-6 w-6 ${type.color.replace(
                            "bg-",
                            "text-"
                          )}`}
                        />
                      </div>
                      <div>
                        <div className="font-semibold">{type.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {stats
                            ? stats[
                                type.id as keyof EmbeddingStats
                              ].toLocaleString()
                            : "..."}{" "}
                          items
                        </div>
                      </div>
                    </div>
                    <Checkbox
                      checked={selectedTypes.includes(type.id)}
                      onCheckedChange={() => toggleContentType(type.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Processing Mode */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Mode</CardTitle>
          <CardDescription>Choose how to process embeddings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className={`cursor-pointer transition-all ${
                mode === "unembedded"
                  ? "ring-2 ring-green-500"
                  : "hover:shadow-md"
              }`}
              onClick={() => setMode("unembedded")}
            >
              <CardContent className="p-6 text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="font-semibold">Unembedded Only</div>
                <div className="text-sm text-muted-foreground mt-2">
                  Process only new content without embeddings
                </div>
                <Badge variant="outline" className="mt-3">
                  Recommended
                </Badge>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${
                mode === "all" ? "ring-2 ring-blue-500" : "hover:shadow-md"
              }`}
              onClick={() => setMode("all")}
            >
              <CardContent className="p-6 text-center">
                <Database className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="font-semibold">All Content</div>
                <div className="text-sm text-muted-foreground mt-2">
                  Re-embed everything (overwrites existing)
                </div>
                <Badge variant="outline" className="mt-3">
                  Full Refresh
                </Badge>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all ${
                mode === "retry" ? "ring-2 ring-orange-500" : "hover:shadow-md"
              }`}
              onClick={() => setMode("retry")}
            >
              <CardContent className="p-6 text-center">
                <RefreshCw className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <div className="font-semibold">Retry Failed</div>
                <div className="text-sm text-muted-foreground mt-2">
                  Re-process content that failed previously
                </div>
                <Badge variant="outline" className="mt-3">
                  Error Recovery
                </Badge>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Embed specific content types individually
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {contentTypes.map((type) => (
              <Button
                key={type.id}
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => startEmbedding(type.id)}
                disabled={processing || loading}
              >
                <type.icon className="h-6 w-6" />
                <span>Embed {type.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {stats ? stats[type.id as keyof EmbeddingStats] : 0} items
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Action Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1">
              <div className="font-semibold text-lg">
                {processing ? "Processing..." : "Ready to Start"}
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedTypes.length === 0
                  ? "Select at least one content type to begin"
                  : `Will embed ${selectedTypes.length} content type${
                      selectedTypes.length > 1 ? "s" : ""
                    } in "${mode}" mode`}
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => startEmbedding()}
              disabled={processing || loading || selectedTypes.length === 0}
              className="gap-2 min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Starting...
                </>
              ) : processing ? (
                <>
                  <PauseCircle className="h-5 w-5" />
                  Processing...
                </>
              ) : (
                <>
                  <PlayCircle className="h-5 w-5" />
                  Start Embedding
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Processing Progress (shown during processing) */}
      {progress && (
        <Card className="border-purple-500 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress
                value={(progress.processed / progress.total) * 100}
                className="h-4"
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{progress.processed}</div>
                  <div className="text-sm text-muted-foreground">Processed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {progress.successful}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Successful
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {progress.failed}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {progress.currentBatch}/{progress.totalBatches}
                  </div>
                  <div className="text-sm text-muted-foreground">Batches</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Est. {progress.estimatedTimeRemaining}s remaining</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>${progress.totalCost.toFixed(4)} USD</span>
                </div>
              </div>

              {progress.errors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    {progress.errors.length} error(s) occurred. Check logs for
                    details.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Alert>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <strong>What are embeddings?</strong> Vector embeddings convert your
          content into numerical representations that enable AI-powered semantic
          search, intelligent recommendations, and adaptive learning paths. This
          powers the Dynasty Nexus 2.0 Self-Healing Knowledge Graph.
        </AlertDescription>
      </Alert>
    </div>
  );
}
