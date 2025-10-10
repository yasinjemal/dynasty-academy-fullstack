/**
 * Dynasty Built Academy - Builder Archetype System
 * 
 * Every builder has a unique DNA — a combination of thinking patterns, work styles, and growth trajectories.
 * This system detects, tracks, and evolves user archetypes based on real behavior, not self-reported surveys.
 * 
 * THE THREE ARCHETYPES:
 * 
 * 🔮 VISIONARY - The Architect of Possibilities
 * - Thinks in systems, loves big-picture strategy
 * - Prefers conceptual content, long-form thinking
 * - Reads deeply, bookmarks frameworks, slow but thorough
 * 
 * 🎯 STRATEGIST - The Tactical Commander  
 * - Loves structure, step-by-step execution plans
 * - Prefers actionable blueprints, checklists, templates
 * - Organized learner, completes courses fully, takes notes
 * 
 * ⚡ HUSTLER - The Speed Executor
 * - Bias toward action, learns by doing
 * - Prefers quick wins, case studies, tactical tips
 * - Skims fast, completes quickly, moves to next challenge
 */

export type BuilderArchetype = 'VISIONARY' | 'STRATEGIST' | 'HUSTLER'

export interface ArchetypeProfile {
  primaryArchetype: BuilderArchetype
  scores: {
    visionary: number      // 0-100
    strategist: number     // 0-100
    hustler: number        // 0-100
  }
  confidence: number       // 0-100 (how certain the detection is)
  evolutionPath: string    // Suggested growth direction
  strengths: string[]
  growthAreas: string[]
  lastUpdated: Date
}

export interface BehaviorSignals {
  // Reading patterns
  avgReadingTime: number           // seconds per article
  completionRate: number           // 0-1
  skimRate: number                 // pages visited / time spent
  
  // Content preferences
  longFormPreference: number       // 0-1 (prefers articles > 2000 words)
  frameworkPreference: number      // 0-1 (prefers structured content)
  caseStudyPreference: number      // 0-1 (prefers practical examples)
  
  // Interaction style
  bookmarkRate: number             // bookmarks / total reads
  commentDepth: number             // avg words per comment
  questionRate: number             // questions asked / total interactions
  shareRate: number                // shares / total reads
  
  // Learning behavior
  courseCompletionRate: number     // completed / started
  notesTaken: boolean
  revisitRate: number              // same content visited > once
  
  // Engagement momentum
  sessionDuration: number          // minutes per session
  returnFrequency: number          // days between visits
  peakActivityTime: 'morning' | 'afternoon' | 'evening' | 'night'
}

/**
 * ARCHETYPE DETECTION ALGORITHM
 * 
 * Uses weighted behavioral signals to calculate archetype scores.
 * The algorithm evolves over time as we collect more data.
 */
export class ArchetypeDetector {
  
  /**
   * Calculate Visionary score (0-100)
   * 
   * Visionaries are marked by:
   * - Long reading sessions (deep dives)
   * - High bookmark rate (collecting frameworks)
   * - Low skim rate (thorough consumption)
   * - Preference for conceptual/strategic content
   */
  static calculateVisionaryScore(signals: BehaviorSignals): number {
    let score = 0
    
    // Reading depth (40% weight)
    if (signals.avgReadingTime > 600) score += 25        // 10+ min reads
    if (signals.avgReadingTime > 900) score += 15        // 15+ min reads
    if (signals.completionRate > 0.8) score += 10
    if (signals.skimRate < 0.3) score += 10              // Slow, thorough
    
    // Content preferences (30% weight)
    score += signals.longFormPreference * 20             // Loves depth
    score += signals.frameworkPreference * 10            // Enjoys structure
    
    // Interaction style (20% weight)
    if (signals.bookmarkRate > 0.4) score += 15          // Collects knowledge
    if (signals.commentDepth > 100) score += 10          // Thoughtful comments
    if (signals.revisitRate > 0.3) score += 5            // Re-reads content
    
    // Learning behavior (10% weight)
    if (signals.sessionDuration > 45) score += 5         // Extended sessions
    if (signals.notesTaken) score += 5
    
    return Math.min(Math.round(score), 100)
  }
  
