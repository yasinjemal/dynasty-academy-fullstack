// 🧠 CONTEXTUAL INTELLIGENCE ENGINE
// World's First Multi-Layer Reading Intelligence System
// This system learns from every user action and predicts their needs

import { prisma } from "@/lib/db/prisma";

// ============================================================================
// LAYER 1: BEHAVIOR PATTERN RECOGNITION
// ============================================================================

export interface ReadingBehavior {
  userId: string;
  bookId: string;
  chapterId: number;
  timestamp: Date;

  // Reading Metrics
  readingSpeed: number; // words per minute
  pauseCount: number;
  pauseDuration: number; // total seconds paused
  rereadCount: number; // how many times re-read same section
  scrollbackCount: number; // how many times scrolled back

  // Engagement Signals
  playbackSpeedChanges: number;
  atmosphereChanges: number;
  bookmarksCreated: number;
  notesCreated: number;

  // Context
  timeOfDay: string; // morning/afternoon/evening/night
  dayOfWeek: string;
  sessionDuration: number; // seconds

  // Completion
  completed: boolean;
  completionPercentage: number;
}

export interface BehaviorPattern {
  userId: string;

  // Optimal Reading Windows
  peakFocusTimes: string[]; // ["evening", "night"]
  bestDaysToRead: string[]; // ["Sunday", "Saturday"]
  averageSessionLength: number; // minutes

  // Reading Style
  preferredSpeed: number; // 0.85, 1.0, 1.5, etc.
  pauseFrequency: "low" | "medium" | "high";
  rereadFrequency: "low" | "medium" | "high";

  // Engagement Patterns
  highEngagementIndicators: string[];
  lowEngagementIndicators: string[];

  // Predictions
  likelyToCompleteBooks: boolean;
  averageCompletionRate: number;
  optimalChapterLength: number; // minutes
}

/**
 * Track user reading behavior in real-time
 */
export async function trackReadingBehavior(behavior: ReadingBehavior) {
  try {
    // Store raw behavior data
    await prisma.readingBehavior.create({
      data: {
        userId: behavior.userId,
        bookId: behavior.bookId,
        chapterId: behavior.chapterId,

        // Metrics
        readingSpeed: behavior.readingSpeed,
        pauseCount: behavior.pauseCount,
        pauseDuration: behavior.pauseDuration,
        rereadCount: behavior.rereadCount,
        scrollbackCount: behavior.scrollbackCount,

        playbackSpeedChanges: behavior.playbackSpeedChanges,
        atmosphereChanges: behavior.atmosphereChanges,
        bookmarksCreated: behavior.bookmarksCreated,
        notesCreated: behavior.notesCreated,

        // Context
        timeOfDay: behavior.timeOfDay,
        dayOfWeek: behavior.dayOfWeek,
        sessionDuration: behavior.sessionDuration,

        // Completion
        completed: behavior.completed,
        completionPercentage: behavior.completionPercentage,
      },
    });

    console.log("✅ [Intelligence] Behavior tracked:", behavior.userId);

    // Async: Update user patterns
    updateBehaviorPatterns(behavior.userId).catch(console.error);

    return { success: true };
  } catch (error) {
    console.error("❌ [Intelligence] Failed to track behavior:", error);
    return { success: false, error };
  }
}

/**
 * Analyze user behavior and extract patterns
 */
