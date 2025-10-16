import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { answers, result } = await request.json();

    // Save assessment to user profile
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        onboarding_completed: true,
        skill_level: result.level,
        learning_goals: result.focusAreas,
        daily_commitment: result.dailyCommitment,
        target_timeline: result.estimatedTime,
        recommended_path: result.recommendedPath,
        assessment_data: answers,
        assessment_completed_at: new Date(),
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error saving assessment:", error);
    return NextResponse.json(
      { error: "Failed to save assessment" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        onboarding_completed: true,
        skill_level: true,
        learning_goals: true,
        daily_commitment: true,
        target_timeline: true,
        recommended_path: true,
        assessment_completed_at: true,
      },
    });

    return NextResponse.json({ assessment: user });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}
