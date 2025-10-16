// 🚀 INTELLIGENCE SYSTEM - PUBLIC API
// Single entry point for all intelligence features

// Core exports
export { BaseIntelligence } from "./core/BaseIntelligence";
export * from "./core/types";

// Feature-specific intelligence engines
export {
  BookIntelligence,
  bookIntelligence,
} from "./features/BookIntelligence";
export {
  CourseIntelligence,
  courseIntelligence,
} from "./features/CourseIntelligence";

// Universal tracking
import { BaseIntelligence } from "./core/BaseIntelligence";
import { BehaviorData } from "./core/types";

/**
 * Universal Intelligence API
 * Use this for simple, feature-agnostic operations
 */
export const Intelligence = {
  /**
   * Track behavior for any feature
   * @example
   * Intelligence.track({
   *   userId: "...",
   *   activityType: "LISTENING_SESSION",
   *   entityId: "bookId",
   *   entitySubId: 1,
   *   sessionDuration: 300,
   *   completed: false
   * });
   */
  track: (data: BehaviorData) => BaseIntelligence.trackBehavior(data),

  /**
   * Quick access to feature engines
   */
  books: {
    predict: (userId: string, bookId: string, chapterId: number) => {
      const { bookIntelligence } = require("./features/BookIntelligence");
      return bookIntelligence.predict({
        userId,
        featureType: "BOOK" as const,
        entityId: bookId,
        entitySubId: chapterId,
      });
    },
  },

  courses: {
    predict: (
      userId: string,
      courseId: string,
      lessonId: number,
      courseLevel?: string
    ) => {
      const { courseIntelligence } = require("./features/CourseIntelligence");
      return courseIntelligence.predict({
        userId,
        featureType: "COURSE" as const,
        entityId: courseId,
        entitySubId: lessonId,
        metadata: { courseLevel },
      });
    },
  },

  // Add more feature shortcuts as needed
};
