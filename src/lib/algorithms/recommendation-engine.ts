/**
 * Dynasty Built Academy - Intelligent Recommendation Engine
 * Unique algorithm for personalized content recommendations with Archetype Intelligence
 */

import { BuilderArchetype, ARCHETYPE_CONTENT_WEIGHTS } from './archetype-detector'

interface UserProfile {
  id: string
  interests: string[]
  completedBooks: string[]
  readingHistory: string[]
  engagementScore: number
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  archetype?: BuilderArchetype  // Optional: enhances recommendations if present
}

interface Content {
  id: string
  title: string
  category: string
  tags: string[]
  difficulty: string
  averageRating: number
  completionRate: number
  engagementMetrics: {
    likes: number
    comments: number
    shares: number
  }
}

export class RecommendationEngine {
  /**
   * Dynasty's Unique Algorithm: Multi-Factor Recommendation Score
   * Combines user behavior, content quality, community engagement, AND archetype DNA
   */
  static calculateRecommendationScore(user: UserProfile, content: Content): number {
    // Factor 1: Interest Match (35% weight - reduced to make room for archetype)
    const interestMatch = this.calculateInterestMatch(user.interests, content.tags)
    
    // Factor 2: Skill Level Alignment (25% weight)
    const skillAlignment = this.calculateSkillAlignment(user.skillLevel, content.difficulty)
    
    // Factor 3: Social Proof (15% weight - reduced)
    const socialProof = this.calculateSocialProof(content)
    
    // Factor 4: Novelty Factor (10% weight - reduced)
    const noveltyScore = this.calculateNovelty(user, content)
    
    // Factor 5: Archetype Alignment (15% weight - NEW!)
    const archetypeBonus = user.archetype 
      ? this.calculateArchetypeMatch(user.archetype, content)
      : 0
    
    // Weighted combination
    const finalScore = (
      interestMatch * 0.35 +
      skillAlignment * 0.25 +
      socialProof * 0.15 +
      noveltyScore * 0.10 +
      archetypeBonus * 0.15
    )
    
    return Math.round(finalScore * 100) / 100
  }

  /**
   * NEW: Calculate archetype-content alignment
   * Visionaries prefer conceptual/strategic content
   * Strategists prefer structured blueprints
   * Hustlers prefer quick tactical wins
   */
  private static calculateArchetypeMatch(archetype: BuilderArchetype, content: Content): number {
    const weights = ARCHETYPE_CONTENT_WEIGHTS[archetype]
    
    // Classify content type based on tags
    let contentType: 'conceptual' | 'strategic' | 'tactical' | 'quick' = 'tactical'
    
    const tags = content.tags.map(t => t.toLowerCase())
    
    if (tags.some(t => ['strategy', 'vision', 'philosophy', 'theory', 'paradigm'].includes(t))) {
      contentType = 'conceptual'
    } else if (tags.some(t => ['framework', 'blueprint', 'roadmap', 'template', 'structure'].includes(t))) {
      contentType = 'strategic'
    } else if (tags.some(t => ['quick', 'tip', 'hack', 'shortcut', '5-min'].includes(t))) {
      contentType = 'quick'
    }
    
    // Return weighted score (0-1 range)
    return Math.min(weights[contentType] / 1.5, 1)
  }

  private static calculateInterestMatch(userInterests: string[], contentTags: string[]): number {
    if (userInterests.length === 0) return 0.5 // Neutral for new users
    
    const matches = contentTags.filter(tag => 
      userInterests.some(interest => 
        interest.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(interest.toLowerCase())
      )
    ).length
    
    return Math.min(matches / Math.max(userInterests.length, contentTags.length), 1)
  }

  private static calculateSkillAlignment(userLevel: string, contentDifficulty: string): number {
    const levelMap: Record<string, number> = {
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3
    }
    
    const userScore = levelMap[userLevel] || 2
    const contentScore = levelMap[contentDifficulty.toLowerCase()] || 2
    
    // Perfect match = 1.0, one level off = 0.7, two levels = 0.4
    const difference = Math.abs(userScore - contentScore)
    return difference === 0 ? 1.0 : difference === 1 ? 0.7 : 0.4
  }

  private static calculateSocialProof(content: Content): number {
    const metrics = content.engagementMetrics
    
    // Normalize engagement metrics
    const engagementScore = (
      Math.log(metrics.likes + 1) * 0.4 +
      Math.log(metrics.comments + 1) * 0.3 +
      Math.log(metrics.shares + 1) * 0.3
    ) / 10 // Scale down
    
    // Combine with ratings and completion
    return Math.min(
      (engagementScore * 0.4 + content.averageRating / 5 * 0.3 + content.completionRate * 0.3),
      1
    )
  }

  private static calculateNovelty(user: UserProfile, content: Content): number {
    // Reward exploring new categories
    const isNewCategory = !user.readingHistory.some(h => h === content.category)
    const hasCompletedSimilar = user.completedBooks.includes(content.id)
    
    if (hasCompletedSimilar) return 0 // Already consumed
    if (isNewCategory) return 0.9 // High novelty
    
    // Moderate novelty for same category but different content
    return 0.6
  }

  /**
   * Get personalized recommendations with diversity
   */
  static async getRecommendations(
    userId: string,
    availableContent: Content[],
    limit: number = 10
  ): Promise<Content[]> {
    // Fetch user profile (mock for now)
    const userProfile = await this.getUserProfile(userId)
    
    // Score all content
    const scoredContent = availableContent.map(content => ({
      content,
      score: this.calculateRecommendationScore(userProfile, content)
    }))
    
    // Sort by score
    scoredContent.sort((a, b) => b.score - a.score)
    
    // Apply diversity filter to avoid echo chamber
    const diverseRecommendations = this.applyDiversityFilter(scoredContent, limit)
    
    return diverseRecommendations.map(item => item.content)
  }

  private static applyDiversityFilter(
    scoredContent: Array<{ content: Content; score: number }>,
    limit: number
  ): Array<{ content: Content; score: number }> {
    const selected: Array<{ content: Content; score: number }> = []
    const categoryCount: Record<string, number> = {}
    
    for (const item of scoredContent) {
      if (selected.length >= limit) break
      
      const category = item.content.category
      const currentCount = categoryCount[category] || 0
      
      // Limit items per category to ensure diversity
      if (currentCount < 3) {
        selected.push(item)
        categoryCount[category] = currentCount + 1
      }
    }
    
    return selected
  }

  private static async getUserProfile(userId: string): Promise<UserProfile> {
    // This would fetch from database
    // Mock implementation
    return {
      id: userId,
      interests: ['web development', 'AI', 'entrepreneurship'],
      completedBooks: [],
      readingHistory: [],
      engagementScore: 0.5,
      skillLevel: 'intermediate'
    }
  }
}
