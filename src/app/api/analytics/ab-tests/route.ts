/**
 * 🧪 A/B TESTING API
 * Experiment management
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createABTest,
  startABTest,
  pauseABTest,
  completeABTest,
  assignUserToVariant,
  getUserVariant,
  trackABTestConversion,
  getABTestResults,
  declareWinner,
  getActiveABTests,
} from "@/lib/analytics/ab-testing";

/**
 * POST /api/analytics/ab-tests - Create or manage A/B test
 * GET /api/analytics/ab-tests - Query tests
 */

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, testId, name, variants, metrics, allocation } = body;

    // Create new test (admin only)
    if (action === "create") {
      const user = await prisma?.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (user?.role !== "admin") {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }

      if (!name || !variants || variants.length < 2) {
        return NextResponse.json(
          { error: "Name and at least 2 variants required" },
          { status: 400 }
        );
      }

      const test = await createABTest({
        name,
        variants,
        metrics: metrics || ["conversion"],
        allocation: allocation || { control: 50, variant: 50 },
      });

      return NextResponse.json({ success: true, test });
    }

    // Start test (admin only)
    if (action === "start") {
      const user = await prisma?.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (user?.role !== "admin") {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }

      if (!testId) {
        return NextResponse.json(
          { error: "Test ID required" },
          { status: 400 }
        );
      }

      const test = await startABTest(testId);
      return NextResponse.json({ success: true, test });
    }

    // Pause test (admin only)
    if (action === "pause") {
      const user = await prisma?.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (user?.role !== "admin") {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }

      if (!testId) {
        return NextResponse.json(
          { error: "Test ID required" },
          { status: 400 }
        );
      }

      const test = await pauseABTest(testId);
      return NextResponse.json({ success: true, test });
    }

    // Declare winner (admin only)
    if (action === "declare_winner") {
      const user = await prisma?.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (user?.role !== "admin") {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }

      const { testId, metric } = body;
      if (!testId) {
        return NextResponse.json(
          { error: "Test ID required" },
          { status: 400 }
        );
      }

      const test = await declareWinner(testId, metric);
      return NextResponse.json({ success: true, test });
    }

    // Assign user to variant
    if (action === "assign") {
      if (!testId) {
        return NextResponse.json(
          { error: "Test ID required" },
          { status: 400 }
        );
      }

      const assignment = await assignUserToVariant(testId, session.user.id);
      return NextResponse.json({ success: true, assignment });
    }

    // Track conversion
    if (action === "convert") {
      const { testId, value } = body;
      if (!testId) {
        return NextResponse.json(
          { error: "Test ID required" },
          { status: 400 }
        );
      }

      await trackABTestConversion(testId, session.user.id, value);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("A/B test error:", error);
    return NextResponse.json(
      { error: error.message || "A/B test operation failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const testId = searchParams.get("testId");

    // Get user's variant for a test
    if (action === "variant" && testId) {
      const variant = await getUserVariant(testId, session.user.id);
      return NextResponse.json({ testId, variant });
    }

    // Get test results (admin only)
    if (action === "results" && testId) {
      const user = await prisma?.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (user?.role !== "admin") {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }

      const results = await getABTestResults(testId);
      return NextResponse.json({ testId, results });
    }

    // List active tests
    const activeTests = await getActiveABTests();
    return NextResponse.json({ tests: activeTests });
  } catch (error: any) {
    console.error("Get A/B tests error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get A/B tests" },
      { status: 500 }
    );
  }
}
