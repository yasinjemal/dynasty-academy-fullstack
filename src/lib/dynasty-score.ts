/**
 * Dynasty Score System
 * 
 * Central point-granting engine for all user actions.
 * Tracks activities in DynastyActivity table for audit trail.
 */

import { prisma } from '@/lib/db/prisma';

// Dynasty Score Rules
export const DS_RULES = {
  // Content Creation
  CREATE_POST: 10,
  WRITE_REFLECTION: 12,
  PUBLISH_BLOG: 15,
  
  // Engagement
  FIRST_COMMENT: 3,       // Cap: 10/day
  LIKE_RECEIVED: 1,        // When someone likes your content
  COMMENT_RECEIVED: 4,     // When someone comments on your content
  
  // Social
  FOLLOW_USER: 1,          // Cap: 5/day
  FOLLOWER_GAINED: 2,      // When someone follows you
  
  // Milestones (one-time bonuses)
  POST_5_LIKES: 5,
  POST_10_COMMENTS: 10,
  REFLECTION_STREAK_7: 50,
  
  // Daily Activity
  DAILY_LOGIN: 2,
  STREAK_BONUS_7: 50,
  STREAK_BONUS_30: 200,
  STREAK_BONUS_100: 1000,
  
  // Achievements
  ACHIEVEMENT_UNLOCK: 0,   // Varies by achievement
} as const;

// Level Curve: nextLevel = 100 * level^2
export function calculateLevelFromScore(score: number): number {
  // Solve: score = 100 * level^2
  // level = sqrt(score / 100)
  return Math.floor(Math.sqrt(score / 100)) + 1;
}

export function calculateScoreForNextLevel(currentLevel: number): number {
  return 100 * (currentLevel + 1) ** 2;
}

export function calculateProgressToNextLevel(currentScore: number, currentLevel: number): number {
  const currentLevelScore = 100 * currentLevel ** 2;
  const nextLevelScore = 100 * (currentLevel + 1) ** 2;
  const scoreInLevel = currentScore - currentLevelScore;
  const scoreNeeded = nextLevelScore - currentLevelScore;
  return (scoreInLevel / scoreNeeded) * 100;
}

// Grant Dynasty Score
export interface GrantDSParams {
  userId: string;
  action: keyof typeof DS_RULES | string;
  points?: number;  // Override default points
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

export async function grantDynastyScore({
  userId,
  action,
  points,
  entityType,
  entityId,
  metadata = {},
}: GrantDSParams) {
  // Get points for action (use override if provided)
  const actionPoints = points ?? DS_RULES[action as keyof typeof DS_RULES] ?? 0;
  
  if (actionPoints === 0) {
    console.warn(`[DS] No points defined for action: ${action}`);
    return null;
  }
  
  // Check for duplicates (idempotency)
  if (entityType && entityId) {
    const existing = await prisma.dynastyActivity.findFirst({
      where: {
        userId,
        action,
        entityType,
        entityId,
      },
    });
    
    if (existing) {
      console.log(`[DS] Duplicate activity detected: ${action} for ${entityType}:${entityId}`);
      return existing;
    }
  }
  
  // Check daily caps
  if (action === 'FIRST_COMMENT') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = await prisma.dynastyActivity.count({
      where: {
        userId,
        action: 'FIRST_COMMENT',
        createdAt: { gte: today },
      },
    });
    
    if (todayCount >= 10) {
      console.log(`[DS] Daily cap reached for ${action}`);
      return null;
    }
  }
  
  if (action === 'FOLLOW_USER') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = await prisma.dynastyActivity.count({
      where: {
        userId,
        action: 'FOLLOW_USER',
        createdAt: { gte: today },
      },
    });
    
