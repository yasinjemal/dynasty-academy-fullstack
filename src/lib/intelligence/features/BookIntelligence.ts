// 📚 BOOK INTELLIGENCE
// Feature-specific implementation for book reading

import { BaseIntelligence } from "../core/BaseIntelligence";
import {
  BookPrediction,
  BookContext,
  IntelligenceContext,
  PredictionOptions,
} from "../core/types";

/**
 * Book-specific intelligence engine
 * Extends BaseIntelligence with book reading optimizations
 */
export class BookIntelligence extends BaseIntelligence {
  /**
   * Generate reading predictions for a book chapter
   */
  async predict(
    context: IntelligenceContext,
    options?: PredictionOptions
  ): Promise<BookPrediction> {
    const bookContext = context as BookContext;
    const userId = bookContext.userId;
    const chapterId = bookContext.entitySubId as number;

    // Get current time context
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    // Run all 5 algorithms
    const circadian = this.analyzeCircadianRhythm(hour, dayOfWeek);

    // Chapter-based complexity (simple heuristic - can be enhanced)
    const chapterComplexity = this.estimateChapterComplexity(
      chapterId,
      bookContext.metadata?.totalChapters
    );
    const cognitive = this.analyzeCognitiveLoad(chapterComplexity);

    const momentum = await this.analyzeMomentum(userId, "BOOK");

    const atmosphere = this.selectOptimalAtmosphere(
      circadian.focusLevel,
      circadian.energyLevel,
      cognitive.load,
      hour
    );

    const suggestions = this.generateAdaptiveSuggestions(
      circadian,
      momentum,
      cognitive,
      "book reading"
    );

    // Calculate engagement (multi-factor)
    const engagementScore =
      circadian.focusLevel * 0.4 +
      momentum.momentumScore * 0.3 +
      (cognitive.load === "moderate"
        ? 0.8
        : cognitive.load === "light"
        ? 0.7
        : 0.6) *
        0.3;

    const predictedEngagement: "low" | "medium" | "high" =
      engagementScore > 0.75
        ? "high"
        : engagementScore > 0.55
        ? "medium"
        : "low";

    // Optimal session length (Pomodoro-inspired but adaptive)
    const optimalSessionLength = Math.round(
      circadian.focusLevel * 45 + momentum.momentumScore * 15
    );

    // Retention score (multi-factor learning efficiency)
    const retentionScore = Math.round(
      circadian.focusLevel * 40 +
        momentum.momentumScore * 30 +
        (cognitive.load === "moderate" ? 30 : 20)
    );

    // Build advanced prediction
    return {
      // Base metrics
      predictedEngagement,
      completionProbability: momentum.completionProbability,
      suggestions,
      intelligence: "advanced",
      timestamp: now,

      // Book-specific
      recommendedSpeed: cognitive.recommendedSpeed,
      recommendedAtmosphere: atmosphere.recommendedAtmosphere,
      suggestedBreakInterval: cognitive.breakFrequency,

      // Advanced metrics
      focusLevel: circadian.focusLevel,
      energyLevel: circadian.energyLevel,
      focusWindowDetected: circadian.peakWindow,
      cognitiveLoad: cognitive.loadScore,
      difficulty: cognitive.difficulty,
      momentumScore: momentum.momentumScore,
      streakDays: momentum.streakDays,
      streakBonus: momentum.streakBonus,
      optimalSessionLength,
      recommendedBreakInterval: cognitive.breakFrequency,
      recommendedPace: cognitive.recommendedSpeed,
      retentionScore,
      learningEfficiency: Math.round(
        (retentionScore + momentum.completionProbability) / 2
      ),
      atmosphereMatch: atmosphere.atmosphereMatch,
    };
  }

  /**
   * Estimate chapter complexity (simple heuristic)
   * Can be enhanced with actual content analysis
   */
  private estimateChapterComplexity(
    chapterId: number,
    totalChapters: number = 10
  ): number {
    // Early chapters: easier (30-40)
    if (chapterId <= 3) {
      return 30 + chapterId * 3;
    }
    // Middle chapters: moderate (50-60)
    else if (chapterId <= Math.floor(totalChapters * 0.7)) {
      return 50 + (chapterId - 3) * 2;
    }
    // Final chapters: harder (70-85)
    else {
      return 70 + (chapterId - Math.floor(totalChapters * 0.7)) * 3;
    }
  }

  /**
   * Generate book-specific suggestions
   */
  private generateBookSuggestions(
    circadian: any,
    momentum: any,
    cognitive: any,
    chapterId: number
  ): string[] {
    const suggestions = this.generateAdaptiveSuggestions(
      circadian,
      momentum,
      cognitive,
      "book reading"
    );

    // Add book-specific suggestions
    if (chapterId === 1) {
      suggestions.push("First chapter - take time to absorb the foundation");
    }
    if (cognitive.load === "heavy" && circadian.focusLevel > 0.8) {
      suggestions.push("Perfect timing for challenging content!");
    }
    if (momentum.streakDays > 7) {
      suggestions.push(
        "7+ day streak! You're building a powerful reading habit"
      );
    }

    return suggestions;
  }
}

// Export singleton instance for easy import
export const bookIntelligence = new BookIntelligence();
