/**
 * Similarity Testing Service
 *
 * Tests and validates vector similarity search accuracy:
 * - Precision/Recall metrics
 * - Concept recommendation quality
 * - Search performance benchmarks
 * - False positive detection
 *
 * Week 2 - Phase 1 Self-Healing Knowledge Graph MVP
 * Target: 85%+ accuracy
 */

import { PrismaClient } from "@prisma/client";
import {
  findSimilarConcepts,
  semanticConceptSearch,
} from "./vector-similarity";
import { generateEmbedding } from "./vector-embeddings";
import { logInfo, logError } from "@/lib/infrastructure/logger";

const prisma = new PrismaClient();

// Test result types
export interface SimilarityTestResult {
  testName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  avgSearchTime: number;
  totalTests: number;
  passed: number;
  failed: number;
  details: TestDetail[];
}

export interface TestDetail {
  query: string;
  expectedConcepts: string[];
  foundConcepts: string[];
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  searchTime: number;
  passed: boolean;
}

/**
 * Run comprehensive similarity tests
 */
export async function runSimilarityTests(): Promise<{
  overallAccuracy: number;
  tests: SimilarityTestResult[];
  passedAllTests: boolean;
  summary: string;
}> {
  const startTime = Date.now();

  logInfo("Starting similarity accuracy tests", {});

  const tests: SimilarityTestResult[] = [];

  // Test 1: Known Prerequisite Relationships
  tests.push(await testPrerequisiteAccuracy());

  // Test 2: Concept Category Clustering
  tests.push(await testCategoryAccuracy());

  // Test 3: Difficulty Level Similarity
  tests.push(await testDifficultyAccuracy());

  // Test 4: Semantic Search Quality
  tests.push(await testSemanticSearchQuality());

  // Test 5: Performance Benchmarks
  tests.push(await testSearchPerformance());

  // Calculate overall metrics
  const avgAccuracy =
    tests.reduce((sum, t) => sum + t.accuracy, 0) / tests.length;
  const avgPrecision =
    tests.reduce((sum, t) => sum + t.precision, 0) / tests.length;
  const avgRecall = tests.reduce((sum, t) => sum + t.recall, 0) / tests.length;
  const avgF1 = tests.reduce((sum, t) => sum + t.f1Score, 0) / tests.length;

  const passedAllTests = tests.every((t) => t.accuracy >= 0.85); // 85% threshold

  const summary = `
Overall Test Results:
- Average Accuracy: ${(avgAccuracy * 100).toFixed(1)}%
- Average Precision: ${(avgPrecision * 100).toFixed(1)}%
- Average Recall: ${(avgRecall * 100).toFixed(1)}%
- Average F1 Score: ${(avgF1 * 100).toFixed(1)}%
- Duration: ${((Date.now() - startTime) / 1000).toFixed(2)}s
- Status: ${passedAllTests ? "✅ PASSED" : "❌ FAILED"}
${!passedAllTests ? "\nTarget: 85%+ accuracy required" : ""}
  `.trim();

  logInfo("Similarity tests complete", {
    overallAccuracy: avgAccuracy,
    passedAllTests,
    duration: Date.now() - startTime,
  });

  return {
    overallAccuracy: avgAccuracy,
    tests,
    passedAllTests,
    summary,
  };
}

/**
 * Test 1: Prerequisite relationship accuracy
 * Validates that prerequisite concepts are found via similarity search
 */
