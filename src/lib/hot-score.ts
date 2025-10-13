/**
 * Hot Score Algorithm
 * 
 * Ranks feed items by quality + freshness
 * Formula: ln(1 + likes*4 + comments*6 + views*0.5) + freshness_boost
 */

export interface HotScoreInput {
  likes: number;
  comments: number;
  views: number;
  publishedAt: Date;
}

/**
 * Calculate hot score for a post/reflection
 * 
 * @returns Float score (higher = better ranking)
 */
export function calculateHotScore({
  likes,
  comments,
  views,
  publishedAt,
}: HotScoreInput): number {
  // Engagement score (logarithmic to prevent outliers from dominating)
  const engagementScore = Math.log(1 + likes * 4 + comments * 6 + views * 0.5);
  
  // Freshness boost (decays over 24 hours)
  const now = new Date();
  const hoursSincePublish = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);
  const freshnesBoost = Math.max(0, 24 - hoursSincePublish) * 0.03;
  
  return engagementScore + freshnesBoost;
}

/**
 * Calculate author diversity penalty
 * 
 * Reduces score if same author appears multiple times in recent feed
 * 
 * @param authorId - Author's user ID
 * @param recentAuthorIds - Array of author IDs from last N items
 * @param penalty - Penalty amount (default -0.2)
 * @returns Penalty to subtract from score
 */
export function calculateAuthorDiversityPenalty(
  authorId: string,
  recentAuthorIds: string[],
  penalty = 0.2
): number {
  const authorCount = recentAuthorIds.filter(id => id === authorId).length;
  
  // Apply penalty if author appeared in last 5 items
  if (authorCount > 0 && recentAuthorIds.slice(0, 5).includes(authorId)) {
    return penalty;
  }
  
  return 0;
}

/**
 * Batch recalculate hot scores for all items
 * 
 * Call this from a cron job every 5-10 minutes
 */
export async function recalculateHotScores(prisma: any) {
  console.log('[HOT SCORE] Starting recalculation...');
  
  // Update posts
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      likeCount: true,
      commentCount: true,
      viewCount: true,
      publishedAt: true,
    },
  });
  
  for (const post of posts) {
    const hotScore = calculateHotScore({
      likes: post.likeCount,
      comments: post.commentCount,
      views: post.viewCount,
      publishedAt: post.publishedAt,
    });
    
    await prisma.post.update({
      where: { id: post.id },
      data: { hotScore },
    });
  }
  
  // Update reflections
  const reflections = await prisma.reflection.findMany({
    select: {
      id: true,
      likeCount: true,
      commentCount: true,
      createdAt: true,
    },
  });
  
  for (const reflection of reflections) {
    const hotScore = calculateHotScore({
      likes: reflection.likeCount,
      comments: reflection.commentCount,
      views: 0, // Reflections don't track views separately
      publishedAt: reflection.createdAt,
    });
    
    await prisma.reflection.update({
      where: { id: reflection.id },
      data: { hotScore },
    });
  }
  
  console.log(`[HOT SCORE] ✅ Updated ${posts.length} posts, ${reflections.length} reflections`);
}

/**
 * Increment view count and update hot score
 */
export async function incrementView(prisma: any, postId: string) {
  const post = await prisma.post.update({
    where: { id: postId },
    data: { viewCount: { increment: 1 } },
    select: {
      likeCount: true,
      commentCount: true,
      viewCount: true,
      publishedAt: true,
    },
  });
  
  const hotScore = calculateHotScore({
    likes: post.likeCount,
    comments: post.commentCount,
    views: post.viewCount,
    publishedAt: post.publishedAt,
  });
  
  await prisma.post.update({
    where: { id: postId },
    data: { hotScore },
  });
}

/**
 * Update hot score after engagement (like/comment)
 */
export async function updateHotScore(
  prisma: any,
  entityType: 'post' | 'reflection',
  entityId: string
) {
  if (entityType === 'post') {
    const post = await prisma.post.findUnique({
      where: { id: entityId },
      select: {
        likeCount: true,
        commentCount: true,
        viewCount: true,
        publishedAt: true,
      },
    });
    
    if (!post) return;
    
    const hotScore = calculateHotScore({
      likes: post.likeCount,
      comments: post.commentCount,
      views: post.viewCount,
      publishedAt: post.publishedAt,
    });
    
    await prisma.post.update({
      where: { id: entityId },
      data: { hotScore },
    });
  } else {
    const reflection = await prisma.reflection.findUnique({
      where: { id: entityId },
      select: {
        likeCount: true,
        commentCount: true,
        createdAt: true,
      },
    });
    
    if (!reflection) return;
    
    const hotScore = calculateHotScore({
      likes: reflection.likeCount,
      comments: reflection.commentCount,
      views: 0,
      publishedAt: reflection.createdAt,
    });
    
    await prisma.reflection.update({
      where: { id: entityId },
      data: { hotScore },
    });
  }
}
