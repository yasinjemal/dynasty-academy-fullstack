import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { getAllAuditLogs } from "@/lib/governance/audit";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entity = searchParams.get("entity") || undefined;
    const action = searchParams.get("action") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const result = await getAllAuditLogs(
      {
        entity: entity as any,
        action: action as any,
      },
      page,
      limit
    );

    return NextResponse.json({
      success: true,
      logs: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
