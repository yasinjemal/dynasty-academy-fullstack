import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

// POST - Schedule posts to be published over time
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { postIds, scheduleType, startDate, intervalDays } = body;

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { error: "Post IDs array is required" },
        { status: 400 }
      );
    }

    const start = startDate ? new Date(startDate) : new Date();
    const interval = intervalDays || 1; // Default: 1 day between posts

    // Schedule posts
    const scheduledPosts = [];

    for (let i = 0; i < postIds.length; i++) {
      const postId = postIds[i];
      const publishDate = new Date(start);

      if (scheduleType === "staggered") {
        // Stagger posts: publish one every X days
        publishDate.setDate(publishDate.getDate() + i * interval);
      } else if (scheduleType === "immediate") {
        // Publish all immediately
        publishDate.setTime(Date.now());
      } else if (scheduleType === "daily") {
        // One per day
        publishDate.setDate(publishDate.getDate() + i);
      } else if (scheduleType === "weekly") {
        // One per week
        publishDate.setDate(publishDate.getDate() + i * 7);
      }

      // Update post with scheduled publish date
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          published: publishDate <= new Date(), // Publish if date is now or past
          publishedAt: publishDate,
          updatedAt: new Date(),
        },
      });

      scheduledPosts.push(updatedPost);
    }

    return NextResponse.json({
      success: true,
      message: `Scheduled ${scheduledPosts.length} posts`,
      posts: scheduledPosts,
      scheduleType,
      startDate: start,
      intervalDays: interval,
    });
  } catch (error: any) {
    console.error("Error scheduling posts:", error);
    return NextResponse.json(
      { error: "Failed to schedule posts", details: error.message },
      { status: 500 }
    );
  }
}

// GET - Get scheduled posts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // Get all posts scheduled for future publication
    const scheduledPosts = await prisma.post.findMany({
      where: {
        published: false,
        publishedAt: {
          gt: new Date(),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        publishedAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      posts: scheduledPosts,
      totalScheduled: scheduledPosts.length,
    });
  } catch (error: any) {
    console.error("Error fetching scheduled posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheduled posts", details: error.message },
      { status: 500 }
    );
  }
}
