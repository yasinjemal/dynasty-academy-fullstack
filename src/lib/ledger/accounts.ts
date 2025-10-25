/**
 * DOUBLE-ENTRY LEDGER - ACCOUNT MANAGEMENT
 *
 * Safe Mode: Non-custodial accounting system
 * All balances derived from Entry sum (never cached)
 *
 * Principles:
 * - Every account has ONE currency
 * - Balance = sum of all Entry.amount for that account
 * - Never store balances directly (always compute)
 */

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type AccountKind = "platform" | "instructor" | "user";

export interface Account {
  id: string;
  ownerId: string | null;
  kind: AccountKind;
  currency: string;
}

/**
 * Get or create account for a user/entity
 * Idempotent: safe to call multiple times
 */
export async function getOrCreateAccount({
  ownerId = null,
  kind,
  currency = "USD",
}: {
  ownerId?: string | null;
  kind: AccountKind;
  currency?: string;
}): Promise<Account> {
  try {
    // Try to find existing account
    const existing = ownerId
      ? await prisma.ledgerAccount.findUnique({
          where: {
            ownerId_kind_currency: {
              ownerId,
              kind,
              currency,
            },
          },
        })
      : await prisma.ledgerAccount.findFirst({
          where: {
            ownerId: null,
            kind,
            currency,
          },
        });

    if (existing) {
      return existing;
    }

    // Create new account
    const account = await prisma.ledgerAccount.create({
      data: {
        ownerId,
        kind,
        currency,
      },
    });

    return account;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // Unique constraint triggered by concurrent creation; fetch the existing account instead
      const retry = ownerId
        ? await prisma.ledgerAccount.findUnique({
            where: {
              ownerId_kind_currency: {
                ownerId,
                kind,
                currency,
              },
            },
          })
        : await prisma.ledgerAccount.findFirst({
            where: {
              ownerId: null,
              kind,
              currency,
            },
          });

      if (retry) {
        return retry;
      }
    }

    if (!ownerId) {
      const fallback = await prisma.ledgerAccount.findFirst({
        where: {
          ownerId: null,
          kind,
          currency,
        },
      });

      if (fallback) {
        return fallback;
      }
    }

    console.error("Error in getOrCreateAccount:", error);
    throw new Error("Failed to get or create account");
  }
}

/**
 * Get account balance in cents
 * Always computed from Entry sum (never cached)
 */
export async function getBalanceCents(accountId: string): Promise<number> {
  try {
    const result = await prisma.ledgerEntry.aggregate({
      where: { accountId },
      _sum: { amount: true },
    });

    return result._sum.amount || 0;
  } catch (error) {
    console.error("Error in getBalanceCents:", error);
    throw new Error("Failed to get balance");
  }
}

/**
 * Get account balance in dollars (convenience)
 */
export async function getBalanceDollars(accountId: string): Promise<number> {
  const cents = await getBalanceCents(accountId);
  return cents / 100;
}

/**
 * Get platform revenue account (creates if doesn't exist)
 */
export async function getPlatformRevenueAccount(
  currency: string = "USD"
): Promise<Account> {
  return getOrCreateAccount({ kind: "platform", currency });
}

/**
 * Get instructor account (creates if doesn't exist)
 */
export async function getInstructorAccount(
  instructorId: string,
  currency: string = "USD"
): Promise<Account> {
  return getOrCreateAccount({
    ownerId: instructorId,
    kind: "instructor",
    currency,
  });
}

/**
 * Get user account (creates if doesn't exist)
 */
export async function getUserAccount(
  userId: string,
  currency: string = "USD"
): Promise<Account> {
  return getOrCreateAccount({ ownerId: userId, kind: "user", currency });
}

/**
 * Get account details with balance
 */
export async function getAccountWithBalance(accountId: string) {
  try {
    const account = await prisma.ledgerAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    const balanceCents = await getBalanceCents(accountId);

    return {
      ...account,
      balanceCents,
      balanceDollars: balanceCents / 100,
    };
  } catch (error) {
    console.error("Error in getAccountWithBalance:", error);
    throw error;
  }
}

/**
 * Get all accounts for a user
 */
export async function getUserAccounts(userId: string) {
  try {
    const accounts = await prisma.ledgerAccount.findMany({
      where: { ownerId: userId },
    });

    const accountsWithBalances = await Promise.all(
      accounts.map(async (account) => ({
        ...account,
        balanceCents: await getBalanceCents(account.id),
        balanceDollars: (await getBalanceCents(account.id)) / 100,
      }))
    );

    return accountsWithBalances;
  } catch (error) {
    console.error("Error in getUserAccounts:", error);
    throw new Error("Failed to get user accounts");
  }
}

/**
 * Get account transaction history
 */
export async function getAccountHistory(accountId: string, limit: number = 50) {
  try {
    const entries = await prisma.ledgerEntry.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return entries.map((entry) => ({
      id: entry.id,
      amount: entry.amount,
      amountDollars: entry.amount / 100,
      direction: entry.direction,
      refType: entry.refType,
      refId: entry.refId,
      createdAt: entry.createdAt,
      metadata: entry.metadata,
    }));
  } catch (error) {
    console.error("Error in getAccountHistory:", error);
    throw new Error("Failed to get account history");
  }
}