async function testPrerequisiteAccuracy(): Promise<SimilarityTestResult> {
  const startTime = Date.now();
  const details: TestDetail[] = [];
  let totalPassed = 0;

  // Get concepts with prerequisites
  const concepts = await prisma.concept.findMany({
    where: {
      childRelationships: {
        some: { relationshipType: "prerequisite" },
      },
    },
    include: {
      childRelationships: {
        where: { relationshipType: "prerequisite" },
        include: { parentConcept: true },
      },
    },
    take: 10, // Test sample
  });

  for (const concept of concepts) {
    const queryStart = Date.now();

    // Find similar concepts
    const similar = await findSimilarConcepts(concept.id, 10);

    const searchTime = Date.now() - queryStart;

    // Expected: Should find prerequisite concepts
    const expectedIds = new Set(
      concept.childRelationships.map((r) => r.parentConceptId)
    );
    const foundIds = new Set(similar.map((s) => s.id));

    const expectedConcepts = concept.childRelationships.map(
      (r) => r.parentConcept.name
    );
    const foundConcepts = similar.map((s) => s.name);

    // Calculate metrics
    const truePositives = [...expectedIds].filter((id) =>
      foundIds.has(id)
    ).length;
    const falsePositives = similar.filter((s) => !expectedIds.has(s.id)).length;
    const falseNegatives = [...expectedIds].filter(
      (id) => !foundIds.has(id)
    ).length;

    const passed = truePositives >= expectedIds.size * 0.7; // 70% of prerequisites found
    if (passed) totalPassed++;

    details.push({
      query: concept.name,
      expectedConcepts,
      foundConcepts,
      truePositives,
      falsePositives,
      falseNegatives,
      searchTime,
      passed,
    });
  }

  const avgSearchTime =
    details.reduce((sum, d) => sum + d.searchTime, 0) / details.length;

  const totalTp = details.reduce((sum, d) => sum + d.truePositives, 0);
  const totalFp = details.reduce((sum, d) => sum + d.falsePositives, 0);
  const totalFn = details.reduce((sum, d) => sum + d.falseNegatives, 0);

  const precision = totalTp / (totalTp + totalFp) || 0;
  const recall = totalTp / (totalTp + totalFn) || 0;
  const f1Score = (2 * precision * recall) / (precision + recall) || 0;
  const accuracy = totalPassed / details.length;

  return {
    testName: "Prerequisite Relationship Accuracy",
    accuracy,
    precision,
    recall,
    f1Score,
    avgSearchTime,
    totalTests: details.length,
    passed: totalPassed,
    failed: details.length - totalPassed,
    details,
  };
}

/**
 * Test 2: Category clustering accuracy
 * Validates that concepts in the same category cluster together
 */
async function testCategoryAccuracy(): Promise<SimilarityTestResult> {
  const details: TestDetail[] = [];
  let totalPassed = 0;

  // Get concepts grouped by category
  const categories = await prisma.concept.groupBy({
    by: ["category"],
    having: {
      category: {
        _count: {
          gte: 3, // At least 3 concepts in category
        },
      },
    },
  });

  for (const { category } of categories.slice(0, 10)) {
    if (!category) continue;

    const conceptsInCategory = await prisma.concept.findMany({
      where: { category },
      take: 3,
    });

    for (const concept of conceptsInCategory) {
      const queryStart = Date.now();
      const similar = await findSimilarConcepts(concept.id, 10);
      const searchTime = Date.now() - queryStart;

      // Expected: Most similar concepts should be from same category
      const sameCategoryCount = similar.filter(
        (s) => s.category === category
      ).length;

      const expectedConcepts = [category];
      const foundConcepts = similar.map((s) => s.category || "Unknown");

      const passed = sameCategoryCount >= 5; // 50% from same category
      if (passed) totalPassed++;

      details.push({
        query: `${concept.name} (${category})`,
        expectedConcepts,
        foundConcepts,
        truePositives: sameCategoryCount,
        falsePositives: similar.length - sameCategoryCount,
        falseNegatives: 0,
        searchTime,
        passed,
      });
    }
  }

  const avgSearchTime =
    details.reduce((sum, d) => sum + d.searchTime, 0) / details.length;

  const totalTp = details.reduce((sum, d) => sum + d.truePositives, 0);
  const totalFp = details.reduce((sum, d) => sum + d.falsePositives, 0);

  const precision = totalTp / (totalTp + totalFp) || 0;
  const accuracy = totalPassed / details.length;

  return {
    testName: "Category Clustering Accuracy",
    accuracy,
    precision,
    recall: precision, // Same as precision for this test
    f1Score: precision,
    avgSearchTime,
    totalTests: details.length,
    passed: totalPassed,
    failed: details.length - totalPassed,
    details,
  };
}

/**
 * Test 3: Difficulty level similarity
 * Validates that concepts with similar difficulty levels cluster together
 */
