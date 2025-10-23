import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { getAuditStats } from "@/lib/governance/audit";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = (searchParams.get("timeframe") || "week") as
      | "day"
      | "week"
      | "month";

    const stats = await getAuditStats(timeframe);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching audit stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit stats" },
      { status: 500 }
    );
  }
}