  /**
   * Calculate Strategist score (0-100)
   * 
   * Strategists are marked by:
   * - High completion rates (finishes what they start)
   * - Structured learning (courses, step-by-step guides)
   * - Organized consumption (notes, bookmarks in order)
   * - Preference for actionable blueprints
   */
  static calculateStrategistScore(signals: BehaviorSignals): number {
    let score = 0
    
    // Completion orientation (40% weight)
    score += signals.completionRate * 25                 // Finishes everything
    score += signals.courseCompletionRate * 15           // Completes courses
    if (signals.revisitRate > 0.2) score += 10           // Reviews content
    
    // Content preferences (30% weight)
    score += signals.frameworkPreference * 20            // Loves structure
    if (signals.caseStudyPreference > 0.5) score += 10   // Practical examples
    
    // Organized learning (20% weight)
    if (signals.bookmarkRate > 0.3) score += 10
    if (signals.notesTaken) score += 10
    if (signals.avgReadingTime > 300 && signals.avgReadingTime < 900) score += 5  // Methodical pace
    
    // Consistency (10% weight)
    if (signals.returnFrequency < 3) score += 10         // Returns regularly
    
    return Math.min(Math.round(score), 100)
  }
  
  /**
   * Calculate Hustler score (0-100)
   * 
   * Hustlers are marked by:
   * - Fast consumption (high skim rate)
   * - Action bias (low reading time, high completion)
   * - Practical focus (case studies over theory)
   * - Speed execution (many quick sessions)
   */
  static calculateHustlerScore(signals: BehaviorSignals): number {
    let score = 0
    
    // Speed orientation (40% weight)
    if (signals.skimRate > 0.6) score += 20              // Fast reader
    if (signals.avgReadingTime < 300) score += 15        // Quick consumption
    if (signals.sessionDuration < 30) score += 10        // Short bursts
    
    // Action bias (30% weight)
    score += signals.caseStudyPreference * 20            // Loves examples
    if (signals.completionRate > 0.7) score += 10        // Gets it done fast
    
    // Practical focus (20% weight)
    if (signals.shareRate > 0.3) score += 10             // Shares quick wins
    if (signals.bookmarkRate < 0.2) score += 10          // Doesn't hoard knowledge
    if (signals.commentDepth < 50) score += 5            // Quick comments
    
    // Momentum (10% weight)
    if (signals.returnFrequency < 2) score += 5          // High frequency
    if (signals.peakActivityTime === 'morning') score += 5  // Early action
    
    return Math.min(Math.round(score), 100)
  }
  
