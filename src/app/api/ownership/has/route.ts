/**
 * API ROUTE: Check Product Ownership
 * GET /api/ownership/has?productId=xxx
 *
 * Checks if user owns a product
 * Used for access control and showing "Already Owned" badge
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get product ID from query
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID required" },
        { status: 400 }
      );
    }

    // Check ownership
    const ownership = await prisma.ownership.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    const hasAccess = ownership && !ownership.revokedAt;

    return NextResponse.json({
      hasAccess,
      ownership: hasAccess
        ? {
            grantedAt: ownership.grantedAt,
            source: ownership.source,
          }
        : null,
    });
  } catch (error: any) {
    console.error("Error checking ownership:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check ownership" },
      { status: 500 }
    );
  }
}
