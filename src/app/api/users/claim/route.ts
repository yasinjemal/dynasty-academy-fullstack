import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

const USERNAME_CHANGE_COOLDOWN_DAYS = 30;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    // Validate username format
    const usernameRegex = /^[a-z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be 3-20 characters, lowercase letters, numbers, and underscores only",
        },
        { status: 400 }
      );
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        username: true,
        usernameChangedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check cooldown
    if (user.username && user.usernameChangedAt) {
      const daysSinceChange =
        (Date.now() - user.usernameChangedAt.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceChange < USERNAME_CHANGE_COOLDOWN_DAYS) {
        const daysRemaining = Math.ceil(
          USERNAME_CHANGE_COOLDOWN_DAYS - daysSinceChange
        );
        return NextResponse.json(
          {
            error: `You can change your username again in ${daysRemaining} days`,
          },
          { status: 400 }
        );
      }
    }

    // Check availability
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // Update username and create redirect
    const oldUsername = user.username;

    await prisma.$transaction(async (tx) => {
      // Update user
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          username,
          usernameChangedAt: new Date(),
        },
      });

      // Create redirect if there was an old username
      if (oldUsername) {
        await tx.usernameRedirect.create({
          data: {
            from: oldUsername,
            to: username,
            userId: session.user.id,
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      username,
      message: oldUsername
        ? "Username updated successfully. Old username will redirect for 14 days."
        : "Username claimed successfully!",
    });
  } catch (error) {
    console.error("Error claiming username:", error);
    return NextResponse.json(
      { error: "Failed to claim username" },
      { status: 500 }
    );
  }
}
