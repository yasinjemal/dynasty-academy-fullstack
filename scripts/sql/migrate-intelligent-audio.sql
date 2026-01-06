-- 🧠 DYNASTY AUDIO INTELLIGENCE - ADVANCED SCHEMA
-- Support for truly intelligent ML-powered algorithms
-- Version: 2.0 - Actually Intelligent

-- 1. Enhanced AudioAsset with ML fields
ALTER TABLE "AudioAsset" 
ADD COLUMN IF NOT EXISTS "semanticHash" TEXT,
ADD COLUMN IF NOT EXISTS "embedding" JSONB, -- Vector embedding for semantic search
ADD COLUMN IF NOT EXISTS "contentType" TEXT CHECK ("contentType" IN ('narrative', 'dialogue', 'technical', 'emotional', 'descriptive')),
ADD COLUMN IF NOT EXISTS "emotionalTone" DECIMAL(3,2) CHECK ("emotionalTone" BETWEEN 0 AND 1),
ADD COLUMN IF NOT EXISTS "complexity" DECIMAL(3,2) CHECK ("complexity" BETWEEN 0 AND 1),
ADD COLUMN IF NOT EXISTS "targetAudience" TEXT CHECK ("targetAudience" IN ('children', 'young-adult', 'adult', 'academic')),
ADD COLUMN IF NOT EXISTS "keyThemes" TEXT[],
ADD COLUMN IF NOT EXISTS "provider" TEXT CHECK ("provider" IN ('elevenlabs', 'openai', 'google', 'azure')),
ADD COLUMN IF NOT EXISTS "quality" TEXT CHECK ("quality" IN ('standard', 'premium', 'ultra')),
ADD COLUMN IF NOT EXISTS "compressionRatio" DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS "bitrate" INTEGER;

-- Create index on semantic hash for fast lookups
CREATE INDEX IF NOT EXISTS "idx_semantic_hash" ON "AudioAsset"("semanticHash");

-- Create index on content characteristics for filtering
CREATE INDEX IF NOT EXISTS "idx_content_type_audience" ON "AudioAsset"("contentType", "targetAudience");

-- 2. User Reading Sessions (for predictive algorithms)
CREATE TABLE IF NOT EXISTS "UserReadingSession" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "bookId" TEXT,
  "chapterId" INTEGER,
  "startedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt" TIMESTAMP,
  "durationMinutes" INTEGER,
  "wordsRead" INTEGER,
  "readingSpeed" INTEGER, -- words per minute
  "completionPercentage" DECIMAL(5,2),
  "deviceType" TEXT CHECK ("deviceType" IN ('mobile', 'tablet', 'desktop')),
  "connectionSpeed" DECIMAL(10,2), -- Mbps
  "audioQuality" TEXT,
  "hadErrors" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_user_reading_sessions" ON "UserReadingSession"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_book_chapter_sessions" ON "UserReadingSession"("bookId", "chapterId");

-- 3. User Feedback (for ML model training)
CREATE TABLE IF NOT EXISTS "UserFeedback" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "audioAssetId" TEXT,
  "sessionId" TEXT,
  "voiceRating" INTEGER CHECK ("voiceRating" BETWEEN 1 AND 5),
  "qualityRating" INTEGER CHECK ("qualityRating" BETWEEN 1 AND 5),
  "speedRating" INTEGER CHECK ("speedRating" BETWEEN 1 AND 5),
  "overallSatisfaction" INTEGER CHECK ("overallSatisfaction" BETWEEN 1 AND 5),
  "wouldRecommend" BOOLEAN,
  "feedback" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("audioAssetId") REFERENCES "AudioAsset"("id") ON DELETE SET NULL,
  FOREIGN KEY ("sessionId") REFERENCES "UserReadingSession"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "idx_feedback_asset" ON "UserFeedback"("audioAssetId");
