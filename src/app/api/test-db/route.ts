import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET() {
  const prisma = new PrismaClient();

  try {
    // Test each model
    const tests: Record<string, any> = {};

    // Test User xp field
    const userCount = await prisma.user.count();
    tests.users = userCount;

    // Test Streak model
    try {
      const streakCount = await (prisma as any).streak.count();
      tests.streaks = streakCount;
    } catch (e: any) {
      tests.streaks_error = e.message;
    }

    // Test EngagementScore model
    try {
      const scoreCount = await (prisma as any).engagementScore.count();
      tests.engagementScores = scoreCount;
    } catch (e: any) {
      tests.engagementScores_error = e.message;
    }

    // Test PersonalizationProfile model
    try {
      const profileCount = await (prisma as any).personalizationProfile.count();
      tests.personalizationProfiles = profileCount;
    } catch (e: any) {
      tests.personalizationProfiles_error = e.message;
    }

    // Test BehaviorEvent model
    try {
      const eventCount = await (prisma as any).behaviorEvent.count();
      tests.behaviorEvents = eventCount;
    } catch (e: any) {
      tests.behaviorEvents_error = e.message;
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      tests,
      availableModels: Object.keys(prisma).filter(
        (k) => !k.startsWith("_") && !k.startsWith("$")
      ),
    });
  } catch (error) {
    await prisma.$disconnect();
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
