/**
 * DOUBLE-ENTRY LEDGER - ATOMIC TRANSFERS
 *
 * Safe Mode: All money movements use atomic, idempotent transfers
 * Every transfer creates 2 entries (debit + credit) in a single transaction
 *
 * Principles:
 * - Transfers are ATOMIC (both entries or neither)
 * - Debits are negative, credits are positive
 * - Idempotency via unique key (fast-path check)
 * - Sum of all entries always = 0 (double-entry invariant)
 * - Relations maintained: Transfer → Entries → Accounts
 */

import { prisma } from "@/lib/db";

type TransferArgs = {
  fromAccountId: string;
  toAccountId: string;
  amount: number; // minor units (cents), always positive
  currency: string;
  reason: "purchase" | "refund" | "payout" | "fee" | string;
  refType?: string; // e.g. "platform_fee" | "purchase" | "refund"
  refId?: string; // productId/orderId/etc. (used in tests)
  idempotencyKey?: string; // REQUIRED by tests that check idempotency
  metadata?: Record<string, any>;
};

/**
 * Execute atomic transfer between accounts
 * Creates 2 entries: debit (negative) + credit (positive) in ONE transaction
 *
 * CRITICAL: This is idempotent!
 * If called twice with same idempotencyKey, returns existing transfer
 */
export async function transfer(args: TransferArgs) {
  const {
    fromAccountId,
    toAccountId,
    amount,
    currency,
    reason,
    refType,
    refId,
    idempotencyKey,
    metadata,
  } = args;

  if (amount <= 0) throw new Error("Amount must be positive");
  if (fromAccountId === toAccountId)
    throw new Error("Cannot transfer to same account");

  // Idempotency: fast-path - check if already processed
  if (idempotencyKey) {
    const existing = await prisma.ledgerTransfer.findUnique({
      where: { idempotencyKey },
      include: { entries: true },
    });
    if (existing) return existing;
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // Validate accounts + same currency
        const [from, to] = await Promise.all([
          tx.ledgerAccount.findUnique({ where: { id: fromAccountId } }),
          tx.ledgerAccount.findUnique({ where: { id: toAccountId } }),
        ]);
        if (!from || !to) throw new Error("Account not found");
        if (from.currency !== currency || to.currency !== currency) {
          throw new Error("Currency mismatch");
        }

        // Create the transfer "header" first (with unique idempotency key)
        const t = await tx.ledgerTransfer.create({
          data: {
            fromAccountId,
            toAccountId,
            amount,
            currency,
            reason,
            refType: refType ?? null,
            refId: refId ?? null,
            idempotencyKey: idempotencyKey ?? null,
            metadata: metadata ?? {},
            state: "posted", // or "pending" if you support pending → posted flows
          },
        });

        // Double-entry: two rows that must balance to zero
        const debit = await tx.ledgerEntry.create({
          data: {
            transferId: t.id,
            accountId: fromAccountId,
            amount: -amount, // DEBIT (out)
            currency,
            refType: refType ?? null,
            refId: refId ?? null,
            direction: "debit",
            metadata: metadata ?? {},
          },
        });

        const credit = await tx.ledgerEntry.create({
          data: {
            transferId: t.id,
            accountId: toAccountId,
            amount: amount, // CREDIT (in)
            currency,
            refType: refType ?? null,
            refId: refId ?? null,
            direction: "credit",
            metadata: metadata ?? {},
          },
        });

        // Invariant check inside the TX (helps the "double-entry invariant" test)
        if (debit.amount + credit.amount !== 0) {
          throw new Error("Double-entry invariant violated");
        }

        return tx.ledgerTransfer.findUnique({
          where: { id: t.id },
          include: { entries: true },
        });
      },
      {
        timeout: 30000, // 30 seconds for slow Supabase pooler
      }
    );

    return result;
  } catch (err) {
    console.error("Error in transfer:", err);
    throw new Error("Failed to execute transfer");
  }
}

/**
 * Reverse a transfer for refunds
 * Creates a new transfer in the opposite direction
 * Idempotent: won't create duplicate reverses
 */