export async function analyzeBehaviorPatterns(
  userId: string
): Promise<BehaviorPattern | null> {
  try {
    // Get all user behavior data
    const behaviors = await prisma.readingBehavior.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: 100, // Last 100 sessions
    });

    if (behaviors.length === 0) return null;

    // ALGORITHM 1: Find Peak Focus Times
    const timeOfDayMap = new Map<string, number>();
    const dayOfWeekMap = new Map<string, number>();

    behaviors.forEach((b) => {
      // Weight by completion and engagement
      const weight = b.completionPercentage / 100;

      timeOfDayMap.set(
        b.timeOfDay,
        (timeOfDayMap.get(b.timeOfDay) || 0) + weight
      );

      dayOfWeekMap.set(
        b.dayOfWeek,
        (dayOfWeekMap.get(b.dayOfWeek) || 0) + weight
      );
    });

    const peakFocusTimes = Array.from(timeOfDayMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([time]) => time);

    const bestDaysToRead = Array.from(dayOfWeekMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([day]) => day);

    // ALGORITHM 2: Calculate Reading Style
    const avgSpeed =
      behaviors.reduce((sum, b) => sum + b.readingSpeed, 0) / behaviors.length;

    const avgPauses =
      behaviors.reduce((sum, b) => sum + b.pauseCount, 0) / behaviors.length;

    const avgRereads =
      behaviors.reduce((sum, b) => sum + b.rereadCount, 0) / behaviors.length;

    const pauseFrequency: "low" | "medium" | "high" =
      avgPauses < 3 ? "low" : avgPauses < 8 ? "medium" : "high";

    const rereadFrequency: "low" | "medium" | "high" =
      avgRereads < 2 ? "low" : avgRereads < 5 ? "medium" : "high";

    // ALGORITHM 3: Identify Engagement Indicators
    const highEngagement = behaviors.filter(
      (b) => b.completionPercentage > 80 && b.bookmarksCreated > 0
    );
    const lowEngagement = behaviors.filter(
      (b) => b.completionPercentage < 30 && b.pauseCount > 10
    );

    const highEngagementIndicators: string[] = [];
    const lowEngagementIndicators: string[] = [];

    // What causes high engagement?
    if (highEngagement.length > 0) {
      const avgHighSpeed =
        highEngagement.reduce((sum, b) => sum + b.readingSpeed, 0) /
        highEngagement.length;
      if (avgHighSpeed > 150) {
        highEngagementIndicators.push("fast-reading");
      }
      const avgHighAtmosphere =
        highEngagement.reduce((sum, b) => sum + b.atmosphereChanges, 0) /
        highEngagement.length;
      if (avgHighAtmosphere > 2) {
        highEngagementIndicators.push("atmosphere-switching");
      }
    }

    // What causes low engagement?
    if (lowEngagement.length > 0) {
      const avgLowPauses =
        lowEngagement.reduce((sum, b) => sum + b.pauseCount, 0) /
        lowEngagement.length;
      if (avgLowPauses > 15) {
        lowEngagementIndicators.push("too-many-pauses");
      }
      const avgLowScrollback =
        lowEngagement.reduce((sum, b) => sum + b.scrollbackCount, 0) /
        lowEngagement.length;
      if (avgLowScrollback > 5) {
        lowEngagementIndicators.push("confusion-scrollback");
      }
    }

    // ALGORITHM 4: Predict Completion
    const completedBooks = behaviors.filter((b) => b.completed);
    const completionRate = completedBooks.length / behaviors.length;
    const likelyToCompleteBooks = completionRate > 0.6;

    // ALGORITHM 5: Optimal Session Length
    const avgSessionLength =
      behaviors.reduce((sum, b) => sum + b.sessionDuration, 0) /
      behaviors.length /
      60; // Convert to minutes

    const pattern: BehaviorPattern = {
      userId,
      peakFocusTimes,
      bestDaysToRead,
      averageSessionLength: Math.round(avgSessionLength),
      preferredSpeed: Number(avgSpeed.toFixed(2)),
      pauseFrequency,
      rereadFrequency,
      highEngagementIndicators,
      lowEngagementIndicators,
      likelyToCompleteBooks,
      averageCompletionRate: Number((completionRate * 100).toFixed(1)),
      optimalChapterLength: Math.round(avgSessionLength * 0.8), // Slightly shorter than avg session
    };

    console.log("🧠 [Intelligence] Pattern analyzed:", pattern);

    return pattern;
  } catch (error) {
    console.error("❌ [Intelligence] Pattern analysis failed:", error);
    return null;
  }
}

/**
 * Update user's behavior patterns (runs async after tracking)
 */
async function updateBehaviorPatterns(userId: string) {
  const pattern = await analyzeBehaviorPatterns(userId);

  if (pattern) {
    // Store in database for quick access
    await prisma.userBehaviorPattern.upsert({
      where: { userId },
      create: {
        userId,
        ...pattern,
      },
      update: {
        ...pattern,
        updatedAt: new Date(),
      },
    });
  }
}

// ============================================================================
// LAYER 2: CONTENT COMPLEXITY ANALYSIS
// ============================================================================

export interface ContentComplexity {
  chapterId: number;
  bookId: string;

  // Complexity Metrics
  avgSentenceLength: number;
  vocabularyDensity: number; // unique words / total words
  readingLevel: number; // 1-12 (grade level)
  conceptDensity: "low" | "medium" | "high";

