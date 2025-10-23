/**
 * Dynasty Academy Governance: Transparent Course Ranking Algorithm
 *
 * Fairness principles:
 * 1. Multi-factor scoring (quality + engagement + accessibility)
 * 2. Decay function prevents old popular courses from dominating forever
 * 3. New instructor boost gives fair chance to newcomers
 * 4. Transparent weights (no hidden variables)
 *
 * Formula:
 * Score = (Quality * 0.4) + (Engagement * 0.3) + (Accessibility * 0.2) + (Freshness * 0.1)
 */

interface CourseMetrics {
  // Quality signals
  averageRating: number; // 0-5
  totalRatings: number;
  completionRate: number; // 0-100

  // Engagement signals
  enrollmentCount: number;
  activeStudents: number; // last 7 days
  discussionActivity: number; // comments/questions per student

  // Accessibility signals
  isFree: boolean;
  price?: number;
  hasClosedCaptions: boolean;
  multilingualSupport: boolean;

  // Freshness signals
  publishedAt: Date;
  lastUpdatedAt: Date;

  // Instructor signals
  instructorExperience: number; // months since first course
  instructorCourseCount: number;
}

interface RankingResult {
  score: number;
  breakdown: {
    qualityScore: number;
    engagementScore: number;
    accessibilityScore: number;
    freshnessScore: number;
  };
  rank?: number;
}

/**
 * Calculate transparent course ranking score
 */
export function calculateCourseRanking(metrics: CourseMetrics): RankingResult {
  const qualityScore = calculateQualityScore(metrics);
  const engagementScore = calculateEngagementScore(metrics);
  const accessibilityScore = calculateAccessibilityScore(metrics);
  const freshnessScore = calculateFreshnessScore(metrics);

  // Weighted sum (weights add to 1.0)
  const score =
    qualityScore * 0.4 +
    engagementScore * 0.3 +
    accessibilityScore * 0.2 +
    freshnessScore * 0.1;

  return {
    score: Math.round(score * 1000) / 1000, // 3 decimal precision
    breakdown: {
      qualityScore,
      engagementScore,
      accessibilityScore,
      freshnessScore,
    },
  };
}

/**
 * Quality Score (0-100)
 * Combines rating quality, volume, and completion rate
 */
function calculateQualityScore(metrics: CourseMetrics): number {
  // Rating component (0-100)
  const ratingScore = (metrics.averageRating / 5) * 100;

  // Confidence factor based on rating volume
  // Uses Wilson score interval for statistical confidence
  const confidence = wilsonConfidence(metrics.totalRatings);

  // Completion rate component (0-100)
  const completionScore = metrics.completionRate;

  // Weighted average
  const score = ratingScore * confidence * 0.7 + completionScore * 0.3;

  return Math.min(100, Math.max(0, score));
}

/**
 * Wilson confidence score for ratings
 * More ratings = higher confidence in the score
 */
function wilsonConfidence(ratingCount: number): number {
  if (ratingCount === 0) return 0;
  if (ratingCount >= 50) return 1; // Full confidence at 50+ ratings
  return Math.sqrt(ratingCount / 50); // Gradual ramp-up
}

/**
 * Engagement Score (0-100)
 * Measures how actively students interact with content
 */
function calculateEngagementScore(metrics: CourseMetrics): number {
  // Active student ratio (what % of enrolled students are active)
  const activeRatio =
    metrics.enrollmentCount > 0
      ? Math.min(1, metrics.activeStudents / metrics.enrollmentCount)
      : 0;

  // Discussion health (normalized to 0-1)
  // Assumes 0.5 comments per student is "healthy"
  const discussionHealth = Math.min(1, metrics.discussionActivity / 0.5);

  // Enrollment size (log scale to prevent mega-courses from dominating)
  // Assumes 100 enrollments is "good", 1000+ is "excellent"
  const enrollmentScore =
    metrics.enrollmentCount > 0
      ? Math.min(1, Math.log10(metrics.enrollmentCount) / 3)
      : 0;

  const score = activeRatio * 40 + discussionHealth * 30 + enrollmentScore * 30;

  return Math.min(100, Math.max(0, score));
}

/**
 * Accessibility Score (0-100)
 * Rewards courses that remove barriers to learning
 */
function calculateAccessibilityScore(metrics: CourseMetrics): number {
  let score = 0;

  // Free courses get a boost
  if (metrics.isFree) {
    score += 50;
  } else if (metrics.price) {
    // Affordable pricing (under $50 gets partial credit)
    const affordabilityScore = Math.max(0, (50 - metrics.price) / 50) * 30;
    score += affordabilityScore;
  }

  // Accessibility features
  if (metrics.hasClosedCaptions) score += 25;
  if (metrics.multilingualSupport) score += 25;

  return Math.min(100, Math.max(0, score));
}

/**
 * Freshness Score (0-100)
 * Decay function prevents stale content from dominating
 * Gives new instructors a fair chance
 */
function calculateFreshnessScore(metrics: CourseMetrics): number {
  const now = new Date();
  const daysSincePublished = daysBetween(metrics.publishedAt, now);
  const daysSinceUpdated = daysBetween(metrics.lastUpdatedAt, now);

  // New instructor boost (first 3 courses get +20% boost for 90 days)
  const newInstructorBoost =
    metrics.instructorCourseCount <= 3 && daysSincePublished <= 90 ? 20 : 0;

  // Decay based on last update (not publish date)
  // Full score if updated in last 30 days, decays to 20% over 365 days
  let freshnessScore = 100;
  if (daysSinceUpdated > 30) {
    const decayFactor = Math.min(1, (daysSinceUpdated - 30) / 335);
    freshnessScore = 100 - decayFactor * 80; // Decays from 100 to 20
  }

  const score = Math.min(100, freshnessScore + newInstructorBoost);
  return Math.max(0, score);
}

/**
 * Helper: Calculate days between two dates
 */
function daysBetween(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((end.getTime() - start.getTime()) / msPerDay);
}

/**
 * Batch rank multiple courses
 */
export function rankCourses(
  courses: Array<{ id: string; metrics: CourseMetrics }>
): Array<{ id: string; ranking: RankingResult }> {
  const results = courses.map((course) => ({
    id: course.id,
    ranking: calculateCourseRanking(course.metrics),
  }));

  // Sort by score descending
  results.sort((a, b) => b.ranking.score - a.ranking.score);

  // Assign ranks
  results.forEach((result, index) => {
    result.ranking.rank = index + 1;
  });

  return results;
}

/**
 * Explain ranking to users (transparency)
 */
export function explainRanking(ranking: RankingResult): string {
  const { breakdown } = ranking;

  const parts = [
    `Quality: ${breakdown.qualityScore.toFixed(1)}/100 (40% weight)`,
    `Engagement: ${breakdown.engagementScore.toFixed(1)}/100 (30% weight)`,
    `Accessibility: ${breakdown.accessibilityScore.toFixed(
      1
    )}/100 (20% weight)`,
    `Freshness: ${breakdown.freshnessScore.toFixed(1)}/100 (10% weight)`,
  ];

  return `Final Score: ${ranking.score.toFixed(2)}/100\n\n${parts.join("\n")}`;
}
