/**
 * API ROUTE: Get Ledger Balance
 * GET /api/ledger/balance
 *
 * Get user's ledger balance (instructor or student account)
 * Returns balance in cents (always computed from entries, never cached)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import {
  getInstructorAccount,
  getUserAccount,
  getBalanceCents,
  getAccountHistory,
} from "@/lib/ledger/accounts";

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const currency = searchParams.get("currency") || "USD";
    const includeHistory = searchParams.get("history") === "true";

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is instructor
    const instructor = await prisma.instructor.findUnique({
      where: { userId: user.id },
    });

    // Get appropriate account
    const account = instructor
      ? await getInstructorAccount(instructor.id, currency)
      : await getUserAccount(user.id, currency);

    // Get balance (computed from entries)
    const balanceCents = await getBalanceCents(account.id);

    const response: any = {
      accountId: account.id,
      accountType: account.kind,
      currency: account.currency,
      balanceCents,
      balanceDollars: balanceCents / 100,
    };

    // Include transaction history if requested
    if (includeHistory) {
      const history = await getAccountHistory(account.id, 50);
      response.history = history;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error getting balance:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get balance" },
      { status: 500 }
    );
  }
}
