// 🎯 UNIVERSAL INTELLIGENCE TYPES
// Shared across ALL features (Books, Courses, Community, etc.)

// ==================== FEATURE TYPES ====================

export type FeatureType =
  | "BOOK"
  | "COURSE"
  | "COMMUNITY"
  | "FORUM"
  | "WORKOUT"
  | "MEDITATION"
  | "CUSTOM";

export type ActivityType =
  | "READING_SESSION"
  | "LISTENING_SESSION"
  | "COURSE_LESSON"
  | "COMMUNITY_POST"
  | "FORUM_REPLY"
  | "WORKOUT_SESSION"
  | "MEDITATION_SESSION";

// ==================== CORE PREDICTION INTERFACES ====================

/**
 * Base prediction interface - all features inherit this
 */
export interface BasePrediction {
  // Engagement
  predictedEngagement: "low" | "medium" | "high";
  completionProbability: number; // 0-100

  // Suggestions
  suggestions: string[];

  // Metadata
  intelligence: "basic" | "advanced";
  timestamp: Date;
}

/**
 * Extended prediction with advanced metrics
 */
export interface AdvancedPrediction extends BasePrediction {
  // Circadian Rhythm (Algorithm #1)
  focusLevel?: number; // 0-1.0
  energyLevel?: number; // 0-1.0
  focusWindowDetected?: string; // "morning-peak" | "afternoon-dip" | etc.

  // Cognitive Load (Algorithm #2)
  cognitiveLoad?: number; // 0-100
  difficulty?: "easy" | "moderate" | "challenging" | "expert";

  // Momentum (Algorithm #3)
  momentumScore?: number; // 0-1.0
  streakDays?: number;
  streakBonus?: number; // percentage

  // Session Optimization
  optimalSessionLength?: number; // minutes
  recommendedBreakInterval?: number; // minutes
  recommendedPace?: number; // speed multiplier

  // Retention & Learning
  retentionScore?: number; // 0-100
  learningEfficiency?: number; // 0-100

  // Environment
  atmosphereMatch?: number; // 0-100
  recommendedAtmosphere?: string;
}

// ==================== FEATURE-SPECIFIC PREDICTIONS ====================

/**
 * Book Reading Predictions
 */
export interface BookPrediction extends AdvancedPrediction {
  recommendedSpeed: number;
  recommendedAtmosphere: string;
  suggestedBreakInterval: number;
}

/**
 * Course Learning Predictions
 */
export interface CoursePrediction extends AdvancedPrediction {
  lessonDifficulty: "beginner" | "intermediate" | "advanced" | "expert";
  estimatedCompletionTime: number; // minutes
  prerequisitesMet: boolean;
  recommendedStudyTime: string; // "morning" | "afternoon" | "evening"
}

/**
 * Community Engagement Predictions
 */
export interface CommunityPrediction extends BasePrediction {
  bestTimeToPost: string; // hour range
  expectedEngagement: number; // estimated likes/comments
  trendingTopics: string[];
  recommendedContentType: "discussion" | "question" | "share";
}

/**
 * Forum Participation Predictions
 */
export interface ForumPrediction extends BasePrediction {
  replyQualityScore: number; // 0-100
  helpfulnessRating: number; // 0-5
  expertiseLevel: "novice" | "intermediate" | "expert" | "master";
  recommendedThreads: string[];
}

// ==================== CONTEXT TYPES ====================

/**
 * Universal context for predictions
 */
export interface IntelligenceContext {
  userId: string;
  featureType: FeatureType;
  entityId?: string; // bookId, courseId, postId, etc.
  entitySubId?: string | number; // chapterId, lessonId, etc.
  metadata?: Record<string, any>;
}

/**
 * Book-specific context
 */
export interface BookContext extends IntelligenceContext {
  featureType: "BOOK";
  entityId: string; // bookId
  entitySubId: number; // chapterId
  metadata?: {
    totalChapters?: number;
    currentProgress?: number;
    bookComplexity?: "light" | "moderate" | "heavy";
  };
}

/**
 * Course-specific context
 */
export interface CourseContext extends IntelligenceContext {
  featureType: "COURSE";
  entityId: string; // courseId
  entitySubId: number; // lessonId
  metadata?: {
    totalLessons?: number;
    currentProgress?: number;
    courseLevel?: "beginner" | "intermediate" | "advanced";
  };
}

// ==================== BEHAVIOR TRACKING ====================

/**
 * Universal behavior tracking data
 */
export interface BehaviorData {
  userId: string;
  activityType: ActivityType;
  entityId: string;
  entitySubId?: string | number;

  // Session metrics
  sessionDuration: number; // seconds
  completed: boolean;

