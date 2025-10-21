"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Zap,
} from "lucide-react";

interface BatchJob {
  id: string;
  type: "course" | "book";
  targetId: string;
  targetName: string;
  totalChapters: number;
  completedChapters: number;
  failedChapters: number;
  status: "queued" | "running" | "paused" | "completed" | "failed";
  priority: "high" | "medium" | "low";
  startedAt?: Date;
  completedAt?: Date;
  estimatedTimeRemaining?: number;
  costSaved: number;
  currentChapter?: string;
}

export default function BatchAudioGenerator() {
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [selectedType, setSelectedType] = useState<"course" | "book">("book");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<
    "high" | "medium" | "low"
  >("medium");
  const [loading, setLoading] = useState(false);

  const startBatchGeneration = async () => {
    if (!selectedTarget) return;

    setLoading(true);
    try {
      const res = await fetch("/api/audio/batch-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          targetId: selectedTarget,
          priority: selectedPriority,
        }),
      });

      if (res.ok) {
        const job = await res.json();
        setJobs((prev) => [job, ...prev]);
        setSelectedTarget("");
      }
    } catch (error) {
      console.error("Failed to start batch generation:", error);
    } finally {
      setLoading(false);
    }
  };

  const pauseJob = async (jobId: string) => {
    try {
      await fetch(`/api/audio/batch-generate/${jobId}/pause`, {
        method: "POST",
      });
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, status: "paused" } : job
        )
      );
    } catch (error) {
      console.error("Failed to pause job:", error);
    }
  };

  const resumeJob = async (jobId: string) => {
    try {
      await fetch(`/api/audio/batch-generate/${jobId}/resume`, {
        method: "POST",
      });
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, status: "running" } : job
        )
      );
    } catch (error) {
      console.error("Failed to resume job:", error);
    }
  };

  const retryJob = async (jobId: string) => {
    try {
      await fetch(`/api/audio/batch-generate/${jobId}/retry`, {
        method: "POST",
      });
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? { ...job, status: "running", failedChapters: 0 }
            : job
        )
      );
    } catch (error) {
      console.error("Failed to retry job:", error);
    }
  };

  const getStatusIcon = (status: BatchJob["status"]) => {
    switch (status) {
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "paused":
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "queued":
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: BatchJob["status"]) => {
    switch (status) {
      case "running":
        return "border-blue-500/20 bg-blue-500/10";
      case "completed":
        return "border-green-500/20 bg-green-500/10";
      case "paused":
        return "border-yellow-500/20 bg-yellow-500/10";
      case "failed":
        return "border-red-500/20 bg-red-500/10";
      case "queued":
        return "border-gray-500/20 bg-gray-500/10";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-500";
      case "medium":
        return "bg-yellow-500/20 text-yellow-500";
      case "low":
        return "bg-green-500/20 text-green-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Batch Job */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Start Batch Audio Generation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Type</label>
            <select
              value={selectedType}
              onChange={(e) =>
                setSelectedType(e.target.value as "course" | "book")
              }
              className="w-full px-3 py-2 bg-background border rounded-lg"
            >
              <option value="book">Book</option>
              <option value="course">Course</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {selectedType === "book" ? "Book ID" : "Course ID"}
            </label>
            <input
              type="text"
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              placeholder={`Enter ${selectedType} ID`}
              className="w-full px-3 py-2 bg-background border rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) =>
                setSelectedPriority(e.target.value as "high" | "medium" | "low")
              }
              className="w-full px-3 py-2 bg-background border rounded-lg"
            >
              <option value="high">High (Immediate)</option>
              <option value="medium">Medium (Queue)</option>
              <option value="low">Low (Off-Peak)</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={startBatchGeneration}
              disabled={!selectedTarget || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Generation
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-500 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span>
              <strong>Smart Tip:</strong> Use "Low" priority for off-peak
              generation to maximize cost savings!
            </span>
          </p>
        </div>
      </Card>

      {/* Active Jobs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Active Jobs</h3>

        {jobs.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No batch jobs yet. Start one above! 🚀</p>
          </Card>
        ) : (
          jobs.map((job) => {
            const progress =
              job.totalChapters > 0
                ? (job.completedChapters / job.totalChapters) * 100
                : 0;

            return (
              <Card
                key={job.id}
                className={`p-6 ${getStatusColor(job.status)}`}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <h4 className="font-semibold">{job.targetName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {job.type.charAt(0).toUpperCase() + job.type.slice(1)}{" "}
                          • {job.targetId}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(
                          job.priority
                        )}`}
                      >
                        {job.priority.toUpperCase()}
                      </span>

                      {job.status === "running" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => pauseJob(job.id)}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}

                      {job.status === "paused" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => resumeJob(job.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}

                      {job.status === "failed" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => retryJob(job.id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {job.completedChapters} / {job.totalChapters} chapters
                      </span>
                      <span className="font-medium">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Cost Saved</p>
                      <p className="font-semibold text-green-500">
                        ${job.costSaved.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Failed</p>
                      <p className="font-semibold text-red-500">
                        {job.failedChapters}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time Remaining</p>
                      <p className="font-semibold">
                        {job.estimatedTimeRemaining
                          ? `${Math.ceil(job.estimatedTimeRemaining / 60)}m`
                          : "Calculating..."}
                      </p>
                    </div>
                  </div>

                  {/* Current Chapter */}
                  {job.currentChapter && job.status === "running" && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        Currently processing:{" "}
                        <span className="font-medium text-foreground">
                          {job.currentChapter}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