    if (todayCount >= 5) {
      console.log(`[DS] Daily cap reached for ${action}`);
      return null;
    }
  }
  
  // Grant points in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Log activity
    const activity = await tx.dynastyActivity.create({
      data: {
        userId,
        action,
        points: actionPoints,
        entityType,
        entityId,
        metadata,
      },
    });
    
    // Update user score
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        dynastyScore: { increment: actionPoints },
        lastActiveAt: new Date(),
      },
      select: {
        id: true,
        dynastyScore: true,
        level: true,
        name: true,
      },
    });
    
    // Check for level up
    const newLevel = calculateLevelFromScore(user.dynastyScore);
    
    if (newLevel > user.level) {
      await tx.user.update({
        where: { id: userId },
        data: { level: newLevel },
      });
      
      // Create level-up notification
      await tx.notification.create({
        data: {
          userId,
          type: 'LEVEL_UP',
          title: `Level Up! 🎉`,
          message: `Congratulations! You've reached Level ${newLevel}`,
          link: '/profile',
        },
      });
      
      console.log(`[DS] 🎉 Level up! ${user.name} → Level ${newLevel}`);
    }
    
    return { activity, user, leveledUp: newLevel > user.level };
  });
  
  console.log(`[DS] +${actionPoints} points for ${action} (User: ${userId})`);
  
  return result;
}

// Update streak
export async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastActiveAt: true, streakDays: true },
  });
  
  if (!user) return;
  
  const now = new Date();
  const lastActive = user.lastActiveAt;
  
  if (!lastActive) {
    // First activity
    await prisma.user.update({
      where: { id: userId },
      data: {
        streakDays: 1,
        lastActiveAt: now,
      },
    });
    
    await grantDynastyScore({
      userId,
      action: 'DAILY_LOGIN',
    });
    
    return;
  }
  
  const daysSinceLastActive = Math.floor(
    (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceLastActive === 0) {
    // Same day, no streak update
    return;
  } else if (daysSinceLastActive === 1) {
    // Next day, increment streak
    const newStreak = user.streakDays + 1;
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        streakDays: newStreak,
        lastActiveAt: now,
      },
    });
    
    await grantDynastyScore({
      userId,
      action: 'DAILY_LOGIN',
    });
    
    // Check for streak milestones
    if (newStreak === 7) {
      await grantDynastyScore({
        userId,
        action: 'STREAK_BONUS_7',
      });
    } else if (newStreak === 30) {
      await grantDynastyScore({
        userId,
        action: 'STREAK_BONUS_30',
      });
    } else if (newStreak === 100) {
      await grantDynastyScore({
        userId,
        action: 'STREAK_BONUS_100',
      });
    }
    
    console.log(`[DS] 🔥 Streak updated: ${newStreak} days (User: ${userId})`);
  } else {
    // Streak broken, reset to 1
    await prisma.user.update({
      where: { id: userId },
      data: {
        streakDays: 1,
        lastActiveAt: now,
      },
    });
    
    await grantDynastyScore({
      userId,
      action: 'DAILY_LOGIN',
    });
    
    console.log(`[DS] 💔 Streak broken, reset to 1 (User: ${userId})`);
  }
}

// Get user DS stats
export async function getUserDSStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      dynastyScore: true,
      level: true,
      streakDays: true,
      lastActiveAt: true,
    },
  });
  
  if (!user) return null;
  
  const nextLevelScore = calculateScoreForNextLevel(user.level || 1);
  const progress = calculateProgressToNextLevel(user.dynastyScore || 0, user.level || 1);
  
  return {
    score: user.dynastyScore || 0,
    level: user.level || 1,
    streak: user.streakDays || 0,
    progress: Math.round(progress),
    nextLevelScore,
    lastActive: user.lastActiveAt,
  };
}

// Get recent activities
export async function getRecentActivities(userId: string, limit = 10) {
  return prisma.dynastyActivity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      action: true,
      points: true,
      entityType: true,
      entityId: true,
      createdAt: true,
    },
  });
}

// Award milestone bonuses
export async function awardMilestone(userId: string, milestone: string) {
  const milestones: Record<string, number> = {
    POST_5_LIKES: DS_RULES.POST_5_LIKES,
    POST_10_COMMENTS: DS_RULES.POST_10_COMMENTS,
    REFLECTION_STREAK_7: DS_RULES.REFLECTION_STREAK_7,
  };
  
  const points = milestones[milestone];
  
  if (!points) {
    console.warn(`[DS] Unknown milestone: ${milestone}`);
    return;
  }
  
  await grantDynastyScore({
    userId,
    action: milestone,
    points,
    metadata: { type: 'milestone' },
  });
}
