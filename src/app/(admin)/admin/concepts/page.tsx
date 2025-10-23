/**
 * Concept Extraction Dashboard
 * 
 * Admin interface for:
 * - Extract concepts from courses
 * - View concept statistics
 * - Manage concept relationships
 * - Test concept similarity
 * 
 * Week 2 - Phase 1 Self-Healing Knowledge Graph MVP
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Sparkles,
  TrendingUp,
  Network,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  DollarSign,
} from 'lucide-react';

interface ConceptStats {
  totalConcepts: number;
  totalRelationships: number;
  byCategory: Record<string, number>;
  avgDifficulty: number;
}

interface ExtractionResult {
  courseId: string;
  courseTitle: string;
  concepts: number;
  relationships: number;
  cost: number;
  duration: number;
}

interface TestResult {
  overallAccuracy: number;
  passedAllTests: boolean;
  summary: string;
  tests: Array<{
    testName: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    avgSearchTime: number;
    passed: number;
    failed: number;
  }>;
}

export default function ConceptDashboard() {
  const [stats, setStats] = useState<ConceptStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<ExtractionResult[]>([]);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/concepts/extract');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to load stats');
      }
    } catch (err) {
      setError('Failed to load stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const extractAllConcepts = async () => {
    try {
      setExtracting(true);
      setError(null);
      setResults([]);
      setTotalCost(0);

      const response = await fetch('/api/ai/concepts/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'all' }),
      });

      const data = await response.json();

      if (data.success) {
        setTotalCost(data.totalCost);
        // Reload stats after extraction
        await loadStats();
      } else {
        setError(data.error || 'Failed to extract concepts');
      }
    } catch (err) {
      setError('Failed to extract concepts');
      console.error(err);
    } finally {
      setExtracting(false);
    }
  };

  const runAccuracyTests = async () => {
    try {
      setTesting(true);
      setError(null);
      setTestResult(null);

      const response = await fetch('/api/ai/concepts/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        setTestResult(data);
      } else {
        setError(data.error || 'Failed to run tests');
      }
    } catch (err) {
      setError('Failed to run tests');
      console.error(err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">
              Concept Extraction Dashboard
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            AI-Powered Knowledge Graph Builder
          </p>
          <p className="text-gray-400 text-sm mt-2">
            GPT-4 extracts concepts, relationships, and learning paths from your courses
          </p>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-300">{error}</p>
          </motion.div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Brain}
              label="Total Concepts"
              value={stats.totalConcepts}
              color="purple"
            />
            <StatCard
              icon={Network}
              label="Relationships"
              value={stats.totalRelationships}
              color="blue"
            />
            <StatCard
              icon={TrendingUp}
              label="Categories"
              value={Object.keys(stats.byCategory).length}
              color="green"
            />
            <StatCard
              icon={Sparkles}
              label="Avg Difficulty"
              value={stats.avgDifficulty.toFixed(1)}
              color="yellow"
            />
          </div>
        )}

        {/* Categories Breakdown */}
        {stats && Object.keys(stats.byCategory).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Network className="w-6 h-6 text-purple-400" />
              Concepts by Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <div
                  key={category}
                  className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                >
                  <p className="text-gray-300 text-sm">{category}</p>
                  <p className="text-2xl font-bold text-white mt-1">{count}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Extraction Control */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            Extract Concepts
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-300">
              Use GPT-4 to analyze all courses and extract key learning concepts with their relationships.
            </p>

            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                <strong>What this does:</strong>
              </p>
              <ul className="text-blue-300 text-sm mt-2 space-y-1 ml-4 list-disc">
                <li>Analyzes course content with GPT-4</li>
                <li>Extracts 5-15 key concepts per course</li>
                <li>Identifies prerequisite relationships</li>
                <li>Generates concept embeddings for similarity search</li>
                <li>Stores concepts in the knowledge graph</li>
              </ul>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
              <p className="text-yellow-300 text-sm">
                <strong>Cost estimate:</strong> ~$0.05-0.15 per course (GPT-4 pricing)
              </p>
            </div>

            <button
              onClick={extractAllConcepts}
              disabled={extracting || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-500/25"
            >
              {extracting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Extracting Concepts...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Extract Concepts from All Courses
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Accuracy Testing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            Test Similarity Accuracy
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-300">
              Run comprehensive tests to validate vector similarity search accuracy.
            </p>

            <div className="bg-purple-500/10 border border-purple-500/50 rounded-lg p-4">
              <p className="text-purple-300 text-sm">
                <strong>Tests include:</strong>
              </p>
              <ul className="text-purple-300 text-sm mt-2 space-y-1 ml-4 list-disc">
                <li>Prerequisite relationship accuracy</li>
                <li>Category clustering validation</li>
                <li>Difficulty level similarity</li>
                <li>Semantic search quality</li>
                <li>Performance benchmarks (&lt;50ms)</li>
              </ul>
            </div>

            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
              <p className="text-green-300 text-sm">
                <strong>Target:</strong> 85%+ accuracy across all tests
              </p>
            </div>

            <button
              onClick={runAccuracyTests}
              disabled={testing || loading || !stats || stats.totalConcepts === 0}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-500/25"
            >
              {testing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  Run Accuracy Tests
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Test Results */}
        {testResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {testResult.passedAllTests ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                )}
                Test Results
              </h2>
              <div
                className={`flex items-center gap-2 ${
                  testResult.passedAllTests
                    ? 'bg-green-500/20 border-green-500/50'
                    : 'bg-yellow-500/20 border-yellow-500/50'
                } border rounded-lg px-4 py-2`}
              >
                <span
                  className={`font-semibold ${
                    testResult.passedAllTests ? 'text-green-300' : 'text-yellow-300'
                  }`}
                >
                  Overall: {(testResult.overallAccuracy * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {testResult.tests.map((test, index) => (
                <div
                  key={index}
                  className={`bg-gray-700/50 rounded-lg p-4 border ${
                    test.accuracy >= 0.85
                      ? 'border-green-500/50'
                      : 'border-yellow-500/50'
                  }`}
                >
                  <p className="text-white font-semibold text-sm mb-2">
                    {test.testName}
                  </p>
                  <p className="text-2xl font-bold text-white mb-1">
                    {(test.accuracy * 100).toFixed(1)}%
                  </p>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>Precision: {(test.precision * 100).toFixed(1)}%</p>
                    <p>Recall: {(test.recall * 100).toFixed(1)}%</p>
                    <p>Avg Time: {test.avgSearchTime.toFixed(1)}ms</p>
                    <p>
                      {test.passed}/{test.passed + test.failed} passed
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                {testResult.summary}
              </pre>
            </div>
          </motion.div>
        )}

        {/* Extraction Results */}
        {totalCost > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                Extraction Complete
              </h2>
              <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded-lg px-4 py-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-semibold">
                  Total Cost: ${totalCost.toFixed(4)}
                </span>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm">
              Concepts have been extracted and saved to your knowledge graph. Reload the page to see updated statistics.
            </p>
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm">
          <p>Dynasty Nexus 2.0 - Phase 1 Self-Healing Knowledge Graph MVP</p>
          <p className="mt-1">Week 2: Concept Extraction & Relationship Mapping</p>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: 'purple' | 'blue' | 'green' | 'yellow';
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    purple: 'from-purple-600 to-purple-800 text-purple-300',
    blue: 'from-blue-600 to-blue-800 text-blue-300',
    green: 'from-green-600 to-green-800 text-green-300',
    yellow: 'from-yellow-600 to-yellow-800 text-yellow-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 border border-gray-700 shadow-lg`}
    >
      <Icon className="w-8 h-8 mb-3 opacity-80" />
      <p className="text-white text-3xl font-bold">{value}</p>
      <p className="opacity-80 text-sm mt-1">{label}</p>
    </motion.div>
  );
}
