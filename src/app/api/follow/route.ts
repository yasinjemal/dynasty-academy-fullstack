import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.$transaction([
        prisma.follow.delete({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: userId,
            },
          },
        }),
        prisma.user.update({
          where: { id: session.user.id },
          data: { followingCount: { decrement: 1 } },
        }),
        prisma.user.update({
          where: { id: userId },
          data: { followersCount: { decrement: 1 } },
        }),
      ]);

      return NextResponse.json({ following: false });
    } else {
      // Follow
      await prisma.$transaction([
        prisma.follow.create({
          data: {
            followerId: session.user.id,
            followingId: userId,
          },
        }),
        prisma.user.update({
          where: { id: session.user.id },
          data: { followingCount: { increment: 1 } },
        }),
        prisma.user.update({
          where: { id: userId },
          data: { followersCount: { increment: 1 } },
        }),
      ]);

      // Create notification
      await prisma.notification.create({
        data: {
          userId,
          type: "FOLLOW",
          title: "New Follower",
          message: `${session.user.name || "Someone"} started following you`,
          link: `/@${session.user.username || session.user.id}`,
          actorId: session.user.id,
        },
      });

      return NextResponse.json({ following: true });
    }
  } catch (error) {
    console.error("Error toggling follow:", error);
    return NextResponse.json(
      { error: "Failed to toggle follow" },
      { status: 500 }
    );
  }
}
