"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { CoursePageData } from "@/lib/api/course-data";

// Dynamic imports for better code splitting
const CourseHero = dynamic(
  () => import("./CourseHero").then((mod) => ({ default: mod.CourseHero })),
  {
    loading: () => <div className="min-h-[70vh] bg-black animate-pulse" />,
  }
);

const CourseOverview = dynamic(
  () =>
    import("./CourseOverview").then((mod) => ({ default: mod.CourseOverview })),
  {
    loading: () => <div className="h-96 bg-black animate-pulse" />,
  }
);

const CourseCurriculum = dynamic(
  () =>
    import("./CourseCurriculum").then((mod) => ({
      default: mod.CourseCurriculum,
    })),
  {
    loading: () => <div className="h-96 bg-gray-900 animate-pulse" />,
  }
);

const InstructorProfile = dynamic(
  () =>
    import("./InstructorProfile").then((mod) => ({
      default: mod.InstructorProfile,
    })),
  {
    loading: () => <div className="h-64 bg-black animate-pulse" />,
  }
);

const CourseReviewsSection = dynamic(
  () =>
    import("./CourseReviewsSection").then((mod) => ({
      default: mod.CourseReviewsSection,
    })),
  {
    loading: () => <div className="h-96 bg-gray-900 animate-pulse" />,
  }
);

const RelatedCourses = dynamic(
  () =>
    import("./RelatedCourses").then((mod) => ({ default: mod.RelatedCourses })),
  {
    loading: () => <div className="h-64 bg-black animate-pulse" />,
  }
);

const StickyEnrollBar = dynamic(
  () =>
    import("./StickyEnrollBar").then((mod) => ({
      default: mod.StickyEnrollBar,
    })),
  { ssr: false }
);

interface CourseDetailClientProps {
  data: CoursePageData;
  userId?: string;
}

export function CourseDetailClient({ data, userId }: CourseDetailClientProps) {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);

  const handleEnroll = () => {
    if (data.isEnrolled) {
      // Go to learning page
      router.push(`/courses/${data.course.id}`);
    } else if (!userId) {
      // Redirect to login
      router.push(`/auth/signin?callbackUrl=/course/${data.course.slug}`);
    } else if (data.course.isFree) {
      // Free course - enroll directly
      enrollInCourse();
    } else {
      // Paid course - go to checkout
      router.push(`/checkout?courseId=${data.course.id}`);
    }
  };

  const enrollInCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${data.course.id}/enroll`, {
        method: "POST",
      });

      if (response.ok) {
        router.push(`/courses/${data.course.id}`);
      } else {
        console.error("Failed to enroll");
      }
    } catch (error) {
      console.error("Enrollment error:", error);
    }
  };

  const handlePreview = () => {
    if (data.course.previewVideo) {
      setShowPreview(true);
    }
  };

  const handlePreviewLesson = (lessonId: string) => {
    // Could open a modal or redirect to preview
    console.log("Preview lesson:", lessonId);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Sticky Enroll Bar */}
      <StickyEnrollBar
        course={data.course}
        isEnrolled={data.isEnrolled}
        onEnroll={handleEnroll}
      />

      {/* Hero Section */}
      <CourseHero
        course={data.course}
        isEnrolled={data.isEnrolled}
        userProgress={data.userProgress}
        onEnroll={handleEnroll}
        onPreview={handlePreview}
      />

      {/* Course Overview */}
      <CourseOverview
        description={data.course.description}
        whatYouWillLearn={data.course.whatYouWillLearn}
        requirements={data.course.requirements}
        targetAudience={data.course.targetAudience}
      />

      {/* Curriculum */}
      <CourseCurriculum
        sections={data.course.sections}
        isEnrolled={data.isEnrolled}
        onPreviewLesson={handlePreviewLesson}
      />

      {/* Instructor */}
      <InstructorProfile instructor={data.course.instructor} />

      {/* Reviews */}
      <CourseReviewsSection
        reviews={data.reviews}
        averageRating={data.course.stats.averageRating}
        totalReviews={data.course.stats.reviewCount}
      />

      {/* Related Courses */}
      <RelatedCourses courses={data.relatedCourses} />

      {/* Preview Modal (optional - can be implemented later) */}
      {showPreview && data.course.previewVideo && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
            >
              ✕
            </button>
            <iframe
              src={data.course.previewVideo.replace("watch?v=", "embed/")}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