  // Difficulty Indicators
  technicalTermsCount: number;
  abstractConceptsCount: number;

  // Recommendations
  recommendedSpeed: number;
  recommendedBreaks: number; // per 10 minutes
  estimatedCognitiveLoad: "light" | "moderate" | "heavy";
}

/**
 * Analyze content complexity using NLP
 */
export async function analyzeContentComplexity(
  bookId: string,
  chapterId: number,
  content: string
): Promise<ContentComplexity> {
  // Split into sentences
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  // Calculate average sentence length
  const words = content.split(/\s+/).filter((w) => w.length > 0);
  const avgSentenceLength = words.length / sentences.length;

  // Calculate vocabulary density
  const uniqueWords = new Set(
    words.map((w) => w.toLowerCase().replace(/[^a-z]/g, ""))
  );
  const vocabularyDensity = uniqueWords.size / words.length;

  // Estimate reading level (Flesch-Kincaid approximation)
  const syllableCount = words.reduce((sum, word) => {
    return sum + countSyllables(word);
  }, 0);

  const readingLevel = Math.max(
    1,
    Math.min(
      12,
      0.39 * (words.length / sentences.length) +
        11.8 * (syllableCount / words.length) -
        15.59
    )
  );

  // Detect technical terms (words > 12 letters or specialized patterns)
  const technicalTermsCount = words.filter(
    (w) => w.length > 12 || /tion$|ism$|ology$/.test(w)
  ).length;

  // Detect abstract concepts (words like "consciousness", "paradigm", etc.)
  const abstractWords = [
    "consciousness",
    "paradigm",
    "framework",
    "methodology",
    "philosophy",
    "concept",
    "theory",
  ];
  const abstractConceptsCount = words.filter((w) =>
    abstractWords.some((abs) => w.toLowerCase().includes(abs))
  ).length;

  // Determine concept density
  const conceptDensity: "low" | "medium" | "high" =
    technicalTermsCount + abstractConceptsCount < 10
      ? "low"
      : technicalTermsCount + abstractConceptsCount < 30
      ? "medium"
      : "high";

  // Recommendations based on complexity
  const recommendedSpeed =
    readingLevel < 6 ? 1.25 : readingLevel < 10 ? 1.0 : 0.85;

  const recommendedBreaks =
    conceptDensity === "heavy" ? 3 : conceptDensity === "moderate" ? 2 : 1;

  const estimatedCognitiveLoad: "light" | "moderate" | "heavy" =
    readingLevel < 7 && conceptDensity === "low"
      ? "light"
      : readingLevel > 10 || conceptDensity === "high"
      ? "heavy"
      : "moderate";

  const complexity: ContentComplexity = {
    chapterId,
    bookId,
    avgSentenceLength: Number(avgSentenceLength.toFixed(1)),
    vocabularyDensity: Number(vocabularyDensity.toFixed(3)),
    readingLevel: Number(readingLevel.toFixed(1)),
    conceptDensity,
    technicalTermsCount,
    abstractConceptsCount,
    recommendedSpeed,
    recommendedBreaks,
    estimatedCognitiveLoad,
  };

  // Store in database
  await prisma.contentComplexity.upsert({
    where: {
      bookId_chapterId: {
        bookId,
        chapterId,
      },
    },
    create: complexity,
    update: complexity,
  });

  console.log("📊 [Intelligence] Content analyzed:", complexity);

  return complexity;
}

/**
 * Simple syllable counter (approximation)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;

  const vowels = word.match(/[aeiouy]+/g);
  let count = vowels ? vowels.length : 1;

  // Adjust for silent e
  if (word.endsWith("e")) count--;

  return Math.max(1, count);
}

// ============================================================================
// LAYER 3: PREDICTIVE INTELLIGENCE
// ============================================================================

export interface ReadingPrediction {
  userId: string;

  // Optimal Timing
  nextOptimalReadingTime: Date;
  recommendedSessionDuration: number; // minutes

  // Content Recommendations
  recommendedSpeed: number;
  recommendedAtmosphere: string;
  suggestedBreakInterval: number; // minutes

  // Engagement Prediction
  predictedEngagement: "low" | "medium" | "high";
  completionProbability: number; // 0-100

  // Adaptive Suggestions
  suggestions: string[];
}

/**
 * Generate intelligent predictions for user
 */