  // Engagement metrics
  pauseCount?: number;
  pauseDuration?: number; // seconds
  speedChanges?: number;
  atmosphereChanges?: number;
  interactionCount?: number;

  // Quality metrics
  qualityScore?: number; // 0-100
  satisfactionRating?: number; // 1-5

  // Metadata
  metadata?: Record<string, any>;
  timestamp?: Date;
}

// ==================== ALGORITHM OUTPUTS ====================

/**
 * Circadian Rhythm Analysis Output
 */
export interface CircadianAnalysis {
  currentHour: number;
  dayOfWeek: number;
  focusLevel: number; // 0-1.0
  energyLevel: number; // 0-1.0
  optimalFor: string; // "deep work" | "creative work" | "light tasks"
  peakWindow: "morning-peak" | "afternoon-dip" | "evening-flow" | "night-owl";
}

/**
 * Cognitive Load Analysis Output
 */
export interface CognitiveAnalysis {
  load: "light" | "moderate" | "heavy";
  loadScore: number; // 0-100
  recommendedSpeed: number; // 0.5-1.5x
  breakFrequency: number; // minutes
  difficulty: "easy" | "moderate" | "challenging" | "expert";
}

/**
 * Momentum Analysis Output
 */
export interface MomentumAnalysis {
  momentumScore: number; // 0-1.0
  streakDays: number;
  completionProbability: number; // 0-100
  streakBonus: number; // percentage
  trendDirection: "increasing" | "stable" | "decreasing";
}

/**
 * Atmosphere Matching Output
 */
export interface AtmosphereAnalysis {
  recommendedAtmosphere: string;
  atmosphereMatch: number; // 0-100
  reason: string;
  alternatives: string[];
}

// ==================== USER PATTERNS ====================

/**
 * Historical user behavior patterns
 */
export interface UserPattern {
  peakFocusTimes: number[]; // hours [9, 10, 14, 19]
  avgSessionLength: number; // minutes
  preferredSpeed: number; // 0.5-2.0x
  completionRate: number; // 0-1.0
  totalSessions: number;
  lastActiveDate?: Date;
  streakDays?: number;
}

/**
 * Feature-specific user patterns
 */
export interface FeaturePattern extends UserPattern {
  featureType: FeatureType;
  preferredTimes: string[]; // ["morning", "evening"]
  avgQualityScore: number; // 0-100
  expertiseLevel: number; // 0-100
}

// ==================== ALGORITHM INTERFACES ====================

/**
 * Base algorithm interface
 */
export interface IAlgorithm<TInput, TOutput> {
  name: string;
  version: string;
  analyze(input: TInput): TOutput | Promise<TOutput>;
}

/**
 * Circadian Rhythm Algorithm
 */
export interface ICircadianAlgorithm
  extends IAlgorithm<{ hour: number; dayOfWeek: number }, CircadianAnalysis> {}

/**
 * Cognitive Load Algorithm
 */
export interface ICognitiveAlgorithm
  extends IAlgorithm<
    { complexity: number; userLevel: number },
    CognitiveAnalysis
  > {}

/**
 * Momentum Algorithm
 */
export interface IMomentumAlgorithm
  extends IAlgorithm<
    { userId: string; featureType: FeatureType },
    Promise<MomentumAnalysis>
  > {}

// ==================== UTILITY TYPES ====================

/**
 * Algorithm configuration
 */
export interface AlgorithmConfig {
  enabled: boolean;
  weight: number; // 0-1.0, for weighted predictions
  customParams?: Record<string, any>;
}

/**
 * Intelligence engine configuration
 */
export interface IntelligenceConfig {
  algorithms: {
    circadian?: AlgorithmConfig;
    cognitive?: AlgorithmConfig;
    momentum?: AlgorithmConfig;
    atmosphere?: AlgorithmConfig;
    suggestions?: AlgorithmConfig;
  };
  fallbackMode: "graceful" | "strict";
  cacheEnabled: boolean;
  cacheDuration: number; // seconds
}

/**
 * Prediction request options
 */
export interface PredictionOptions {
  includeAdvanced?: boolean;
  algorithmsToUse?: string[];
  forceRefresh?: boolean;
  customWeights?: Record<string, number>;
}

// ==================== EXPORT HELPERS ====================

/**
 * Type guard for checking if prediction has advanced metrics
 */
export function isAdvancedPrediction(
  prediction: BasePrediction | AdvancedPrediction
): prediction is AdvancedPrediction {
  return "cognitiveLoad" in prediction || "focusLevel" in prediction;
}

/**
 * Type guard for feature-specific contexts
 */
export function isBookContext(
  context: IntelligenceContext
): context is BookContext {
  return context.featureType === "BOOK";
}

export function isCourseContext(
  context: IntelligenceContext
): context is CourseContext {
  return context.featureType === "COURSE";
}
