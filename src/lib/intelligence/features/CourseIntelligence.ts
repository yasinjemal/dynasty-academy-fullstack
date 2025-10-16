// 🎓 COURSE INTELLIGENCE
// Feature-specific implementation for online courses

import { BaseIntelligence } from "../core/BaseIntelligence";
import {
  CoursePrediction,
  CourseContext,
  IntelligenceContext,
  PredictionOptions,
} from "../core/types";

/**
 * Course-specific intelligence engine
 * Extends BaseIntelligence with course learning optimizations
 */
export class CourseIntelligence extends BaseIntelligence {
  /**
   * Generate learning predictions for a course lesson
   */
  async predict(
    context: IntelligenceContext,
    options?: PredictionOptions
  ): Promise<CoursePrediction> {
    const courseContext = context as CourseContext;
    const userId = courseContext.userId;
    const lessonId = courseContext.entitySubId as number;
    const courseLevel = courseContext.metadata?.courseLevel || "intermediate";

    // Get current time context
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    // Run algorithms (reusing from base!)
    const circadian = this.analyzeCircadianRhythm(hour, dayOfWeek);

    // Lesson complexity based on course level
    const lessonComplexity = this.estimateLessonComplexity(
      lessonId,
      courseLevel,
      courseContext.metadata?.totalLessons
    );
    const cognitive = this.analyzeCognitiveLoad(lessonComplexity);

    const momentum = await this.analyzeMomentum(userId, "COURSE");

    const atmosphere = this.selectOptimalAtmosphere(
      circadian.focusLevel,
      circadian.energyLevel,
      cognitive.load,
      hour
    );

    // Course-specific suggestions
    const suggestions = this.generateCourseSuggestions(
      circadian,
      momentum,
      cognitive,
      lessonId,
      courseLevel
    );

    // Calculate engagement
    const engagementScore =
      circadian.focusLevel * 0.4 +
      momentum.momentumScore * 0.3 +
      (cognitive.load === "moderate"
        ? 0.85
        : cognitive.load === "light"
        ? 0.75
        : 0.65) *
        0.3;

    const predictedEngagement: "low" | "medium" | "high" =
      engagementScore > 0.75
        ? "high"
        : engagementScore > 0.55
        ? "medium"
        : "low";

    // Estimate completion time (lessons typically shorter than book chapters)
    const estimatedCompletionTime = Math.round(
      cognitive.breakFrequency *
        (cognitive.load === "heavy"
          ? 2
          : cognitive.load === "moderate"
          ? 1.5
          : 1)
    );

    // Determine lesson difficulty
    const lessonDifficulty: CoursePrediction["lessonDifficulty"] =
      courseLevel === "beginner"
        ? "beginner"
        : courseLevel === "intermediate"
        ? "intermediate"
        : courseLevel === "advanced"
        ? "advanced"
        : "expert";

    // Check prerequisites (simplified - would check actual course structure)
    const prerequisitesMet =
      lessonId === 1 || momentum.completionProbability > 60;

    // Recommended study time
    const recommendedStudyTime =
      circadian.peakWindow === "morning-peak"
        ? "morning"
        : circadian.peakWindow === "evening-flow"
        ? "evening"
        : "afternoon";

    // Build advanced prediction
    return {
      // Base metrics
      predictedEngagement,
      completionProbability: momentum.completionProbability,
      suggestions,
      intelligence: "advanced",
      timestamp: now,

      // Course-specific
      lessonDifficulty,
      estimatedCompletionTime,
      prerequisitesMet,
      recommendedStudyTime,

      // Advanced metrics (reused from base!)
      focusLevel: circadian.focusLevel,
      energyLevel: circadian.energyLevel,
      focusWindowDetected: circadian.peakWindow,
      cognitiveLoad: cognitive.loadScore,
      difficulty: cognitive.difficulty,
      momentumScore: momentum.momentumScore,
      streakDays: momentum.streakDays,
      streakBonus: momentum.streakBonus,
      optimalSessionLength: estimatedCompletionTime,
      recommendedBreakInterval: cognitive.breakFrequency,
      recommendedPace: cognitive.recommendedSpeed,
      retentionScore: Math.round(
        circadian.focusLevel * 40 +
          momentum.momentumScore * 35 +
          (cognitive.load === "moderate" ? 25 : 20)
      ),
      learningEfficiency: Math.round(
        (circadian.focusLevel + momentum.momentumScore) * 50
      ),
      atmosphereMatch: atmosphere.atmosphereMatch,
      recommendedAtmosphere: atmosphere.recommendedAtmosphere,
    };
  }

  /**
   * Estimate lesson complexity based on course level and position
   */
  private estimateLessonComplexity(
    lessonId: number,
    courseLevel: string,
    totalLessons: number = 10
  ): number {
    // Base complexity by course level
    const baseComplexity =
      {
        beginner: 25,
        intermediate: 50,
        advanced: 70,
        expert: 85,
      }[courseLevel] || 50;

    // Progressive difficulty within course
    const progressMultiplier = 1 + (lessonId / totalLessons) * 0.3;

    return Math.min(100, baseComplexity * progressMultiplier);
  }

  /**
   * Generate course-specific suggestions
   */
  private generateCourseSuggestions(
    circadian: any,
    momentum: any,
    cognitive: any,
    lessonId: number,
    courseLevel: string
  ): string[] {
    const suggestions: string[] = [];

    // Circadian suggestions
    if (circadian.focusLevel > 0.85) {
      suggestions.push(
        `Peak learning time - perfect for ${courseLevel} material`
      );
    } else if (circadian.focusLevel < 0.6) {
      suggestions.push("Energy is lower - consider review or lighter lessons");
    }

    // Momentum suggestions
    if (momentum.streakDays > 0) {
      suggestions.push(
        `${momentum.streakDays}-day learning streak! Consistency is key`
      );
    }
    if (momentum.completionProbability > 80) {
      suggestions.push(
        "You're highly likely to finish this lesson - keep going!"
      );
    }

    // Cognitive load suggestions
    if (cognitive.load === "heavy") {
      suggestions.push(
        `Challenging lesson - break it into ${cognitive.breakFrequency}min segments`
      );
    } else if (cognitive.load === "light") {
      suggestions.push("This lesson should be quick - great for review!");
    }

    // Course-specific
    if (lessonId === 1) {
      suggestions.push("First lesson - take time to understand fundamentals");
    }
    if (courseLevel === "expert" && circadian.focusLevel < 0.7) {
      suggestions.push(
        "Expert content needs peak focus - consider scheduling for your morning peak"
      );
    }

    return suggestions.slice(0, 5);
  }
}

// Export singleton instance
export const courseIntelligence = new CourseIntelligence();
