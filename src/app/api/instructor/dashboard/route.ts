import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

interface CourseEnrollment {
  enrolledAt: Date;
  users: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface CourseReview {
  rating: Decimal;
}

interface CourseWithRelations {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  price: Decimal;
  status: string | null;
  course_enrollments: CourseEnrollment[];
  course_reviews: CourseReview[];
  _count: {
    course_enrollments: number;
    course_lessons: number;
    course_reviews: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch instructor's courses with stats
    const courses = await prisma.courses.findMany({
      where: { 
        authorId: userId,
      },
      include: {
        course_enrollments: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { enrolledAt: "desc" },
          take: 10,
        },
        course_reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            course_enrollments: true,
            course_lessons: true,
            course_reviews: true,
          },
        },
      },
    }) as unknown as CourseWithRelations[];

    // Calculate stats
    const totalStudents = courses.reduce(
      (acc: number, course: CourseWithRelations) => acc + course._count.course_enrollments,
      0
    );

    const allRatings = courses.flatMap((course: CourseWithRelations) =>
      course.course_reviews.map((r: CourseReview) => Number(r.rating))
    );
    const averageRating =
      allRatings.length > 0
        ? allRatings.reduce((a: number, b: number) => a + b, 0) / allRatings.length
        : 0;

    // Get recent enrollments across all courses
    const recentEnrollments = courses
      .flatMap((course: CourseWithRelations) =>
        course.course_enrollments.map((enrollment: CourseEnrollment) => ({
          studentName: enrollment.users.name || "Anonymous",
          studentImage: enrollment.users.image,
          courseName: course.title,
          courseSlug: course.slug,
          date: enrollment.enrolledAt,
          amount: Number(course.price) || 0,
        }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Calculate revenue (mock for now - would need payment integration)
    const totalRevenue = courses.reduce(
      (acc: number, course: CourseWithRelations) => acc + (Number(course.price) || 0) * course._count.course_enrollments,
      0
    );

    // Mock monthly revenue (would calculate from actual transactions)
    const monthlyRevenue = Math.round(totalRevenue * 0.3);

    // Course performance data
    const coursePerformance = courses.map((course: CourseWithRelations) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      thumbnail: course.coverImage,
      students: course._count.course_enrollments,
      lessons: course._count.course_lessons,
      reviews: course._count.course_reviews,
      rating:
        course.course_reviews.length > 0
          ? course.course_reviews.reduce((a: number, r: CourseReview) => a + Number(r.rating), 0) /
            course.course_reviews.length
          : 0,
      revenue: (Number(course.price) || 0) * course._count.course_enrollments,
      status: course.status === "published" ? "published" : "draft",
    }));

    // Trust score calculation (simplified version for API)
    const trustScore = calculateSimpleTrustScore(
      totalStudents,
      averageRating,
      courses.length
    );

    return NextResponse.json({
      stats: {
        totalRevenue,
        monthlyRevenue,
        totalStudents,
        activeCourses: courses.filter((c: CourseWithRelations) => c.status === "published").length,
        draftCourses: courses.filter((c: CourseWithRelations) => c.status !== "published").length,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: allRatings.length,
        totalLessons: courses.reduce((acc: number, c: CourseWithRelations) => acc + c._count.course_lessons, 0),
      },
      recentEnrollments,
      coursePerformance,
      trustScore,
    });
  } catch (error) {
    console.error("Instructor dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

function calculateSimpleTrustScore(
  students: number,
  rating: number,
  courses: number
) {
  // Simplified trust score calculation
  const contentScore = Math.min(300, courses * 30 + rating * 40);
  const engagementScore = Math.min(200, students * 0.5);
  const reliabilityScore = Math.min(200, 100 + courses * 20);
  const communityScore = Math.min(150, students * 0.1);
  const complianceScore = 100; // Default compliance

  const totalScore = Math.min(
    1000,
    contentScore + engagementScore + reliabilityScore + communityScore + complianceScore
  );

  const tier =
    totalScore >= 950
      ? "Legendary"
      : totalScore >= 800
      ? "Elite"
      : totalScore >= 500
      ? "Trusted"
      : totalScore >= 200
      ? "Verified"
      : "Unverified";

  const revenueShare =
    tier === "Legendary"
      ? 0.95
      : tier === "Elite"
      ? 0.9
      : tier === "Trusted"
      ? 0.8
      : tier === "Verified"
      ? 0.7
      : 0.5;

  return {
    totalScore,
    tier,
    breakdown: {
      contentQuality: contentScore,
      engagement: engagementScore,
      reliability: reliabilityScore,
      community: communityScore,
      compliance: complianceScore,
    },
    multipliers: {
      revenueShare,
      visibility: tier === "Legendary" ? 5 : tier === "Elite" ? 3 : tier === "Trusted" ? 2 : 1,
      moderationThreshold: totalScore >= 800 ? 90 : totalScore >= 500 ? 70 : 50,
    },
  };
}