export async function generateReadingPredictions(
  userId: string,
  bookId: string,
  chapterId: number
): Promise<ReadingPrediction> {
  // Get user patterns
  const userPattern = await prisma.userBehaviorPattern.findUnique({
    where: { userId },
  });

  // Get content complexity
  const complexity = await prisma.contentComplexity.findUnique({
    where: {
      bookId_chapterId: {
        bookId,
        chapterId,
      },
    },
  });

  // Default predictions
  let prediction: ReadingPrediction = {
    userId,
    nextOptimalReadingTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    recommendedSessionDuration: 30,
    recommendedSpeed: 1.0,
    recommendedAtmosphere: "deep-focus",
    suggestedBreakInterval: 25,
    predictedEngagement: "medium",
    completionProbability: 50,
    suggestions: [],
  };

  // INTELLIGENT PREDICTIONS
  if (userPattern) {
    // Predict next optimal time
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.toLocaleDateString("en-US", { weekday: "long" });

    // Find next peak time
    const peakTime = userPattern.peakFocusTimes[0];
    let nextReadTime = new Date(now);

    if (peakTime === "evening" && currentHour < 18) {
      nextReadTime.setHours(18, 0, 0, 0);
    } else if (peakTime === "night" && currentHour < 21) {
      nextReadTime.setHours(21, 0, 0, 0);
    } else if (peakTime === "morning" && currentHour >= 12) {
      nextReadTime.setDate(nextReadTime.getDate() + 1);
      nextReadTime.setHours(8, 0, 0, 0);
    } else {
      nextReadTime.setDate(nextReadTime.getDate() + 1);
      nextReadTime.setHours(18, 0, 0, 0);
    }

    prediction.nextOptimalReadingTime = nextReadTime;
    prediction.recommendedSessionDuration = userPattern.averageSessionLength;
    prediction.recommendedSpeed = userPattern.preferredSpeed;

    // Predict engagement
    const isOptimalTime = userPattern.peakFocusTimes.some((time) => {
      if (time === "morning" && currentHour >= 6 && currentHour < 12)
        return true;
      if (time === "afternoon" && currentHour >= 12 && currentHour < 18)
        return true;
      if (time === "evening" && currentHour >= 18 && currentHour < 21)
        return true;
      if (time === "night" && currentHour >= 21) return true;
      return false;
    });

    const isOptimalDay = userPattern.bestDaysToRead.includes(currentDay);

    prediction.predictedEngagement =
      isOptimalTime && isOptimalDay
        ? "high"
        : isOptimalTime || isOptimalDay
        ? "medium"
        : "low";

    prediction.completionProbability = userPattern.averageCompletionRate;
  }

  // Adjust based on content complexity
  if (complexity) {
    prediction.recommendedSpeed = Math.min(
      prediction.recommendedSpeed,
      complexity.recommendedSpeed
    );

    prediction.suggestedBreakInterval =
      complexity.estimatedCognitiveLoad === "heavy"
        ? 20
        : complexity.estimatedCognitiveLoad === "moderate"
        ? 25
        : 30;

    // Generate suggestions
    if (complexity.estimatedCognitiveLoad === "heavy") {
      prediction.suggestions.push(
        "This chapter is complex - consider slower speed and more breaks"
      );
    }

    if (complexity.readingLevel > 10) {
      prediction.suggestions.push(
        "Advanced content detected - use bookmarks for key concepts"
      );
    }
  }

  // More intelligent suggestions
  if (userPattern) {
    if (userPattern.pauseFrequency === "high") {
      prediction.suggestions.push(
        "You tend to pause often - try 'Focus Mode' to minimize distractions"
      );
    }

    if (userPattern.rereadFrequency === "high") {
      prediction.suggestions.push(
        "You often re-read - AI Study Buddy can help clarify as you go"
      );
    }

    if (prediction.predictedEngagement === "low") {
      prediction.suggestions.push(
        `Better time to read: ${userPattern.peakFocusTimes[0]} on ${userPattern.bestDaysToRead[0]}`
      );
    }
  }

  console.log("🔮 [Intelligence] Predictions generated:", prediction);

  return prediction;
}

// ============================================================================
// EXPORT: Main Intelligence API
// ============================================================================

export const ContextualIntelligence = {
  trackBehavior: trackReadingBehavior,
  analyzePatterns: analyzeBehaviorPatterns,
  analyzeContent: analyzeContentComplexity,
  predict: generateReadingPredictions,
};