  /**
   * Detect primary archetype from behavior signals
   */
  static detect(signals: BehaviorSignals): ArchetypeProfile {
    const scores = {
      visionary: this.calculateVisionaryScore(signals),
      strategist: this.calculateStrategistScore(signals),
      hustler: this.calculateHustlerScore(signals)
    }
    
    // Find dominant archetype
    const primaryArchetype = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0].toUpperCase()) as BuilderArchetype
    const maxScore = Math.max(...Object.values(scores))
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
    
    // Confidence based on score separation
    const scoreDiff = maxScore - Math.max(
      ...Object.values(scores).filter(s => s !== maxScore)
    )
    const confidence = Math.min(Math.round((scoreDiff / maxScore) * 100 + 50), 100)
    
    return {
      primaryArchetype,
      scores,
      confidence,
      evolutionPath: this.getEvolutionPath(primaryArchetype, scores),
      strengths: this.getStrengths(primaryArchetype),
      growthAreas: this.getGrowthAreas(primaryArchetype, scores),
      lastUpdated: new Date()
    }
  }
  
  /**
   * Get personalized evolution path
   */
  private static getEvolutionPath(primary: BuilderArchetype, scores: ArchetypeProfile['scores']): string {
    const secondary = Object.entries(scores)
      .filter(([type]) => type.toUpperCase() !== primary)
      .sort((a, b) => b[1] - a[1])[0][0]
    
    const paths: Record<string, string> = {
      'VISIONARY-strategist': 'Learn to execute on your big ideas with tactical frameworks',
      'VISIONARY-hustler': 'Channel your vision into rapid prototyping and iteration',
      'STRATEGIST-visionary': 'Expand strategic thinking into visionary leadership',
      'STRATEGIST-hustler': 'Combine planning discipline with speed execution',
      'HUSTLER-visionary': 'Build systems thinking to scale your hustle',
      'HUSTLER-strategist': 'Add strategic depth to your action-oriented approach'
    }
    
    return paths[`${primary}-${secondary}`] || 'Continue developing your unique builder DNA'
  }
  
  /**
   * Get archetype-specific strengths
   */
  private static getStrengths(archetype: BuilderArchetype): string[] {
    const strengths: Record<BuilderArchetype, string[]> = {
      VISIONARY: [
        'Systems thinking & strategic vision',
        'Deep conceptual understanding',
        'Long-term pattern recognition',
        'Framework creation & big-picture planning'
      ],
      STRATEGIST: [
        'Structured execution & planning',
        'High completion rates & follow-through',
        'Methodical learning & organization',
        'Blueprint implementation & process design'
      ],
      HUSTLER: [
        'Rapid execution & speed to action',
        'Practical application & quick wins',
        'High momentum & consistent output',
        'Learning by doing & iteration'
      ]
    }
    
    return strengths[archetype]
  }
  
  /**
   * Get personalized growth areas based on weak archetype dimensions
   */
  private static getGrowthAreas(primary: BuilderArchetype, scores: ArchetypeProfile['scores']): string[] {
    const weakest = Object.entries(scores)
      .sort((a, b) => a[1] - b[1])[0][0]
      .toUpperCase() as BuilderArchetype
    
    const growth: Record<BuilderArchetype, string[]> = {
      VISIONARY: [
        'Practice tactical execution on small projects',
        'Set shorter milestones for momentum',
        'Balance depth with speed of delivery'
      ],
      STRATEGIST: [
        'Embrace quick prototyping before perfect planning',
        'Explore big-picture vision beyond current systems',
        'Allow room for creative experimentation'
      ],
      HUSTLER: [
        'Build deeper frameworks for sustainable growth',
        'Invest time in strategic planning phases',
        'Complete full learning paths for mastery'
      ]
    }
    
    return growth[weakest]
  }
}

/**
 * Content scoring by archetype preference
 * Used to personalize recommendations
 */
export const ARCHETYPE_CONTENT_WEIGHTS = {
  VISIONARY: {
    conceptual: 1.5,      // Philosophy, big ideas, future thinking
    strategic: 1.3,       // Frameworks, systems, mental models
    tactical: 0.8,        // Step-by-step guides
    quick: 0.6           // Quick tips, hacks, shortcuts
  },
  STRATEGIST: {
    conceptual: 1.0,
    strategic: 1.5,       // Loves structured frameworks
    tactical: 1.4,        // Actionable blueprints
    quick: 0.9
  },
  HUSTLER: {
    conceptual: 0.7,
    strategic: 1.0,
    tactical: 1.3,        // Practical how-tos
    quick: 1.5           // Quick wins and fast results
  }
} as const

/**
 * Archetype-based content tags for classification
 */
export const ARCHETYPE_TAGS = {
  visionary: ['strategy', 'vision', 'future', 'philosophy', 'systems', 'theory', 'principles', 'paradigm'],
  strategist: ['framework', 'blueprint', 'plan', 'roadmap', 'process', 'structure', 'template', 'checklist'],
  hustler: ['quick', 'tactical', 'actionable', 'practical', 'case-study', 'tips', 'hack', 'win']
} as const
