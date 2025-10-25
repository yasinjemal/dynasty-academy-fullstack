/**
 * LEDGER SYSTEM TESTS
 *
 * Tests for double-entry accounting system
 * - Account creation
 * - Balance computation
 * - Atomic transfers
 * - Idempotency
 * - Double-entry invariant
 */

import { describe, it, expect, afterEach, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import {
  getOrCreateAccount,
  getBalanceCents,
  getPlatformRevenueAccount,
  getInstructorAccount,
  getAccountWithBalance,
} from "@/lib/ledger/accounts";
import {
  transfer,
  reverseTransfer,
  splitTransfer,
  verifyLedgerInvariant,
} from "@/lib/ledger/transfers";

describe("Ledger System", () => {
  // Test user IDs
  const testUserId1 = "test_user_1";
  const testUserId2 = "test_user_2";
  const testInstructorId = "test_instructor_1";

  // Cleanup function
  afterEach(async () => {
    // Clean up test data
    await prisma.ledgerEntry.deleteMany({
      where: {
        refId: { contains: "test_" },
      },
    });
    await prisma.ledgerTransfer.deleteMany({
      where: {
        OR: [
          { refId: { contains: "test_" } },
          { idempotencyKey: { contains: "test_" } },
        ],
      },
    });
    await prisma.ledgerAccount.deleteMany({
      where: {
        ownerId: {
          in: [testUserId1, testUserId2, testInstructorId],
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Account Management", () => {
    it("should create account idempotently", async () => {
      // First call creates account
      const account1 = await getOrCreateAccount({
        ownerId: testUserId1,
        kind: "user",
        currency: "USD",
      });
      expect(account1.ownerId).toBe(testUserId1);
      expect(account1.kind).toBe("user");
      expect(account1.currency).toBe("USD");

      // Second call returns same account
      const account2 = await getOrCreateAccount({
        ownerId: testUserId1,
        kind: "user",
        currency: "USD",
      });
      expect(account2.id).toBe(account1.id);
    });

    it("should create separate accounts per currency", async () => {
      const usdAccount = await getOrCreateAccount({
        ownerId: testUserId1,
        kind: "user",
        currency: "USD",
      });
      const eurAccount = await getOrCreateAccount({
        ownerId: testUserId1,
        kind: "user",
        currency: "EUR",
      });

      expect(usdAccount.id).not.toBe(eurAccount.id);
      expect(usdAccount.currency).toBe("USD");
      expect(eurAccount.currency).toBe("EUR");
    });

    it("should get balance from entries", async () => {
      const account = await getOrCreateAccount({
        ownerId: testUserId1,
        kind: "user",
        currency: "USD",
      });

      // Initially zero
      const balance1 = await getBalanceCents(account.id);
      expect(balance1).toBe(0);

      // Create a temporary sender account and add credit entry via transfer
      const tempAccount = await getOrCreateAccount({
        ownerId: "temp_sender",
        kind: "user",
        currency: "USD",
      });

      await transfer({
        fromAccountId: tempAccount.id,
        toAccountId: account.id,
        amount: 10000, // +$100
        currency: "USD",
        reason: "test_credit",
        refType: "purchase",
        refId: "test_purchase_1",
        idempotencyKey: "test_credit_1",
      });

      const balance2 = await getBalanceCents(account.id);
      expect(balance2).toBe(10000);

      // Add debit entry via transfer
      await transfer({
        fromAccountId: account.id,
        toAccountId: tempAccount.id,
        amount: 3000, // -$30
        currency: "USD",
        reason: "test_debit",
        refType: "payout",
        refId: "test_payout_1",
        idempotencyKey: "test_debit_1",
      });

      const balance3 = await getBalanceCents(account.id);
      expect(balance3).toBe(7000); // $100 - $30 = $70
    });

    it("should get platform account", async () => {
      const platform = await getPlatformRevenueAccount();
      expect(platform.ownerId).toBeNull();
      expect(platform.kind).toBe("platform");
      expect(platform.currency).toBe("USD");
    });

    it("should get instructor account", async () => {
      const instructor = await getInstructorAccount(testInstructorId);
      expect(instructor.ownerId).toBe(testInstructorId);
      expect(instructor.kind).toBe("instructor");
    });
  });

  describe("Transfer Operations", () => {
    it("should execute atomic transfer", async () => {
      const account1 = await getOrCreateAccount({
        ownerId: testUserId1,
        kind: "user",
        currency: "USD",
      });
      const account2 = await getOrCreateAccount({
        ownerId: testUserId2,
        kind: "user",
        currency: "USD",
      });

      // Give account1 starting balance via transfer from temp account
      const tempAccount = await getOrCreateAccount({
        ownerId: "temp_initial_1",
        kind: "user",
        currency: "USD",
      });

      await transfer({
        fromAccountId: tempAccount.id,
        toAccountId: account1.id,
        amount: 10000,
        currency: "USD",
        reason: "test_initial",
        refType: "purchase",
        refId: "test_initial",
        idempotencyKey: "test_initial_balance",
      });

      // Transfer $50 from account1 to account2
      const result = await transfer({
        fromAccountId: account1.id,
        toAccountId: account2.id,
        amount: 5000,
        currency: "USD",
        reason: "purchase",
        refType: "purchase",
        refId: "test_transfer_1",
        idempotencyKey: "test_transfer_1",
      });

      expect(result.amount).toBe(5000);
      expect(result.entries).toHaveLength(2);

      // Check balances
      const balance1 = await getBalanceCents(account1.id);
      const balance2 = await getBalanceCents(account2.id);

      expect(balance1).toBe(5000); // $100 - $50 = $50
      expect(balance2).toBe(5000); // $0 + $50 = $50
    });

    it("should enforce idempotency on transfers", async () => {
      const account1 = await getOrCreateAccount({
        ownerId: testUserId1,
        kind: "user",
        currency: "USD",
      });
      const account2 = await getOrCreateAccount({
        ownerId: testUserId2,
        kind: "user",
        currency: "USD",
      });

      // Give account1 starting balance via transfer
      const tempAccount = await getOrCreateAccount({
        ownerId: "temp_initial_2",
        kind: "user",
        currency: "USD",
      });

      await transfer({
        fromAccountId: tempAccount.id,
        toAccountId: account1.id,
        amount: 10000,
        currency: "USD",
        reason: "test_initial",
        refType: "purchase",
        refId: "test_initial",
        idempotencyKey: "test_initial_balance_2",
      });

      const transferParams = {
        fromAccountId: account1.id,
        toAccountId: account2.id,
        amount: 3000,
        currency: "USD",
        reason: "purchase" as const,
        refType: "purchase" as const,
        refId: "test_transfer_2",
        idempotencyKey: "test_idempotent_transfer",
      };

      // First transfer
      const result1 = await transfer(transferParams);

      // Second transfer with same idempotency key
      const result2 = await transfer(transferParams);

      // Should return same transfer
      expect(result2.id).toBe(result1.id);

      // Balance should only reflect ONE transfer
      const balance1 = await getBalanceCents(account1.id);
      expect(balance1).toBe(7000); // $100 - $30 = $70 (not $40!)
    });

    it("should maintain double-entry invariant", async () => {
      const account1 = await getOrCreateAccount({
        ownerId: testUserId1,
        kind: "user",
        currency: "USD",
      });
      const account2 = await getOrCreateAccount({
        ownerId: testUserId2,
        kind: "user",
        currency: "USD",
      });

      // Create multiple transfers
      const tempAccount = await getOrCreateAccount({
        ownerId: "temp_initial_3",
        kind: "user",
        currency: "USD",
      });

      await transfer({
        fromAccountId: tempAccount.id,
        toAccountId: account1.id,
        amount: 10000,
        currency: "USD",
        reason: "test_initial",
        refType: "purchase",
        refId: "test_initial",
        idempotencyKey: "test_initial_balance_3",
      });

      await transfer({
        fromAccountId: account1.id,
        toAccountId: account2.id,
        amount: 2000,
        currency: "USD",
        reason: "purchase",
        refType: "purchase",
        refId: "test_transfer_3a",
        idempotencyKey: "test_transfer_3a",
      });

      await transfer({
        fromAccountId: account1.id,
        toAccountId: account2.id,
        amount: 3000,
        currency: "USD",
        reason: "purchase",
        refType: "purchase",
        refId: "test_transfer_3b",
        idempotencyKey: "test_transfer_3b",
      });

      // Verify invariant (sum of all entries should balance)
      // Note: The temp account will have negative balance, account1 and account2 have positive
      const result = await verifyLedgerInvariant();

      // Should be 0 because all transfers are balanced (debit + credit = 0 for each)
      expect(result).toBe(true);
    });

    it("should reverse transfer for refunds", async () => {
      const account1 = await getOrCreateAccount({
        ownerId: testUserId1,
        kind: "user",
        currency: "USD",
      });
      const account2 = await getOrCreateAccount({
        ownerId: testUserId2,
        kind: "user",
        currency: "USD",
      });

      // Give account1 starting balance via transfer
      const tempAccount = await getOrCreateAccount({
        ownerId: "temp_initial_4",
        kind: "user",
        currency: "USD",
      });

      await transfer({
        fromAccountId: tempAccount.id,
        toAccountId: account1.id,
        amount: 10000,
        currency: "USD",
        reason: "test_initial",
        refType: "purchase",
        refId: "test_initial",
        idempotencyKey: "test_initial_balance_4",
      });

      // Original transfer
      const original = await transfer({
        fromAccountId: account1.id,
        toAccountId: account2.id,
        amount: 5000,
        currency: "USD",
        reason: "purchase",
        refType: "purchase",
        refId: "test_transfer_4",
        idempotencyKey: "test_transfer_4_original",
      });

      // Reverse transfer (refund)
      await reverseTransfer({
        originalTransferId: original.id,
        reason: "refund",
        refId: "test_refund_1",
        idempotencyKey: "test_transfer_4_reverse",
      });

      // Balances should be back to original
      const balance1 = await getBalanceCents(account1.id);
      const balance2 = await getBalanceCents(account2.id);

      expect(balance1).toBe(10000); // Back to $100
      expect(balance2).toBe(0); // Back to $0
    });

    it("should split transfer for platform fees", async () => {
      const buyerAccount = await getOrCreateAccount({
        ownerId: testUserId1,
        kind: "user",
        currency: "USD",
      });
      const instructorAccount = await getInstructorAccount(testInstructorId);
      const platformAccount = await getPlatformRevenueAccount();

      // Give buyer starting balance via transfer
      const tempAccount = await getOrCreateAccount({
        ownerId: "temp_initial_5",
        kind: "user",
        currency: "USD",
      });

      await transfer({
        fromAccountId: tempAccount.id,
        toAccountId: buyerAccount.id,
        amount: 10000,
        currency: "USD",
        reason: "test_initial",
        refType: "purchase",
        refId: "test_initial",
        idempotencyKey: "test_initial_balance_5",
      });

      // Split transfer: $100 gross, $25 fee, $75 net
      const result = await splitTransfer({
        buyerAccountId: buyerAccount.id,
        instructorAccountId: instructorAccount.id,
        platformAccountId: platformAccount.id,
        grossAmount: 10000,
        platformFeeAmount: 2500,
        currency: "USD",
        productId: "test_product_1",
        idempotencyKey: "test_split_transfer_1",
      });

      expect(result.netTransfer.amount).toBe(7500);

      // Check balances
      const buyerBalance = await getBalanceCents(buyerAccount.id);
      const instructorBalance = await getBalanceCents(instructorAccount.id);
      const platformBalance = await getBalanceCents(platformAccount.id);

      expect(buyerBalance).toBe(0); // $100 - $100 = $0
      expect(instructorBalance).toBe(7500); // $75 net
      expect(platformBalance).toBe(2500); // $25 fee
    }, 120000);
  });

  describe("Error Handling", () => {
    it("should reject negative transfer amounts", async () => {
      const account1 = await getOrCreateAccount({
        ownerId: testUserId1,
        kind: "user",
        currency: "USD",
      });
      const account2 = await getOrCreateAccount({
        ownerId: testUserId2,
        kind: "user",
        currency: "USD",
      });

      await expect(
        transfer({
          fromAccountId: account1.id,
          toAccountId: account2.id,
          amount: -1000, // Negative amount
          currency: "USD",
          reason: "purchase",
          refType: "purchase",
          refId: "test_negative",
          idempotencyKey: "test_negative_transfer",
        })
      ).rejects.toThrow("Amount must be positive");
    });

    it("should reject transfer to same account", async () => {
      const account = await getOrCreateAccount({
        ownerId: testUserId1,
        kind: "user",
        currency: "USD",
      });

      await expect(
        transfer({
          fromAccountId: account.id,
          toAccountId: account.id, // Same account
          amount: 1000,
          currency: "USD",
          reason: "purchase",
          refType: "purchase",
          refId: "test_same",
          idempotencyKey: "test_same_account",
        })
      ).rejects.toThrow("Cannot transfer to same account");
    });
  });
});
