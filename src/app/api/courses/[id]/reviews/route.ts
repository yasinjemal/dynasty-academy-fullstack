import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

// GET /api/courses/[id]/reviews - Fetch all reviews for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const filterStars = searchParams.get("stars");
    const sortBy = searchParams.get("sortBy") || "recent"; // recent, helpful, highest, lowest

    // TODO: Replace with actual Prisma query
    // const reviews = await prisma.courseReview.findMany({
    //   where: {
    //     courseId: params.id,
    //     ...(filterStars && { rating: parseInt(filterStars) }),
    //   },
    //   include: {
    //     user: {
    //       select: {
    //         name: true,
    //         image: true,
    //       }
    //     },
    //     helpful: true,
    //   },
    //   orderBy: sortBy === 'helpful' ? { helpful: { _count: 'desc' } }
    //     : sortBy === 'highest' ? { rating: 'desc' }
    //     : sortBy === 'lowest' ? { rating: 'asc' }
    //     : { createdAt: 'desc' }
    // });

    // Mock data
    const mockReviews = [
      {
        id: "1",
        userId: "user1",
        userName: "Alex Johnson",
        userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        rating: 5,
        title: "Absolutely phenomenal course!",
        comment:
          "This course exceeded all my expectations. The instructor's teaching style is clear and engaging, and the practical examples really helped me understand the concepts deeply. I've already started applying what I learned in my projects.",
        courseCompleted: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        helpfulCount: 24,
        hasUserMarkedHelpful: false,
      },
      {
        id: "2",
        userId: "user2",
        userName: "Sarah Chen",
        userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        rating: 4,
        title: "Great content, could use more advanced topics",
        comment:
          "Really solid course overall. The fundamentals are explained very well. I'd love to see a follow-up course that goes deeper into advanced patterns and real-world architecture.",
        courseCompleted: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        helpfulCount: 18,
        hasUserMarkedHelpful: true,
      },
      {
        id: "3",
        userId: "user3",
        userName: "Michael Rodriguez",
        userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
        rating: 5,
        title: "Best investment in my learning journey",
        comment:
          "I've taken dozens of online courses, and this one stands out. The pacing is perfect, the production quality is top-notch, and the community support is amazing. Worth every penny!",
        courseCompleted: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        helpfulCount: 31,
        hasUserMarkedHelpful: false,
      },
      {
        id: "4",
        userId: "user4",
        userName: "Emily Thompson",
        userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
        rating: 4,
        title: "Excellent for beginners and intermediates",
        comment:
          "Perfect course if you're starting out or want to solidify your understanding. The step-by-step approach makes complex topics accessible. Would recommend to anyone starting their journey.",
        courseCompleted: false,
        createdAt: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
        helpfulCount: 15,
        hasUserMarkedHelpful: false,
      },
      {
        id: "5",
        userId: "user5",
        userName: "David Park",
        userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        rating: 5,
        title: "Career-changing course",
        comment:
          "This course literally changed my career trajectory. I landed my dream job just 2 months after completing it. The practical projects in this course became the centerpiece of my portfolio. Thank you!",
        courseCompleted: true,
        createdAt: new Date(
          Date.now() - 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date(
          Date.now() - 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
        helpfulCount: 42,
        hasUserMarkedHelpful: true,
      },
      {
        id: "6",
        userId: "user6",
        userName: "Jessica Williams",
        userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
        rating: 3,
        title: "Good but a bit outdated",
        comment:
          "The content is solid, but some of the libraries and frameworks covered have newer versions now. Would be great if the course was updated to reflect the latest best practices.",
        courseCompleted: true,
        createdAt: new Date(
          Date.now() - 20 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date(
          Date.now() - 20 * 24 * 60 * 60 * 1000
        ).toISOString(),
        helpfulCount: 8,
        hasUserMarkedHelpful: false,
      },
    ];

    // Apply filters
    let filteredReviews = mockReviews;
    if (filterStars) {
      filteredReviews = mockReviews.filter(
        (r) => r.rating === parseInt(filterStars)
      );
    }

    // Apply sorting
    if (sortBy === "helpful") {
      filteredReviews.sort((a, b) => b.helpfulCount - a.helpfulCount);
    } else if (sortBy === "highest") {
      filteredReviews.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "lowest") {
      filteredReviews.sort((a, b) => a.rating - b.rating);
    }
    // 'recent' is already the default order

    return NextResponse.json({ reviews: filteredReviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/reviews - Submit a new review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { rating, title, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (!comment || comment.trim().length < 10) {
      return NextResponse.json(
        { error: "Review comment must be at least 10 characters" },
        { status: 400 }
      );
    }

    // TODO: Replace with actual Prisma transaction
    // // Check if user completed the course
    // const enrollment = await prisma.enrollment.findUnique({
    //   where: {
    //     userId_courseId: {
    //       userId: session.user.id,
    //       courseId: params.id,
    //     }
    //   }
    // });

    // if (!enrollment || enrollment.progress < 100) {
    //   return NextResponse.json(
    //     { error: 'You must complete the course before leaving a review' },
    //     { status: 403 }
    //   );
    // }

    // // Check if user already reviewed
    // const existingReview = await prisma.courseReview.findUnique({
    //   where: {
    //     userId_courseId: {
    //       userId: session.user.id,
    //       courseId: params.id,
    //     }
    //   }
    // });

    // if (existingReview) {
    //   // Update existing review
    //   const updated = await prisma.courseReview.update({
    //     where: { id: existingReview.id },
    //     data: { rating, title, comment, updatedAt: new Date() }
    //   });
    //   return NextResponse.json({ review: updated, updated: true });
    // }

    // // Create new review
    // const review = await prisma.courseReview.create({
    //   data: {
    //     userId: session.user.id,
    //     courseId: params.id,
    //     rating,
    //     title: title || '',
    //     comment,
    //     courseCompleted: true,
    //   },
    //   include: {
    //     user: {
    //       select: { name: true, image: true }
    //     }
    //   }
    // });

    // Mock response
    const mockReview = {
      id: `review_${Date.now()}`,
      userId: session.user.id,
      userName: session.user.name || "Anonymous",
      userImage:
        session.user.image ||
        "https://api.dicebear.com/7.x/avataaars/svg?seed=User",
      rating,
      title: title || "",
      comment,
      courseCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      helpfulCount: 0,
      hasUserMarkedHelpful: false,
    };

    return NextResponse.json({
      review: mockReview,
      message: "Review submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
