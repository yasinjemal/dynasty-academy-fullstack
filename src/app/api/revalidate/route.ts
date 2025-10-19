/**
 * 🔄 Next.js ISR Revalidation API
 *
 * Revalidates cached pages on-demand after content updates
 * Secured with REVALIDATE_TOKEN environment variable
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    // 1. Check for secret token
    const token = request.nextUrl.searchParams.get("token");
    const expectedToken = process.env.REVALIDATE_TOKEN;

    if (!expectedToken) {
      return NextResponse.json(
        { error: "REVALIDATE_TOKEN not configured" },
        { status: 500 }
      );
    }

    if (token !== expectedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2. Get path to revalidate
    const path = request.nextUrl.searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "Missing path parameter" },
        { status: 400 }
      );
    }

    // 3. Revalidate the path
    revalidatePath(path);

    return NextResponse.json({
      success: true,
      path,
      revalidated: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      {
        error: "Revalidation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
