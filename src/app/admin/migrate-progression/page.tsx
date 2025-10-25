"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function MigrationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runMigration = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/admin/migrate-progression", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Migration failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">
          🚀 Course Progression Migration
        </h1>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-800">
            <strong>⚠️ Warning:</strong> This will modify your database schema.
            Make sure you have a backup before proceeding.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">
            What This Migration Does:
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              Adds{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">quiz_passed</code>
              ,{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">
                quiz_attempts
              </code>
              ,{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">
                last_quiz_score
              </code>
              ,{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">can_proceed</code>{" "}
              to{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">
                lesson_progress
              </code>{" "}
              table
            </li>
            <li>
              Adds{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">is_locked</code>,{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">
                requires_quiz
              </code>
              ,{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">
                prerequisite_lesson_id
              </code>{" "}
              to{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">
                course_lessons
              </code>{" "}
              table
            </li>
            <li>
              Adds{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">lesson_id</code>,{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">course_id</code>,{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">
                attempt_number
              </code>{" "}
              to{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">
                quiz_attempts
              </code>{" "}
              table
            </li>
            <li>Creates indexes for better performance</li>
            <li>Unlocks the first lesson of each course (order = 0)</li>
          </ul>
        </div>

        <Button
          onClick={runMigration}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {loading ? "⏳ Running Migration..." : "▶️ Run Migration"}
        </Button>

        {result && (
          <div className="mt-6 bg-green-50 border-l-4 border-green-400 p-4">
            <h3 className="font-semibold text-green-800 mb-2">
              ✅ Migration Successful!
            </h3>
            <p className="text-green-700 mb-3">{result.message}</p>
            <ul className="list-disc list-inside space-y-1 text-green-600">
              {result.changes?.map((change: string, index: number) => (
                <li key={index}>{change}</li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
            <h3 className="font-semibold text-red-800 mb-2">
              ❌ Migration Failed
            </h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && !error && (
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Update quiz submit endpoint to save attempts</li>
              <li>Add lesson unlock validation to lesson endpoints</li>
              <li>Update frontend to show lock icons</li>
              <li>Fix "Next" button navigation to go to quiz first</li>
              <li>Add certificate validation</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
