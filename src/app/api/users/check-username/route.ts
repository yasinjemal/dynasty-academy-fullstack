import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Validate format
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json(
        {
          available: false,
          error: "Invalid username format",
        },
        { status: 200 }
      );
    }

    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({
        available: false,
        reason: "Username is already taken",
      });
    }

    // Check if username is in redirects (recently changed from)
    const redirect = await prisma.usernameRedirect.findFirst({
      where: {
        from: username,
        expiresAt: { gt: new Date() },
      },
    });

    if (redirect) {
      return NextResponse.json({
        available: false,
        reason: "Username is temporarily reserved",
      });
    }

    return NextResponse.json({
      available: true,
      message: "Username is available",
    });
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json(
      { error: "Failed to check username availability" },
      { status: 500 }
    );
  }
}
