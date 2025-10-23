/**
 * Test Script: Concept Extraction & Accuracy Testing
 * 
 * This script will:
 * 1. Check if courses exist in database
 * 2. Extract concepts from all courses
 * 3. Run accuracy tests
 * 4. Display results
 */

import { PrismaClient } from '@prisma/client';
import { processConceptsForAllCourses } from './src/lib/ai/concept-extractor';
import { runSimilarityTests } from './src/lib/ai/similarity-tester';

const prisma = new PrismaClient();

async function main() {
  console.log('🧠 Dynasty Nexus 2.0 - Concept Extraction Test\n');
  console.log('='.repeat(60) + '\n');

  // Step 1: Check courses
  console.log('📚 Step 1: Checking courses in database...');
  const courses = await prisma.course.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      _count: {
        select: { lessons: true },
      },
    },
  });

  console.log(`Found ${courses.length} published courses:\n`);
  courses.slice(0, 5).forEach((course, i) => {
    console.log(`  ${i + 1}. ${course.title} (${course._count.lessons} lessons)`);
  });
  if (courses.length > 5) {
    console.log(`  ... and ${courses.length - 5} more`);
  }
  console.log('');

  if (courses.length === 0) {
    console.log('❌ No published courses found.');
    console.log('   Please publish some courses first or create test data.\n');
    return;
  }

  // Step 2: Extract concepts
  console.log('🤖 Step 2: Extracting concepts with GPT-4...');
  console.log('   This will take 6-8 minutes for 100 courses');
  console.log('   Cost: ~$0.05-0.15 per course\n');

  try {
    const extractionResults = await processConceptsForAllCourses();

    console.log('✅ Concept extraction complete!\n');
    console.log('Results:');
    console.log(`  - Total courses processed: ${extractionResults.totalCourses}`);
    console.log(`  - Total concepts extracted: ${extractionResults.totalConcepts}`);
    console.log(`  - Total relationships mapped: ${extractionResults.totalRelationships}`);
    console.log(`  - Total cost: $${extractionResults.totalCost.toFixed(4)}`);
    console.log(`  - Duration: ${(extractionResults.duration / 1000).toFixed(1)}s\n`);
  } catch (error) {
    console.error('❌ Concept extraction failed:', error);
    console.error('   This might be due to:');
    console.error('   - Missing OPENAI_API_KEY in .env');
    console.error('   - Network connectivity issues');
    console.error('   - Insufficient course content\n');
    return;
  }

  // Step 3: Run accuracy tests
  console.log('🧪 Step 3: Running accuracy tests...');
  console.log('   Testing 5 different accuracy metrics');
  console.log('   Target: 85%+ accuracy\n');

  try {
    const testResults = await runSimilarityTests();

    console.log('✅ Accuracy tests complete!\n');
    console.log('='.repeat(60));
    console.log(testResults.summary);
    console.log('='.repeat(60) + '\n');

    // Display individual test results
    console.log('Individual Test Results:\n');
    testResults.tests.forEach((test, i) => {
      const status = test.accuracy >= 0.85 ? '✅' : '❌';
      console.log(`${i + 1}. ${test.testName} ${status}`);
      console.log(`   Accuracy: ${(test.accuracy * 100).toFixed(1)}%`);
      console.log(`   Precision: ${(test.precision * 100).toFixed(1)}%`);
      console.log(`   Recall: ${(test.recall * 100).toFixed(1)}%`);
      console.log(`   F1 Score: ${(test.f1Score * 100).toFixed(1)}%`);
      console.log(`   Avg Search Time: ${test.avgSearchTime.toFixed(1)}ms`);
      console.log(`   Pass Rate: ${test.passed}/${test.passed + test.failed}\n`);
    });

    // Final verdict
    if (testResults.passedAllTests) {
      console.log('🎉 SUCCESS! All tests passed with 85%+ accuracy');
      console.log('   Your knowledge graph is production ready!\n');
    } else {
      console.log('⚠️  WARNING: Some tests below 85% threshold');
      console.log('   Consider extracting more concepts or adjusting parameters\n');
    }
  } catch (error) {
    console.error('❌ Accuracy testing failed:', error);
    console.error('   This might be due to:');
    console.error('   - Insufficient concepts in database');
    console.error('   - Missing embeddings');
    console.error('   - Database connectivity issues\n');
    return;
  }

  // Summary
  console.log('='.repeat(60));
  console.log('🚀 Week 2 Testing Complete!');
  console.log('='.repeat(60));
  console.log('Next steps:');
  console.log('  1. View results in admin dashboard: /admin/concepts');
  console.log('  2. Test similarity search with real queries');
  console.log('  3. Move to Week 3: Gap Detection System\n');
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