async function testDifficultyAccuracy(): Promise<SimilarityTestResult> {
  const details: TestDetail[] = [];
  let totalPassed = 0;

  const concepts = await prisma.concept.findMany({
    where: { difficultyScore: { not: null } },
    take: 15,
  });

  for (const concept of concepts) {
    const queryStart = Date.now();
    const similar = await findSimilarConcepts(concept.id, 10);
    const searchTime = Date.now() - queryStart;

    // Expected: Similar concepts should have ±2 difficulty levels
    const tolerance = 2;
    const targetDifficulty = concept.difficultyScore!;
    const withinRange = similar.filter(
      (s) =>
        s.difficultyScore &&
        Math.abs(s.difficultyScore - targetDifficulty) <= tolerance
    ).length;

    const passed = withinRange >= 6; // 60% within range
    if (passed) totalPassed++;

    details.push({
      query: `${concept.name} (Difficulty: ${targetDifficulty})`,
      expectedConcepts: [
        `Difficulty ${targetDifficulty - tolerance}-${
          targetDifficulty + tolerance
        }`,
      ],
      foundConcepts: similar.map(
        (s) => `${s.name} (${s.difficultyScore || "N/A"})`
      ),
      truePositives: withinRange,
      falsePositives: similar.length - withinRange,
      falseNegatives: 0,
      searchTime,
      passed,
    });
  }

  const avgSearchTime =
    details.reduce((sum, d) => sum + d.searchTime, 0) / details.length;

  const totalTp = details.reduce((sum, d) => sum + d.truePositives, 0);
  const totalFp = details.reduce((sum, d) => sum + d.falsePositives, 0);

  const precision = totalTp / (totalTp + totalFp) || 0;
  const accuracy = totalPassed / details.length;

  return {
    testName: "Difficulty Level Similarity",
    accuracy,
    precision,
    recall: precision,
    f1Score: precision,
    avgSearchTime,
    totalTests: details.length,
    passed: totalPassed,
    failed: details.length - totalPassed,
    details,
  };
}

/**
 * Test 4: Semantic search quality
 * Tests natural language queries
 */
async function testSemanticSearchQuality(): Promise<SimilarityTestResult> {
  const details: TestDetail[] = [];
  let totalPassed = 0;

  // Test queries
  const testQueries = [
    {
      query: "programming basics",
      expectedCategories: ["Programming", "Software Development"],
    },
    {
      query: "data analysis techniques",
      expectedCategories: ["Data Science", "Analytics"],
    },
    {
      query: "business strategy",
      expectedCategories: ["Business", "Management"],
    },
    {
      query: "machine learning algorithms",
      expectedCategories: ["AI", "Machine Learning"],
    },
    {
      query: "web development fundamentals",
      expectedCategories: ["Web Development", "Programming"],
    },
  ];

  for (const test of testQueries) {
    const queryStart = Date.now();
    const results = await semanticConceptSearch(test.query, 10);
    const searchTime = Date.now() - queryStart;

    // Check if results match expected categories
    const matchingCategories = results.filter((r) =>
      test.expectedCategories.some((cat) => r.category?.includes(cat))
    ).length;

    const passed = matchingCategories >= 3; // At least 30% relevant
    if (passed) totalPassed++;

    details.push({
      query: test.query,
      expectedConcepts: test.expectedCategories,
      foundConcepts: results.map(
        (r) => `${r.name} (${r.category || "Unknown"})`
      ),
      truePositives: matchingCategories,
      falsePositives: results.length - matchingCategories,
      falseNegatives: 0,
      searchTime,
      passed,
    });
  }

  const avgSearchTime =
    details.reduce((sum, d) => sum + d.searchTime, 0) / details.length;

  const totalTp = details.reduce((sum, d) => sum + d.truePositives, 0);
  const totalFp = details.reduce((sum, d) => sum + d.falsePositives, 0);

  const precision = totalTp / (totalTp + totalFp) || 0;
  const accuracy = totalPassed / details.length;

  return {
    testName: "Semantic Search Quality",
    accuracy,
    precision,
    recall: precision,
    f1Score: precision,
    avgSearchTime,
    totalTests: details.length,
    passed: totalPassed,
    failed: details.length - totalPassed,
    details,
  };
}

/**
 * Test 5: Search performance benchmarks
 * Validates that search is fast (<50ms with HNSW index)
 */
async function testSearchPerformance(): Promise<SimilarityTestResult> {
  const details: TestDetail[] = [];
  let totalPassed = 0;

  const concepts = await prisma.concept.findMany({ take: 20 });

  for (const concept of concepts) {
    const queryStart = Date.now();
    await findSimilarConcepts(concept.id, 10);
    const searchTime = Date.now() - queryStart;

    const passed = searchTime < 50; // <50ms target
    if (passed) totalPassed++;

    details.push({
      query: concept.name,
      expectedConcepts: ["<50ms"],
      foundConcepts: [`${searchTime}ms`],
      truePositives: passed ? 1 : 0,
      falsePositives: 0,
      falseNegatives: passed ? 0 : 1,
      searchTime,
      passed,
    });
  }

  const avgSearchTime =
    details.reduce((sum, d) => sum + d.searchTime, 0) / details.length;
  const accuracy = totalPassed / details.length;

  return {
    testName: "Search Performance (<50ms)",
    accuracy,
    precision: accuracy,
    recall: accuracy,
    f1Score: accuracy,
    avgSearchTime,
    totalTests: details.length,
    passed: totalPassed,
    failed: details.length - totalPassed,
    details,
  };
}
