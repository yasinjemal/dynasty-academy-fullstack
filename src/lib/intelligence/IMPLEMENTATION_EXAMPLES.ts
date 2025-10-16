// 📘 INTELLIGENCE SYSTEM - IMPLEMENTATION GUIDE
// How to use the reusable intelligence system in your features

import {
  Intelligence,
  BookIntelligence,
  CourseIntelligence,
} from "@/lib/intelligence";

// ==================== EXAMPLE 1: BOOKS (Current Implementation) ====================

/**
 * Generate predictions for book reading
 */
async function getBookPredictions(
  userId: string,
  bookId: string,
  chapterId: number
) {
  // Method 1: Use the shortcut API
  const prediction = await Intelligence.books.predict(
    userId,
    bookId,
    chapterId
  );

  // Method 2: Use the engine directly
  const bookIntel = new BookIntelligence();
  const prediction2 = await bookIntel.predict({
    userId,
    featureType: "BOOK",
    entityId: bookId,
    entitySubId: chapterId,
  });

  return prediction;
}

/**
 * Track book reading behavior
 */
async function trackBookReading(
  userId: string,
  bookId: string,
  chapterId: number,
  sessionDuration: number,
  completed: boolean
) {
  await Intelligence.track({
    userId,
    activityType: "LISTENING_SESSION", // or 'READING_SESSION'
    entityId: bookId,
    entitySubId: chapterId,
    sessionDuration,
    completed,
    metadata: {
      pauseCount: 2,
      speedChanges: 1,
      atmosphereChanges: 0,
    },
  });
}

// ==================== EXAMPLE 2: COURSES (New Feature) ====================

/**
 * Generate predictions for course lessons
 */
async function getCoursePredictions(
  userId: string,
  courseId: string,
  lessonId: number,
  courseLevel: "beginner" | "intermediate" | "advanced" = "intermediate"
) {
  // Method 1: Use the shortcut API
  const prediction = await Intelligence.courses.predict(
    userId,
    courseId,
    lessonId,
    courseLevel
  );

  // Method 2: Use the engine directly
  const courseIntel = new CourseIntelligence();
  const prediction2 = await courseIntel.predict({
    userId,
    featureType: "COURSE",
    entityId: courseId,
    entitySubId: lessonId,
    metadata: {
      courseLevel,
      totalLessons: 15,
    },
  });

  return prediction;
}

/**
 * Track course lesson completion
 */
async function trackCourseLesson(
  userId: string,
  courseId: string,
  lessonId: number,
  sessionDuration: number,
  completed: boolean,
  quizScore?: number
) {
  await Intelligence.track({
    userId,
    activityType: "COURSE_LESSON",
    entityId: courseId,
    entitySubId: lessonId,
    sessionDuration,
    completed,
    metadata: {
      quizScore,
      interactionCount: 5, // clicks, notes, etc.
      qualityScore: quizScore ? (quizScore / 100) * 100 : undefined,
    },
  });
}

// ==================== EXAMPLE 3: COMMUNITY (Future Feature) ====================

/**
 * Example: Community intelligence (not yet implemented)
 */
async function getCommunityPredictions(userId: string) {
  // When we build CommunityIntelligence, usage will be:
  /*
  const communityIntel = new CommunityIntelligence();
  const prediction = await communityIntel.predict({
    userId,
    featureType: 'COMMUNITY',
  });
  
  // Returns:
  // - bestTimeToPost: "9-11 AM" (based on circadian)
  // - expectedEngagement: 85 (based on momentum)
  // - trendingTopics: ["AI", "Leadership"]
  // - suggestions: ["Post during morning peak for max engagement"]
  */
}

/**
 * Track community engagement
 */
async function trackCommunityPost(
  userId: string,
  postId: string,
  sessionDuration: number,
  completed: boolean
) {
  await Intelligence.track({
    userId,
    activityType: "COMMUNITY_POST",
    entityId: postId,
    sessionDuration,
    completed,
    metadata: {
      likes: 15,
      comments: 3,
      shares: 1,
    },
  });
}

// ==================== EXAMPLE 4: CUSTOM FEATURE ====================

