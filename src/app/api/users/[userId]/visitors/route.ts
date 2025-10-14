import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";

/**
 * GET /api/users/:userId/visitors?limit=20
 * 
 * Returns list of profile visitors:
 * - Recent visitors (last 24 hours)
 * - Older visitors
 * - Visitor details (username, avatar, level, location)
 * - Visit timestamps
 * - Privacy-respecting (only profile owner can see)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    // Only allow profile owner to see visitors
    if (session?.user?.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized - You can only view your own visitors" },
        { status: 403 }
      );
    }

    // Get user to check if visitor tracking is enabled
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get recent visitors (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentVisits = await prisma.profileVisit.findMany({
      where: {
        profileId: userId,
        visitorId: { not: null }, // Exclude anonymous visits
        createdAt: { gte: oneDayAgo },
      },
      orderBy: { createdAt: "desc" },
      distinct: ["visitorId"], // Get unique visitors only
      take: limit,
    });

    // Get older visitors (beyond 24 hours)
    const olderVisits = await prisma.profileVisit.findMany({
      where: {
        profileId: userId,
        visitorId: { not: null },
        createdAt: { lt: oneDayAgo },
      },
      orderBy: { createdAt: "desc" },
      distinct: ["visitorId"],
      take: Math.max(limit - recentVisits.length, 0),
    });

    // Get visitor details
    const allVisitorIds = [
      ...recentVisits.map(v => v.visitorId),
      ...olderVisits.map(v => v.visitorId),
    ].filter((id): id is string => id !== null);

    const visitors = await prisma.user.findMany({
      where: {
        id: { in: allVisitorIds },
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        level: true,
        location: true,
      },
    });

    // Create visitor map
    const visitorMap = new Map(
      visitors.map(v => [v.id, v])
    );

    // Check if any visitors are following the profile owner
    const followingRelations = await prisma.follow.findMany({
      where: {
        followerId: { in: allVisitorIds },
        followingId: userId,
      },
      select: {
        followerId: true,
      },
    });

    const followingSet = new Set(
      followingRelations.map(f => f.followerId)
    );

    // Format recent visitors
    const recentVisitorsFormatted = recentVisits
      .map(visit => {
        if (!visit.visitorId) return null;
        const visitor = visitorMap.get(visit.visitorId);
        if (!visitor) return null;

        const timeSinceVisit = Date.now() - visit.createdAt.getTime();
        const minutesAgo = Math.floor(timeSinceVisit / (1000 * 60));
        const hoursAgo = Math.floor(timeSinceVisit / (1000 * 60 * 60));

        let timeAgo;
        if (minutesAgo < 1) timeAgo = "Just now";
        else if (minutesAgo < 60) timeAgo = `${minutesAgo}m ago`;
        else timeAgo = `${hoursAgo}h ago`;

        return {
          id: visitor.id,
          username: visitor.username,
          name: visitor.name,
          image: visitor.image,
          level: visitor.level,
          location: visitor.location,
          visitedAt: visit.createdAt,
          timeAgo,
          isNew: visit.isUnique,
          isFollowing: followingSet.has(visitor.id),
        };
      })
      .filter(Boolean);

    // Format older visitors
    const olderVisitorsFormatted = olderVisits
      .map(visit => {
        if (!visit.visitorId) return null;
        const visitor = visitorMap.get(visit.visitorId);
        if (!visitor) return null;

        const timeSinceVisit = Date.now() - visit.createdAt.getTime();
        const daysAgo = Math.floor(timeSinceVisit / (1000 * 60 * 60 * 24));

        let timeAgo;
        if (daysAgo === 0) timeAgo = "Today";
        else if (daysAgo === 1) timeAgo = "Yesterday";
        else if (daysAgo < 7) timeAgo = `${daysAgo}d ago`;
        else if (daysAgo < 30) timeAgo = `${Math.floor(daysAgo / 7)}w ago`;
        else timeAgo = `${Math.floor(daysAgo / 30)}mo ago`;

        return {
          id: visitor.id,
          username: visitor.username,
          name: visitor.name,
          image: visitor.image,
          level: visitor.level,
          location: visitor.location,
          visitedAt: visit.createdAt,
          timeAgo,
          isNew: visit.isUnique,
          isFollowing: followingSet.has(visitor.id),
        };
      })
      .filter(Boolean);

    // Get total view count and unique visitors
    const totalViews = await prisma.profileVisit.count({
      where: { profileId: userId },
    });

    const uniqueVisitorsCount = await prisma.profileVisit.groupBy({
      by: ["visitorId"],
      where: {
        profileId: userId,
        visitorId: { not: null },
      },
    });

    return NextResponse.json({
      totalViews,
      uniqueVisitors: uniqueVisitorsCount.length,
      recent: recentVisitorsFormatted,
      older: olderVisitorsFormatted,
    });

  } catch (error) {
    console.error("Error fetching visitors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/:userId/visit
 * 
 * Log a profile visit
 * This should be called when someone views a profile
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: profileId } = await params;
    const session = await getServerSession(authOptions);

    // Don't log visits to own profile
    if (session?.user?.id === profileId) {
      return NextResponse.json({
        success: true,
        message: "Own profile - not logged",
      });
    }

    // Get visitor ID (null for anonymous)
    const visitorId = session?.user?.id || null;

    // Get IP address for rate limiting (hashed for privacy)
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    // Check if this is a unique visit today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingVisitToday = await prisma.profileVisit.findFirst({
      where: {
        profileId,
        ...(visitorId ? { visitorId } : { ipHash }),
        createdAt: { gte: today },
      },
    });

    const isUnique = !existingVisitToday;

    // Log the visit
    await prisma.profileVisit.create({
      data: {
        profileId,
        visitorId,
        ipHash,
        isUnique,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Visit logged",
      isUnique,
    });

  } catch (error) {
    console.error("Error logging visit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
