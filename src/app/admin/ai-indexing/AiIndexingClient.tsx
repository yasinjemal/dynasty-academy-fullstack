/**
 * 🤖 AI Content Indexing Dashboard
 * Admin tool to index content into Pinecone vector database
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface IndexStats {
  indexed: number;
  errors?: string[];
  message: string;
}

export default function AiIndexingClient() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<IndexStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const indexContent = async (type?: "courses" | "lessons" | "books") => {
    setLoading(true);
    setError(null);
    setStats(null);

    try {
      const response = await fetch("/api/ai/index-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to index content");
      }

      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🤖 AI Content Indexing</h1>
        <p className="text-muted-foreground">
          Index your courses, lessons, and books into Pinecone vector database
          for AI-powered semantic search
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">📚 Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => indexContent("courses")}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? "Indexing..." : "Index Courses"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">📖 Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => indexContent("lessons")}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? "Indexing..." : "Index Lessons"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">📕 Books</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => indexContent("books")}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? "Indexing..." : "Index Books"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              🚀 All Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => indexContent()}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Indexing..." : "Index Everything"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {stats && (
        <Card className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-300">
              ✅ Success!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">{stats.message}</p>
            <p className="text-sm text-muted-foreground">
              Indexed: {stats.indexed} items
            </p>

            {stats.errors && stats.errors.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold text-orange-700 dark:text-orange-300 mb-2">
                  ⚠️ Errors ({stats.errors.length}):
                </p>
                <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                  {stats.errors.map((err, idx) => (
                    <li
                      key={idx}
                      className="text-orange-600 dark:text-orange-400"
                    >
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mb-6 border-red-500 bg-red-50 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300">
              ❌ Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle>ℹ️ About Indexing</CardTitle>
          <CardDescription>How the AI content indexing works</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">What is Indexing?</h3>
            <p className="text-sm text-muted-foreground">
              Indexing converts your content into vector embeddings and stores
              them in Pinecone. This enables the AI Coach to find relevant
              information quickly using semantic search.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">When to Index:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>After adding new courses, lessons, or books</li>
              <li>After updating existing content</li>
              <li>Initial setup (index everything)</li>
              <li>If AI responses seem outdated</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Performance:</h3>
            <p className="text-sm text-muted-foreground">
              Indexing uses OpenAI&apos;s embedding API ($0.00002 per 1K
              tokens). Large content libraries may take a few minutes to index.
            </p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
              💡 Pro Tip:
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              You only need to index content once. Re-index when you make
              significant content updates. The AI Coach will automatically use
              the indexed content to provide better answers!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