/**
 * Create your own intelligence engine
 */
/*
import { BaseIntelligence } from "@/lib/intelligence";

class WorkoutIntelligence extends BaseIntelligence {
  async predict(context) {
    // Reuse algorithms
    const circadian = this.analyzeCircadianRhythm();
    const momentum = await this.analyzeMomentum(context.userId, 'WORKOUT');
    
    // Custom logic
    const recommendedIntensity = 
      circadian.energyLevel > 0.8 ? "high" :
      circadian.energyLevel > 0.6 ? "moderate" :
      "light";
    
    return {
      predictedEngagement: "high",
      completionProbability: momentum.completionProbability,
      suggestions: [
        `Energy level: ${Math.round(circadian.energyLevel * 100)}% - ${recommendedIntensity} intensity recommended`,
        `${momentum.streakDays}-day workout streak!`
      ],
      intelligence: "advanced",
      timestamp: new Date(),
      
      // Custom fields
      recommendedIntensity,
      recommendedDuration: Math.round(circadian.energyLevel * 60),
    };
  }
}
*/

// ==================== EXAMPLE 5: API ROUTE USAGE ====================

/**
 * Next.js API route example
 */
/*
// /app/api/courses/[id]/predict/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { Intelligence } from "@/lib/intelligence";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get("lessonId");
  const courseLevel = searchParams.get("level") || "intermediate";

  if (!lessonId) {
    return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });
  }

  const prediction = await Intelligence.courses.predict(
    session.user.id,
    params.id,
    parseInt(lessonId),
    courseLevel as any
  );

  return NextResponse.json({
    success: true,
    prediction,
    intelligence: "advanced",
  });
}
*/

// ==================== EXAMPLE 6: UI COMPONENT USAGE ====================

/**
 * React component example
 */
/*
"use client";
import { useEffect, useState } from "react";
import { CoursePrediction } from "@/lib/intelligence";

export function CourseIntelligencePanel({ 
  courseId, 
  lessonId 
}: { 
  courseId: string; 
  lessonId: number; 
}) {
  const [prediction, setPrediction] = useState<CoursePrediction | null>(null);

  useEffect(() => {
    fetch(`/api/courses/${courseId}/predict?lessonId=${lessonId}`)
      .then(res => res.json())
      .then(data => setPrediction(data.prediction));
  }, [courseId, lessonId]);

  if (!prediction) return <div>Loading intelligence...</div>;

  return (
    <div className="intelligence-panel">
      <h3>Learning Insights</h3>
      
      <div className="metrics">
        <div>Focus Level: {Math.round(prediction.focusLevel! * 100)}%</div>
        <div>Cognitive Load: {prediction.cognitiveLoad}%</div>
        <div>Estimated Time: {prediction.estimatedCompletionTime} min</div>
        <div>Streak: {prediction.streakDays} days 🔥</div>
      </div>

      <div className="suggestions">
        {prediction.suggestions.map((s, i) => (
          <div key={i}>→ {s}</div>
        ))}
      </div>
    </div>
  );
}
*/

// ==================== EXAMPLE 7: CROSS-FEATURE ANALYTICS ====================

/**
 * Get user's complete learning pattern across all features
 */
async function getUserLearningProfile(userId: string) {
  // Get predictions from multiple features
  const [bookPrediction, coursePrediction] = await Promise.all([
    Intelligence.books.predict(userId, "sample-book", 1),
    Intelligence.courses.predict(userId, "sample-course", 1),
  ]);

  // Analyze cross-feature patterns
  return {
    overallMomentum: Math.max(
      bookPrediction.momentumScore || 0,
      coursePrediction.momentumScore || 0
    ),
    totalStreakDays:
      (bookPrediction.streakDays || 0) + (coursePrediction.streakDays || 0),
    peakLearningWindow: bookPrediction.focusWindowDetected,
    recommendedActivities: [
      ...bookPrediction.suggestions,
      ...coursePrediction.suggestions,
    ],
  };
}

export {
  getBookPredictions,
  trackBookReading,
  getCoursePredictions,
  trackCourseLesson,
  trackCommunityPost,
  getUserLearningProfile,
};
