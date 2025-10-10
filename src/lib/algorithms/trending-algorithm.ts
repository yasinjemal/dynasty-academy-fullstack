/**
 * Dynasty Built Academy - Trending Content Algorithm
 * Custom-tuned for Dynasty Built community with:
 * - Slower decay (1.4 gravity) = longer discussion half-life
 * - Builder energy bonus for high-quality content (>70% completion)
 * - Emphasis on thoughtful engagement over viral metrics
 */

interface TrendingMetrics {
  views: number
  likes: number
  comments: number
  shares: number
  bookmarks: number
  completionRate: number
  timestamp: Date
}

export class TrendingAlgorithm {
  /**
   * Dynasty's Hot Score Algorithm
   * Combines Reddit's hot algorithm with learning-specific metrics
   */
  static calculateHotScore(metrics: TrendingMetrics, createdAt: Date): number {
    const now = new Date()
    const ageInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    
    // Calculate engagement score
    const engagementScore = this.calculateEngagementScore(metrics)
    
    // Dynasty Built: Slower time decay (1.4 vs 1.5) = longer discussion life
    const timeDecay = Math.pow(ageInHours + 2, -1.4)
    
    // Velocity factor (how fast is it growing?)
    const velocity = this.calculateVelocity(metrics, ageInHours)
    
    // Dynasty Built: Builder energy bonus for high-quality content
    const builderEnergyBonus = metrics.completionRate > 0.7 ? 1.2 : 1.0
    
    // Quality factor (completion rate matters for learning)
    const quality = metrics.completionRate * 2
    
    // Combined hot score with Dynasty Built multipliers
    return (engagementScore + quality) * timeDecay * (1 + velocity) * builderEnergyBonus
  }

  private static calculateEngagementScore(metrics: TrendingMetrics): number {
    // Logarithmic scaling to prevent viral content from dominating
    const score = (
      Math.log10(metrics.views + 1) * 1.0 +
      Math.log10(metrics.likes + 1) * 3.0 +
      Math.log10(metrics.comments + 1) * 5.0 + // Comments = high engagement
      Math.log10(metrics.shares + 1) * 4.0 +
      Math.log10(metrics.bookmarks + 1) * 3.5
    )
    
    return score
  }

  private static calculateVelocity(metrics: TrendingMetrics, ageInHours: number): number {
    if (ageInHours < 1) return 2.0 // Boost very new content
    
    // Engagement per hour
    const totalEngagement = metrics.likes + metrics.comments * 2 + metrics.shares * 3
    const velocity = totalEngagement / ageInHours
    
    // Normalize
    return Math.min(velocity / 10, 2.0)
  }

  /**
   * Controversy Score - Identify polarizing content
   * High engagement but mixed reactions
   */
  static calculateControversyScore(
    likes: number,
    dislikes: number,
    comments: number
  ): number {
    if (likes + dislikes < 10) return 0 // Not enough data
    
    // Wilson score interval for confidence
    const total = likes + dislikes
    const ratio = likes / total
    
    // Controversial if ratio is close to 0.5 (balanced reactions)
    const controversy = 1 - Math.abs(ratio - 0.5) * 2
    
    // Weight by comment count (controversy generates discussion)
    const discussionFactor = Math.min(Math.log10(comments + 1) / 2, 1)
    
    return controversy * discussionFactor
  }

  /**
   * Rising Content Algorithm - Identify content gaining momentum
   */
  static isRising(
    currentMetrics: TrendingMetrics,
    previousMetrics: TrendingMetrics,
    timeWindowHours: number
  ): { isRising: boolean; growthRate: number } {
    const currentScore = this.calculateEngagementScore(currentMetrics)
    const previousScore = this.calculateEngagementScore(previousMetrics)
    
    const growthRate = ((currentScore - previousScore) / previousScore) * 100
    const isRising = growthRate > 50 && timeWindowHours <= 24
    
    return { isRising, growthRate }
  }

  /**
   * Quality Score - Separate viral from valuable
   */
  static calculateQualityScore(metrics: TrendingMetrics): number {
    // High completion rate + engagement = quality
    const completionQuality = metrics.completionRate
    
    // Comment-to-view ratio (thoughtful engagement)
    const thoughtfulEngagement = Math.min(metrics.comments / (metrics.views + 1) * 100, 1)
    
    // Bookmark-to-like ratio (save for later = valuable)
    const saveRatio = Math.min(metrics.bookmarks / (metrics.likes + 1) * 2, 1)
    
    return (completionQuality * 0.5 + thoughtfulEngagement * 0.3 + saveRatio * 0.2)
  }

  /**
   * Get trending content with multiple sorting options
   */
  static rankContent(
    content: Array<any>,
    algorithm: 'hot' | 'top' | 'rising' | 'quality' = 'hot'
  ): Array<any> {
    switch (algorithm) {
      case 'hot':
        return content.sort((a, b) => {
          const scoreA = this.calculateHotScore(a.metrics, a.createdAt)
          const scoreB = this.calculateHotScore(b.metrics, b.createdAt)
          return scoreB - scoreA
        })
      
      case 'top':
        return content.sort((a, b) => {
          const scoreA = this.calculateEngagementScore(a.metrics)
          const scoreB = this.calculateEngagementScore(b.metrics)
          return scoreB - scoreA
        })
      
      case 'quality':
        return content.sort((a, b) => {
          const scoreA = this.calculateQualityScore(a.metrics)
          const scoreB = this.calculateQualityScore(b.metrics)
          return scoreB - scoreA
        })
      
      case 'rising':
        // Would need historical data - simplified version
        return content
          .filter(item => {
            const ageInHours = (new Date().getTime() - item.createdAt.getTime()) / (1000 * 60 * 60)
            return ageInHours <= 48 // Recent content only
          })
          .sort((a, b) => {
            const velocityA = this.calculateVelocity(a.metrics, 24)
            const velocityB = this.calculateVelocity(b.metrics, 24)
            return velocityB - velocityA
          })
      
      default:
        return content
    }
  }
}
