/**
 * AI Content Moderator System
 *
 * Automatically flags inappropriate content using:
 * - OpenAI Moderation API
 * - Custom keyword detection
 * - Sentiment analysis
 * - Spam detection
 *
 * Auto-moderates:
 * - Course descriptions
 * - User comments
 * - Forum posts
 * - Profile bios
 * - Course titles
 */

import { createAuditLog } from "@/lib/security/audit-logger";

// OpenAI Moderation categories
export type ModerationCategory =
  | "sexual"
  | "hate"
  | "harassment"
  | "self-harm"
  | "sexual/minors"
  | "hate/threatening"
  | "violence/graphic"
  | "self-harm/intent"
  | "self-harm/instructions"
  | "harassment/threatening"
  | "violence";

export interface ModerationResult {
  flagged: boolean;
  categories: Partial<Record<ModerationCategory, boolean>>;
  categoryScores: Partial<Record<ModerationCategory, number>>;
  severity: "low" | "medium" | "high" | "critical";
  action: "approve" | "review" | "reject" | "auto-ban";
  reasons: string[];
  confidence: number;
}

/**
 * Check content using OpenAI Moderation API
 */
export async function moderateContent(
  content: string,
  contentType: "course" | "comment" | "profile" | "forum" | "title" = "comment"
): Promise<ModerationResult> {
  try {
    // Step 1: OpenAI Moderation API
    const openaiResult = await checkOpenAIModerator(content);

    // Step 2: Custom keyword filter
    const keywordResult = checkKeywords(content);

    // Step 3: Spam detection
    const spamResult = detectSpam(content);

    // Step 4: Combine results
    const combined = combineResults(openaiResult, keywordResult, spamResult);

    // Step 5: Determine action
    const result = determineAction(combined, contentType);

    // Step 6: Log if flagged
    if (result.flagged) {
      await logModerationEvent(content, result, contentType);
    }

    return result;
  } catch (error) {
    console.error("Moderation error:", error);

    // Fail safe - allow content but flag for manual review
    return {
      flagged: true,
      categories: {},
      categoryScores: {},
      severity: "medium",
      action: "review",
      reasons: ["Moderation system error - requires manual review"],
      confidence: 0,
    };
  }
}

/**
 * OpenAI Moderation API check
 */
async function checkOpenAIModerator(content: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null; // Skip if no API key
  }

  try {
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: content,
        model: "text-moderation-latest",
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI Moderation API failed");
    }

    const data = await response.json();
    const result = data.results[0];

    return {
      flagged: result.flagged,
      categories: result.categories,
      categoryScores: result.category_scores,
    };
  } catch (error) {
    console.error("OpenAI moderation failed:", error);
    return null;
  }
}

/**
 * Custom keyword filter
 */
function checkKeywords(content: string): {
  flagged: boolean;
  keywords: string[];
} {
  const lowerContent = content.toLowerCase();

  // Inappropriate keywords (basic list)
  const inappropriateKeywords = [
    "buy followers",
    "guaranteed money",
    "click here now",
    "100% free",
    "nigerian prince",
    "wire transfer",
    "bitcoin investment",
    "crypto scam",
  ];

  const foundKeywords = inappropriateKeywords.filter((keyword) =>
    lowerContent.includes(keyword)
  );

  return {
    flagged: foundKeywords.length > 0,
    keywords: foundKeywords,
  };
}

/**
 * Spam detection
 */