CREATE INDEX IF NOT EXISTS "idx_feedback_ratings" ON "UserFeedback"("voiceRating", "qualityRating");

-- 4. A/B Testing Results
CREATE TABLE IF NOT EXISTS "QualityABTest" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "audioAssetId" TEXT,
  "variant" TEXT, -- test variant identifier
  "quality" TEXT CHECK ("quality" IN ('standard', 'premium', 'ultra')),
  "provider" TEXT CHECK ("provider" IN ('elevenlabs', 'openai', 'google', 'azure')),
  "deviceType" TEXT CHECK ("deviceType" IN ('mobile', 'tablet', 'desktop')),
  "loadTime" DECIMAL(10,2), -- seconds
  "userSatisfaction" INTEGER CHECK ("userSatisfaction" BETWEEN 1 AND 5),
  "completionRate" DECIMAL(5,2), -- 0-100%
  "errorRate" DECIMAL(5,2), -- 0-100%
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("audioAssetId") REFERENCES "AudioAsset"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "idx_ab_test_quality_provider" ON "QualityABTest"("quality", "provider", "deviceType");

-- 5. ML Model Insights (self-learning system)
CREATE TABLE IF NOT EXISTS "MLModelInsight" (
  "id" TEXT PRIMARY KEY,
  "modelType" TEXT NOT NULL, -- 'voice-matching', 'prediction', 'quality-optimization', etc.
  "insights" TEXT NOT NULL, -- JSON or text analysis from Claude/GPT
  "trainingDataSize" INTEGER,
  "accuracy" DECIMAL(5,2),
  "recommendations" TEXT[],
  "appliedToProduction" BOOLEAN DEFAULT FALSE,
  "generatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "appliedAt" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_ml_insights_type" ON "MLModelInsight"("modelType", "generatedAt");

-- 6. Enhanced AudioUsageLog with intelligence metrics
ALTER TABLE "AudioUsageLog" 
ADD COLUMN IF NOT EXISTS "semanticSimilarity" DECIMAL(5,4), -- 0-1 cosine similarity
ADD COLUMN IF NOT EXISTS "voiceMatchScore" DECIMAL(5,4), -- 0-1 ML confidence
ADD COLUMN IF NOT EXISTS "predictionAccuracy" DECIMAL(5,4), -- 0-1 if was predicted
ADD COLUMN IF NOT EXISTS "qualityDecision" TEXT,
ADD COLUMN IF NOT EXISTS "processingTimeMs" INTEGER,
ADD COLUMN IF NOT EXISTS "flaggedAsAnomaly" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "anomalyType" TEXT,
ADD COLUMN IF NOT EXISTS "riskScore" DECIMAL(5,4);

-- 7. Prediction History (track prediction accuracy)
CREATE TABLE IF NOT EXISTS "PredictionHistory" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "bookId" TEXT,
  "predictedChapterId" INTEGER,
  "confidence" DECIMAL(5,4) NOT NULL, -- 0-1
  "wasCorrect" BOOLEAN,
  "actualChapterId" INTEGER,
  "timeToActual" INTEGER, -- minutes until user actually accessed predicted chapter
  "predictionReasoning" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "verifiedAt" TIMESTAMP,
  
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_prediction_accuracy" ON "PredictionHistory"("userId", "wasCorrect");
CREATE INDEX IF NOT EXISTS "idx_prediction_confidence" ON "PredictionHistory"("confidence", "wasCorrect");

-- 8. Voice Performance Analytics
CREATE TABLE IF NOT EXISTS "VoicePerformance" (
  "id" TEXT PRIMARY KEY,
  "voiceId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "contentType" TEXT,
  "targetAudience" TEXT,
  "totalUsages" INTEGER DEFAULT 0,
  "avgUserRating" DECIMAL(3,2),
  "avgCompletionRate" DECIMAL(5,2),
  "avgLoadTime" DECIMAL(10,2),
  "costPerGeneration" DECIMAL(10,6),
  "lastUsedAt" TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_voice_perf_unique" 
ON "VoicePerformance"("voiceId", "provider", "contentType", "targetAudience");

-- 9. Real-time Intelligence Metrics (dashboard)
CREATE TABLE IF NOT EXISTS "IntelligenceMetrics" (
  "id" TEXT PRIMARY KEY,
  "date" DATE NOT NULL,
  "semanticCacheHitRate" DECIMAL(5,4),
  "voiceMatchAccuracy" DECIMAL(5,4),
  "predictionAccuracy" DECIMAL(5,4),
  "anomalyDetectionRate" DECIMAL(5,4),
  "avgProcessingTimeMs" INTEGER,
  "totalRequests" INTEGER,
  "totalCostSavings" DECIMAL(10,2),
  "mlModelVersion" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_intelligence_metrics_date" ON "IntelligenceMetrics"("date");

-- 10. Background Job Queue (for predictive pre-generation)
CREATE TABLE IF NOT EXISTS "BackgroundJob" (
  "id" TEXT PRIMARY KEY,
  "jobType" TEXT NOT NULL CHECK ("jobType" IN ('pregenerate-audio', 'train-ml-model', 'optimize-cache', 'analyze-patterns')),
  "priority" INTEGER DEFAULT 5 CHECK ("priority" BETWEEN 1 AND 10),
  "status" TEXT NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'processing', 'completed', 'failed')),
  "payload" JSONB NOT NULL,
  "result" JSONB,
  "error" TEXT,
  "attempts" INTEGER DEFAULT 0,
  "maxAttempts" INTEGER DEFAULT 3,
  "scheduledFor" TIMESTAMP,
  "startedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_background_jobs_status" ON "BackgroundJob"("status", "scheduledFor");
CREATE INDEX IF NOT EXISTS "idx_background_jobs_priority" ON "BackgroundJob"("priority", "status");

-- VERIFICATION QUERIES

-- Check if enhancements are applied
SELECT 
  'AudioAsset' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'AudioAsset'
  AND column_name IN ('semanticHash', 'embedding', 'contentType', 'emotionalTone', 'complexity')
ORDER BY column_name;

-- Verify new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'UserReadingSession',
    'UserFeedback',
    'QualityABTest',
    'MLModelInsight',
    'PredictionHistory',
    'VoicePerformance',
    'IntelligenceMetrics',
    'BackgroundJob'
  )
ORDER BY table_name;

-- SAMPLE DATA FOR TESTING

-- Insert sample voice performance data
INSERT INTO "VoicePerformance" (
  "id",
  "voiceId",
  "provider",
  "contentType",
  "targetAudience",
  "totalUsages",
  "avgUserRating",
  "avgCompletionRate",
  "avgLoadTime",
  "costPerGeneration"
) VALUES
  (gen_random_uuid()::text, '21m00Tcm4TlvDq8ikWAM', 'elevenlabs', 'narrative', 'adult', 1200, 4.7, 94.5, 2.3, 0.0003),
  (gen_random_uuid()::text, 'alloy', 'openai', 'technical', 'adult', 800, 4.2, 89.0, 3.1, 0.000015),
  (gen_random_uuid()::text, 'onyx', 'openai', 'narrative', 'adult', 600, 4.5, 92.0, 2.9, 0.000015)
ON CONFLICT DO NOTHING;

-- Insert sample intelligence metrics
INSERT INTO "IntelligenceMetrics" (
  "id",
  "date",
  "semanticCacheHitRate",
  "voiceMatchAccuracy",
  "predictionAccuracy",
  "anomalyDetectionRate",
  "avgProcessingTimeMs",
  "totalRequests",
  "totalCostSavings"
) VALUES
  (gen_random_uuid()::text, CURRENT_DATE, 0.85, 0.87, 0.78, 0.02, 1250, 5000, 450.00)
ON CONFLICT DO NOTHING;

COMMIT;