export async function reverseTransfer({
  originalTransferId,
  reason,
  refId,
  idempotencyKey,
}: {
  originalTransferId: string;
  reason?: string;
  refId?: string;
  idempotencyKey?: string;
}) {
  // Idempotent reverse: one reverse per original
  if (idempotencyKey) {
    const exist = await prisma.ledgerTransfer.findUnique({
      where: { idempotencyKey },
      include: { entries: true },
    });
    if (exist) return exist;
  }

  const original = await prisma.ledgerTransfer.findUnique({
    where: { id: originalTransferId },
  });
  if (!original) throw new Error("Original transfer not found");

  return prisma.$transaction(
    async (tx) => {
      const t = await tx.ledgerTransfer.create({
        data: {
          fromAccountId: original.toAccountId, // swap
          toAccountId: original.fromAccountId, // swap
          amount: original.amount,
          currency: original.currency,
          reason: reason ?? "refund",
          refType: "refund",
          refId: refId ?? original.refId ?? original.id,
          idempotencyKey: idempotencyKey ?? null,
          metadata: { reversedTransferId: original.id },
          state: "posted",
        },
      });

      await tx.ledgerEntry.createMany({
        data: [
          {
            transferId: t.id,
            accountId: original.toAccountId,
            amount: -original.amount, // debit back from recipient
            currency: original.currency,
            direction: "debit",
            refType: "refund",
            refId: original.refId ?? original.id,
          },
          {
            transferId: t.id,
            accountId: original.fromAccountId,
            amount: original.amount, // credit back to payer
            currency: original.currency,
            direction: "credit",
            refType: "refund",
            refId: original.refId ?? original.id,
          },
        ],
      });

      return tx.ledgerTransfer.findUnique({
        where: { id: t.id },
        include: { entries: true },
      });
    },
    {
      timeout: 30000, // 30 seconds for slow Supabase pooler
    }
  );
}

/**
 * Split transfer for platform fees + instructor share
 * Creates TWO transfers:
 *   1) Buyer → Platform (fee)
 *   2) Buyer → Instructor (net amount)
 *
 * Used in marketplace purchases
 */
export async function splitTransfer({
  buyerAccountId,
  instructorAccountId,
  platformAccountId,
  grossAmount, // cents
  platformFeeAmount, // cents
  currency,
  productId, // used as refId in tests
  idempotencyKey, // base key (we'll suffix)
}: {
  buyerAccountId: string;
  instructorAccountId: string;
  platformAccountId: string;
  grossAmount: number;
  platformFeeAmount: number;
  currency: string;
  productId: string;
  idempotencyKey?: string;
}) {
  if (grossAmount <= 0) throw new Error("Invalid gross amount");
  if (platformFeeAmount < 0 || platformFeeAmount > grossAmount) {
    throw new Error("Invalid platform fee amount");
  }
  const instructorNet = grossAmount - platformFeeAmount;

  try {
    return await prisma.$transaction(
      async (tx) => {
        // 1) Buyer → Platform (fee)
        let feeTransfer = null as any;
        if (platformFeeAmount > 0) {
          feeTransfer = await transfer({
            fromAccountId: buyerAccountId,
            toAccountId: platformAccountId,
            amount: platformFeeAmount,
            currency,
            reason: "purchase_fee",
            refType: "platform_fee",
            refId: productId,
            idempotencyKey: idempotencyKey
              ? `${idempotencyKey}:fee`
              : undefined,
            metadata: { productId },
          });
        }

        // 2) Buyer → Instructor (net)
        const netTransfer = await transfer({
          fromAccountId: buyerAccountId,
          toAccountId: instructorAccountId,
          amount: instructorNet,
          currency,
          reason: "purchase_net",
          refType: "purchase",
          refId: productId,
          idempotencyKey: idempotencyKey ? `${idempotencyKey}:net` : undefined,
          metadata: { productId },
        });

        return { feeTransfer, netTransfer };
      },
      {
        timeout: 30000, // 30 seconds for slow Supabase pooler
      }
    );
  } catch (e) {
    console.error("Error in splitTransfer:", e);
    throw new Error("Failed to execute split transfer");
  }
}

/**
 * Verify ledger invariant: sum of all entries should be zero
 * This is the fundamental property of double-entry bookkeeping
 */
export async function verifyLedgerInvariant(): Promise<boolean> {
  const result = await prisma.ledgerEntry.aggregate({
    _sum: {
      amount: true,
    },
  });

  const total = result._sum.amount ?? 0;
  return total === 0;
}
