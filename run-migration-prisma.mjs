#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('📖 Reading migration file...');
    const sql = readFileSync('migrate-intelligent-audio.sql', 'utf8');
    console.log(`✅ Loaded ${sql.split('\n').length} lines`);

    console.log('🚀 Executing migration...');
    console.log('   This will add:');
    console.log('   - Enhanced AudioAsset with ML fields (semanticHash, embedding, etc.)');
    console.log('   - 8 new tables for ML tracking');
    console.log('   - Indexes for vector search');
    console.log('');

    await prisma.$executeRawUnsafe(sql);
    
    console.log('');
    console.log('✅ MIGRATION COMPLETE!');
    console.log('');
    console.log('🧠 Intelligent Audio schema is ready:');
    console.log('   ✓ AudioAsset enhanced with ML fields');
    console.log('   ✓ UserReadingSession created');
    console.log('   ✓ UserFeedback created');
    console.log('   ✓ QualityABTest created');
    console.log('   ✓ MLModelInsight created');
    console.log('   ✓ PredictionHistory created');
    console.log('   ✓ VoicePerformance created');
    console.log('   ✓ IntelligenceMetrics created');
    console.log('   ✓ BackgroundJob created');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('   1. Run: npx prisma db pull');
    console.log('   2. Run: npx prisma generate');
    console.log('   3. Test intelligent audio generation');
    console.log('');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