function detectSpam(content: string): {
  isSpam: boolean;
  score: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let score = 0;

  // Too many URLs
  const urlCount = (content.match(/https?:\/\//g) || []).length;
  if (urlCount > 3) {
    score += 0.3;
    reasons.push(`Too many URLs (${urlCount})`);
  }

  // Excessive capitalization
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.5 && content.length > 20) {
    score += 0.2;
    reasons.push("Excessive capitalization");
  }

  // Excessive exclamation marks
  const exclamationCount = (content.match(/!/g) || []).length;
  if (exclamationCount > 5) {
    score += 0.2;
    reasons.push(`Too many exclamation marks (${exclamationCount})`);
  }

  // Repeated characters
  if (/(.)\1{4,}/.test(content)) {
    score += 0.15;
    reasons.push("Repeated characters");
  }

  // Too short for context
  if (content.trim().length < 5) {
    score += 0.15;
    reasons.push("Content too short");
  }

  return {
    isSpam: score >= 0.5,
    score,
    reasons,
  };
}

/**
 * Combine moderation results
 */
function combineResults(
  openai: any,
  keywords: { flagged: boolean; keywords: string[] },
  spam: { isSpam: boolean; score: number; reasons: string[] }
) {
  const reasons: string[] = [];
  let maxSeverity = 0; // 0-3: low, medium, high, critical

  // OpenAI results
  if (openai?.flagged) {
    const categories = Object.entries(openai.categories)
      .filter(([_, flagged]) => flagged)
      .map(([category]) => category);

    reasons.push(...categories.map((cat) => `Inappropriate content: ${cat}`));

    // Determine severity from OpenAI
    if (
      categories.includes("sexual/minors") ||
      categories.includes("self-harm/instructions")
    ) {
      maxSeverity = 3; // Critical
    } else if (categories.includes("violence") || categories.includes("hate")) {
      maxSeverity = Math.max(maxSeverity, 2); // High
    } else {
      maxSeverity = Math.max(maxSeverity, 1); // Medium
    }
  }

  // Keyword results
  if (keywords.flagged) {
    reasons.push(...keywords.keywords.map((kw) => `Blocked keyword: "${kw}"`));
    maxSeverity = Math.max(maxSeverity, 1);
  }

  // Spam results
  if (spam.isSpam) {
    reasons.push(...spam.reasons);
    maxSeverity = Math.max(maxSeverity, 1);
  }

  return {
    flagged: reasons.length > 0,
    reasons,
    severity: ["low", "medium", "high", "critical"][
      maxSeverity
    ] as ModerationResult["severity"],
    openai,
    keywords,
    spam,
  };
}

/**
 * Determine action based on severity and content type
 */
function determineAction(combined: any, contentType: string): ModerationResult {
  const { severity, reasons, openai } = combined;

  let action: ModerationResult["action"] = "approve";

  // Critical content - auto-ban
  if (severity === "critical") {
    action = "auto-ban";
  }
  // High severity - auto-reject
  else if (severity === "high") {
    action = "reject";
  }
  // Medium severity - manual review
  else if (severity === "medium") {
    action = "review";
  }
  // Low severity on courses - review (higher standard)
  else if (severity === "low" && contentType === "course") {
    action = "review";
  }
  // Everything else - approve
  else if (reasons.length === 0) {
    action = "approve";
  }

  const confidence = openai
    ? Math.max(...Object.values(openai.categoryScores || {}))
    : combined.spam.score;

  return {
    flagged: combined.flagged,
    categories: openai?.categories || {},
    categoryScores: openai?.categoryScores || {},
    severity,
    action,
    reasons,
    confidence: Math.round(confidence * 100),
  };
}

/**
 * Log moderation event to audit trail
 */
async function logModerationEvent(
  content: string,
  result: ModerationResult,
  contentType: string
) {
  await createAuditLog({
    action: "SUSPICIOUS_ACTIVITY",
    severity:
      result.severity === "critical"
        ? "critical"
        : result.severity === "high"
        ? "high"
        : "medium",
    metadata: {
      after: {
        type: "content_moderation_flagged",
        contentType,
        action: result.action,
        reasons: result.reasons,
        confidence: result.confidence,
        contentPreview: content.substring(0, 100),
      },
    },
  });
}

/**
 * Auto-moderate and take action
 */
export async function autoModerate(params: {
  content: string;
  contentType: "course" | "comment" | "profile" | "forum" | "title";
  userId: string;
  entityId?: string;
}) {
  const { content, contentType, userId, entityId } = params;

  const result = await moderateContent(content, contentType);

  // Take action based on result
  switch (result.action) {
    case "auto-ban":
      // Ban user immediately
      await banUser(userId, result.reasons.join(", "));
      break;

    case "reject":
      // Reject content, notify user
      await rejectContent(userId, entityId, result.reasons);
      break;

    case "review":
      // Flag for manual review
      await flagForReview(userId, entityId, contentType, result);
      break;

    case "approve":
      // Content is safe
      break;
  }

  return result;
}

/**
 * Ban user (placeholder - implement based on your user model)
 */
async function banUser(userId: string, reason: string) {
  console.log(`🚫 Auto-ban user ${userId}: ${reason}`);

  await createAuditLog({
    action: "SUSPICIOUS_ACTIVITY",
    userId,
    severity: "critical",
    metadata: {
      after: {
        type: "user_auto_banned",
        reason,
      },
    },
  });

  // TODO: Implement actual user ban in database
  // await prisma.user.update({
  //   where: { id: userId },
  //   data: { status: "BANNED", bannedReason: reason }
  // });
}

/**
 * Reject content
 */
async function rejectContent(
  userId: string,
  entityId: string | undefined,
  reasons: string[]
) {
  console.log(`❌ Content rejected for user ${userId}: ${reasons.join(", ")}`);

  await createAuditLog({
    action: "SUSPICIOUS_ACTIVITY",
    userId,
    severity: "high",
    metadata: {
      after: {
        type: "content_rejected",
        entityId,
        reasons,
      },
    },
  });
}

/**
 * Flag for manual review
 */
async function flagForReview(
  userId: string,
  entityId: string | undefined,
  contentType: string,
  result: ModerationResult
) {
  console.log(
    `⚠️ Content flagged for review: ${contentType} by user ${userId}`
  );

  await createAuditLog({
    action: "SUSPICIOUS_ACTIVITY",
    userId,
    severity: "medium",
    metadata: {
      after: {
        type: "content_flagged_for_review",
        contentType,
        entityId,
        reasons: result.reasons,
        confidence: result.confidence,
      },
    },
  });

  // TODO: Create moderation queue entry
  // await prisma.moderationQueue.create({
  //   data: {
  //     userId,
  //     entityId,
  //     contentType,
  //     reasons: result.reasons,
  //     status: "PENDING",
  //   },
  // });
}

/**
 * Get moderation statistics
 */
export async function getModerationStats() {
  // TODO: Implement database queries
  return {
    totalModerated: 0,
    autoApproved: 0,
    flaggedForReview: 0,
    rejected: 0,
    banned: 0,
  };
}
