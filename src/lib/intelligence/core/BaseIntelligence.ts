// 🧠 BASE INTELLIGENCE ENGINE
// Abstract class that all feature-specific intelligence extends

import { prisma } from "@/lib/db/prisma";
import {
  BasePrediction,
  AdvancedPrediction,
  IntelligenceContext,
  BehaviorData,
  UserPattern,
  CircadianAnalysis,
  CognitiveAnalysis,
  MomentumAnalysis,
  AtmosphereAnalysis,
  IntelligenceConfig,
  PredictionOptions,
  FeatureType,
} from "./types";

/**
 * Abstract base class for all intelligence engines
 * Provides common algorithms and utilities
 */
export abstract class BaseIntelligence {
  protected config: IntelligenceConfig;

  constructor(config?: Partial<IntelligenceConfig>) {
    this.config = {
      algorithms: {
        circadian: { enabled: true, weight: 0.3 },
        cognitive: { enabled: true, weight: 0.25 },
        momentum: { enabled: true, weight: 0.25 },
        atmosphere: { enabled: true, weight: 0.1 },
        suggestions: { enabled: true, weight: 0.1 },
      },
      fallbackMode: "graceful",
      cacheEnabled: false,
      cacheDuration: 300,
      ...config,
    };
  }

  /**
   * Abstract method - must be implemented by feature-specific classes
   */
  abstract predict(
    context: IntelligenceContext,
    options?: PredictionOptions
  ): Promise<BasePrediction | AdvancedPrediction>;

  // ==================== ALGORITHM #1: CIRCADIAN RHYTHM ====================

  /**
   * Analyze circadian rhythm for optimal timing
   * REUSABLE across all features
   */
  protected analyzeCircadianRhythm(
    hour: number = new Date().getHours(),
    dayOfWeek: number = new Date().getDay()
  ): CircadianAnalysis {
    let focusLevel = 0.5;
    let energyLevel = 0.5;
    let optimalFor = "light tasks";
    let peakWindow: CircadianAnalysis["peakWindow"] = "afternoon-dip";

    // Morning peak (9-11 AM)
    if (hour >= 9 && hour <= 11) {
      focusLevel = 0.9;
      energyLevel = 0.9;
      optimalFor = "deep work";
      peakWindow = "morning-peak";
    }
    // Afternoon dip (2-4 PM)
    else if (hour >= 14 && hour <= 16) {
      focusLevel = 0.6;
      energyLevel = 0.7;
      optimalFor = "light tasks";
      peakWindow = "afternoon-dip";
    }
    // Evening flow (7-10 PM)
    else if (hour >= 19 && hour <= 22) {
      focusLevel = 0.8;
      energyLevel = 0.75;
      optimalFor = "creative work";
      peakWindow = "evening-flow";
    }
    // Night owl (11 PM+)
    else if (hour >= 23 || hour <= 6) {
      focusLevel = 0.7;
      energyLevel = 0.6;
      optimalFor = "reflection";
      peakWindow = "night-owl";
    }
    // Mid-morning (7-9 AM)
    else if (hour >= 7 && hour < 9) {
      focusLevel = 0.75;
      energyLevel = 0.8;
      optimalFor = "routine tasks";
    }
    // Late morning (11 AM-2 PM)
    else if (hour > 11 && hour < 14) {
      focusLevel = 0.8;
      energyLevel = 0.85;
      optimalFor = "deep work";
    }

    // Weekend adjustment
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      energyLevel *= 0.9; // Slightly lower urgency
      focusLevel *= 0.95;
    }

