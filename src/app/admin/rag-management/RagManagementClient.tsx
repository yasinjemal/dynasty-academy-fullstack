"use client";

/**
 * 🎛️ RAG MANAGEMENT CLIENT COMPONENT
 *
 * Interactive UI for managing RAG system
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Stats {
  content_type: string;
  chunk_count: bigint;
  item_count: bigint;
  oldest_embedding: Date;
  newest_embedding: Date;
}

interface RecentEmbedding {
  content_type: string;
  content_title: string;
  chunks: bigint;
  last_updated: Date;
}

interface Book {
  id: string;
  title: string;
  slug: string;
  category: string;
  totalPages: number | null;
  createdAt: Date;
}

interface Props {
  stats: Stats[];
  recentEmbeddings: RecentEmbedding[];
  books: Book[];
}

export default function RagManagementClient({
  stats,
  recentEmbeddings,
  books,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "books" | "test">(
    "overview"
  );
  const [embedding, setEmbedding] = useState(false);
  const [testQuery, setTestQuery] = useState("");
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  // Calculate totals
  const totalChunks = stats.reduce((sum, s) => sum + Number(s.chunk_count), 0);
  const totalItems = stats.reduce((sum, s) => sum + Number(s.item_count), 0);

  // Handle embed book
  const handleEmbedBook = async (bookId: string) => {
    if (!confirm("This will re-embed this book. Continue?")) return;

    setEmbedding(true);
    try {
      const res = await fetch("/api/admin/rag/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });

      if (res.ok) {
        alert("Book embedding started! Check terminal for progress.");
        router.refresh();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert("Failed to start embedding");
    } finally {
      setEmbedding(false);
    }
  };

  // Handle test search
  const handleTestSearch = async () => {
    if (!testQuery.trim()) return;

    setTesting(true);
    try {
      const res = await fetch("/api/admin/rag/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: testQuery }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestResults(data.results || []);
      } else {
        alert("Test failed");
      }
    } catch (error) {
      alert("Test error");
    } finally {
      setTesting(false);
    }
  };

  // Handle delete embeddings
  const handleDeleteEmbeddings = async (
    contentType: string,
    contentId: string
  ) => {
    if (!confirm("Delete all embeddings for this content?")) return;

    try {
      const res = await fetch("/api/admin/rag/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, contentId }),
      });

      if (res.ok) {
        alert("Embeddings deleted!");
        router.refresh();
      } else {
        alert("Delete failed");
      }
    } catch (error) {
      alert("Delete error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Chunks */}
        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Total Chunks</div>
          <div className="text-4xl font-bold text-white mb-1">
            {totalChunks.toLocaleString()}
          </div>
          <div className="text-gray-500 text-xs">Vector embeddings stored</div>
        </div>

        {/* Total Items */}
        <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Total Items</div>
          <div className="text-4xl font-bold text-white mb-1">
            {totalItems.toLocaleString()}
          </div>
          <div className="text-gray-500 text-xs">Books/courses/lessons</div>
        </div>

        {/* Status */}
        <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">System Status</div>
          <div className="text-2xl font-bold text-white mb-1">
            {totalChunks > 0 ? "✅ Active" : "⏳ Empty"}
          </div>
          <div className="text-gray-500 text-xs">
            {totalChunks > 0 ? "RAG system operational" : "No embeddings yet"}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "overview"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab("books")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "books"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          📚 Books
        </button>
        <button
          onClick={() => setActiveTab("test")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "test"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          🧪 Test Search
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* By Type */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              📋 Embeddings by Type
            </h2>
            <div className="space-y-3">
              {stats.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No embeddings yet. Run the embedding script to get started.
                </div>
              ) : (
                stats.map((stat) => (
                  <div
                    key={stat.content_type}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                  >
                    <div>
                      <div className="text-white font-medium capitalize">
                        {stat.content_type}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {Number(stat.item_count)} items,{" "}
                        {Number(stat.chunk_count)} chunks
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <div>
                        Updated:{" "}
                        {new Date(stat.newest_embedding).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Embeddings */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              🕐 Recently Embedded
            </h2>
            <div className="space-y-2">
              {recentEmbeddings.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No embeddings yet
                </div>
              ) : (
                recentEmbeddings.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <div>
                      <div className="text-white font-medium">
                        {item.content_title}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {item.content_type} • {Number(item.chunks)} chunks
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.last_updated).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Books Tab */}
      {activeTab === "books" && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">📚 Manage Books</h2>
          <div className="space-y-2">
            {books.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No books found
              </div>
            ) : (
              books.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
                >
                  <div>
                    <div className="text-white font-medium">{book.title}</div>
                    <div className="text-gray-500 text-sm">
                      {book.category} •{" "}
                      {book.totalPages
                        ? `${book.totalPages} pages`
                        : "No pages"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEmbedBook(book.id)}
                      disabled={embedding}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                    >
                      {embedding ? "⏳ Embedding..." : "🔄 Embed"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Test Tab */}
      {activeTab === "test" && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">🧪 Test Search</h2>

          <div className="space-y-4">
            {/* Search Input */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">
                Test Query
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="What does the book say about discipline?"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  onKeyDown={(e) => e.key === "Enter" && handleTestSearch()}
                />
                <button
                  onClick={handleTestSearch}
                  disabled={testing || !testQuery.trim()}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  {testing ? "⏳ Testing..." : "🔍 Search"}
                </button>
              </div>
            </div>

            {/* Results */}
            {testResults.length > 0 && (
              <div className="space-y-3">
                <div className="text-gray-400 text-sm">
                  Found {testResults.length} relevant chunks
                </div>
                {testResults.map((result, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-medium">
                        {result.content_title}
                        {result.page_number && ` • Page ${result.page_number}`}
                      </div>
                      <div className="text-sm text-purple-400">
                        {Math.round(result.similarity * 100)}% match
                      </div>
                    </div>
                    <div className="text-gray-400 text-sm leading-relaxed">
                      {result.chunk_text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