    return {
      currentHour: hour,
      dayOfWeek,
      focusLevel,
      energyLevel,
      optimalFor,
      peakWindow,
    };
  }

  // ==================== ALGORITHM #2: COGNITIVE LOAD ====================

  /**
   * Analyze cognitive load based on content complexity
   * REUSABLE across all features
   */
  protected analyzeCognitiveLoad(
    complexityScore: number, // 0-100
    userLevel: number = 50 // 0-100, user's expertise
  ): CognitiveAnalysis {
    // Adjust complexity based on user level
    const perceivedComplexity = Math.max(0, complexityScore - userLevel * 0.3);

    let load: CognitiveAnalysis["load"];
    let difficulty: CognitiveAnalysis["difficulty"];
    let recommendedSpeed = 1.0;
    let breakFrequency = 25; // Pomodoro default

    if (perceivedComplexity < 30) {
      load = "light";
      difficulty = "easy";
      recommendedSpeed = 1.2;
      breakFrequency = 30;
    } else if (perceivedComplexity < 60) {
      load = "moderate";
      difficulty = "moderate";
      recommendedSpeed = 1.0;
      breakFrequency = 25;
    } else if (perceivedComplexity < 80) {
      load = "heavy";
      difficulty = "challenging";
      recommendedSpeed = 0.9;
      breakFrequency = 20;
    } else {
      load = "heavy";
      difficulty = "expert";
      recommendedSpeed = 0.8;
      breakFrequency = 15;
    }

    return {
      load,
      loadScore: Math.round(perceivedComplexity),
      recommendedSpeed,
      breakFrequency,
      difficulty,
    };
  }

  // ==================== ALGORITHM #3: MOMENTUM ====================

  /**
   * Analyze user momentum and streaks
   * REUSABLE across all features
   */
  protected async analyzeMomentum(
    userId: string,
    featureType: FeatureType,
    timeWindow: number = 30 // days
  ): Promise<MomentumAnalysis> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeWindow);

      // Get recent activity for this feature
      const activities = await prisma.dynastyActivity.findMany({
        where: {
          userId,
          action: this.getActionForFeature(featureType),
          createdAt: { gte: cutoffDate },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      if (activities.length === 0) {
        return {
          momentumScore: 0.1,
          streakDays: 0,
          completionProbability: 50,
          streakBonus: 0,
          trendDirection: "stable",
        };
      }

      // Calculate streak
      const streakDays = this.calculateStreak(activities);

      // Calculate completion rate
      const completed = activities.filter(
        (a: any) => a.metadata && (a.metadata as any).completed
      ).length;
      const completionRate = completed / activities.length;

      // Calculate recent engagement (last 7 days)
      const recentActivities = activities.filter((a: any) => {
        const daysDiff = Math.floor(
          (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysDiff <= 7;
      });
      const recentEngagement = recentActivities.length / 7; // avg per day

      // Momentum score (0-1.0)
      const momentumScore = Math.min(
        1.0,
        streakDays * 0.05 + // Streak contribution
          completionRate * 0.4 + // Completion contribution
          recentEngagement * 0.1 + // Recent activity
          0.1 // Base momentum
      );

      // Completion probability
      const completionProbability = Math.round(
        completionRate * 60 + // Past behavior
          momentumScore * 30 + // Current momentum
          10 // Base probability
      );

      // Streak bonus
      const streakBonus = Math.min(50, streakDays * 5); // 5% per day, max 50%

      // Trend direction
      const oldActivities = activities.slice(Math.floor(activities.length / 2));
      const newActivities = activities.slice(
        0,
        Math.floor(activities.length / 2)
      );
      const trendDirection =
        newActivities.length > oldActivities.length * 1.2
          ? "increasing"
          : newActivities.length < oldActivities.length * 0.8
          ? "decreasing"
          : "stable";

      return {
        momentumScore,
        streakDays,
        completionProbability,
        streakBonus,
        trendDirection,
      };
    } catch (error) {
      console.log("[Momentum] Fallback - no DB data");
      return {
        momentumScore: 0.5,
        streakDays: 0,
        completionProbability: 60,
        streakBonus: 0,
        trendDirection: "stable",
      };
    }
  }

  // ==================== ALGORITHM #4: ATMOSPHERE MATCHING ====================

  /**
   * Match optimal atmosphere to user state
   * REUSABLE across all features
   */
  protected selectOptimalAtmosphere(
    focusLevel: number,
    energyLevel: number,
    cognitiveLoad: "light" | "moderate" | "heavy",
    hour: number
  ): AtmosphereAnalysis {
    let atmosphere = "focus";
    let reason = "Balanced state";
    const alternatives: string[] = [];

    // High focus + High energy → Energetic
    if (focusLevel > 0.8 && energyLevel > 0.8) {
      atmosphere = "energetic";
      reason = "Peak performance state";
      alternatives.push("focus", "ambient");
    }
    // Low focus + Low energy → Calm
    else if (focusLevel < 0.6 && energyLevel < 0.6) {
      atmosphere = "calm";
      reason = "Low energy period - gentle approach";
      alternatives.push("ambient", "nature");
    }
    // Heavy cognitive load → Focus
    else if (cognitiveLoad === "heavy") {
      atmosphere = "focus";
      reason = "Complex content requires concentration";
      alternatives.push("calm", "binaural");
    }
    // Light cognitive load → Ambient
    else if (cognitiveLoad === "light") {
      atmosphere = "ambient";
      reason = "Light content allows relaxed environment";
      alternatives.push("nature", "lofi");
    }
    // Night hours → Calm
    else if (hour >= 22 || hour <= 6) {
      atmosphere = "calm";
      reason = "Late hours - avoid overstimulation";
      alternatives.push("ambient", "sleep");
    }

    // Calculate match score
    const atmosphereMatch = Math.round(
      focusLevel * 40 +
        energyLevel * 30 +
        (cognitiveLoad === "moderate" ? 30 : 20)
    );

    return {
      recommendedAtmosphere: atmosphere,
      atmosphereMatch,
      reason,
      alternatives,
    };
  }

  // ==================== ALGORITHM #5: ADAPTIVE SUGGESTIONS ====================

  /**
   * Generate contextual suggestions
   * REUSABLE across all features
   */
  protected generateAdaptiveSuggestions(
    circadian: CircadianAnalysis,
    momentum: MomentumAnalysis,
    cognitive: CognitiveAnalysis,
    context: string = "general"
  ): string[] {
    const suggestions: string[] = [];

    // Circadian-based suggestions
    if (circadian.focusLevel > 0.85) {
      suggestions.push(
        `You're in ${circadian.peakWindow.replace(
          "-",
          " "
        )} - perfect time for ${circadian.optimalFor}`
      );
    } else if (circadian.focusLevel < 0.6) {
      suggestions.push(
        `Energy is lower now - consider light activities or take a break`
      );
    }

    // Momentum-based suggestions
    if (momentum.streakDays > 0) {
      suggestions.push(
        `${momentum.streakDays}-day streak active! Keep the momentum going`
      );
    }
    if (momentum.momentumScore > 0.8) {
      suggestions.push(
        `You're on a roll! Completion probability: ${momentum.completionProbability}%`
      );
    }

    // Cognitive load suggestions
    if (cognitive.load === "heavy") {
      suggestions.push(
        `This is challenging content - take ${cognitive.breakFrequency}min breaks`
      );
    } else if (cognitive.load === "light") {
      suggestions.push(
        `Easy content - consider increasing pace to ${cognitive.recommendedSpeed}x`
      );
    }

    // Optimal session suggestions
    const optimalLength = Math.round(
      circadian.focusLevel * 45 + momentum.momentumScore * 15
    );
    suggestions.push(
      `Optimal session: ${optimalLength} minutes based on your rhythm`
    );

    return suggestions.slice(0, 5); // Max 5 suggestions
  }

  // ==================== HELPER METHODS ====================

  /**
   * Calculate consecutive day streak
   */
  private calculateStreak(activities: any[]): number {
    if (activities.length === 0) return 0;

    const dates = activities
      .map((a: any) => new Date(a.createdAt).toDateString())
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    let currentDate = new Date();

    for (const dateStr of dates) {
      const activityDate = new Date(dateStr);
      const daysDiff = Math.floor(
        (currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  }

  /**
   * Map feature type to activity action
   */
  private getActionForFeature(featureType: FeatureType): string {
    const mapping: Record<FeatureType, string> = {
      BOOK: "LISTENING_SESSION",
      COURSE: "COURSE_LESSON",
      COMMUNITY: "COMMUNITY_POST",
      FORUM: "FORUM_REPLY",
      WORKOUT: "WORKOUT_SESSION",
      MEDITATION: "MEDITATION_SESSION",
      CUSTOM: "CUSTOM_ACTIVITY",
    };
    return mapping[featureType] || "CUSTOM_ACTIVITY";
  }

  // ==================== UNIVERSAL TRACKING ====================

  /**
   * Track behavior for any feature
   */
  static async trackBehavior(data: BehaviorData): Promise<void> {
    try {
      await prisma.dynastyActivity.create({
        data: {
          userId: data.userId,
          action: data.activityType,
          points: data.completed ? 5 : 2,
          metadata: {
            entityId: data.entityId,
            entitySubId: data.entitySubId,
            sessionDuration: data.sessionDuration,
            completed: data.completed,
            pauseCount: data.pauseCount || 0,
            pauseDuration: data.pauseDuration || 0,
            speedChanges: data.speedChanges || 0,
            atmosphereChanges: data.atmosphereChanges || 0,
            interactionCount: data.interactionCount || 0,
            qualityScore: data.qualityScore,
            satisfactionRating: data.satisfactionRating,
            ...data.metadata,
            timestamp: data.timestamp || new Date().toISOString(),
          },
        },
      });

      console.log(`[Intelligence] Tracked ${data.activityType}:`, {
        user: data.userId.slice(0, 8),
        entity: data.entityId,
        duration: `${Math.floor(data.sessionDuration / 60)}min`,
        completed: data.completed,
      });
    } catch (error) {
      console.error("[Intelligence] Tracking error:", error);
      // Graceful degradation - don't fail if tracking fails
    }
  }

  /**
   * Get user pattern for any feature
   */
  protected async getUserPattern(
    userId: string,
    featureType: FeatureType
  ): Promise<UserPattern> {
    try {
      const sessions = await prisma.dynastyActivity.findMany({
        where: {
          userId,
          action: this.getActionForFeature(featureType),
        },
        take: 50,
        orderBy: { createdAt: "desc" },
      });

      if (sessions.length === 0) {
        return {
          peakFocusTimes: [],
          avgSessionLength: 25,
          preferredSpeed: 1.0,
          completionRate: 0.5,
          totalSessions: 0,
        };
      }

      const completed = sessions.filter(
        (s: any) => s.metadata && (s.metadata as any).completed
      ).length;
      const avgDuration =
        sessions.reduce(
          (sum: number, s: any) => sum + ((s.metadata as any)?.duration || 0),
          0
        ) / sessions.length;

      return {
        peakFocusTimes: [],
        avgSessionLength: avgDuration,
        preferredSpeed: 1.0,
        completionRate: completed / sessions.length,
        totalSessions: sessions.length,
      };
    } catch (error) {
      console.log("[Intelligence] Pattern fallback - no DB");
      return {
        peakFocusTimes: [],
        avgSessionLength: 25,
        preferredSpeed: 1.0,
        completionRate: 0.5,
        totalSessions: 0,
      };
    }
  }
}
