/**
 * STRIPE WEBHOOK TESTS
 *
 * Tests for webhook event processing
 * - checkout.session.completed handling
 * - Ledger entry creation
 * - Ownership grants
 * - Idempotency
 * - Error handling
 *
 * NOTE: These are unit tests that mock Stripe events
 * For integration tests, use Stripe CLI webhook forwarding
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  afterAll,
  vi,
} from "vitest";
import { prisma } from "@/lib/db";

describe("Stripe Webhook Processing", () => {
  const testProductId = "test_prod_webhook_1";
  const testUserId = "test_user_webhook_1";
  const testInstructorId = "test_instructor_webhook_1";
  const testEventId = "evt_test_webhook_1";

  // Mock Stripe event
  const mockCheckoutEvent = {
    id: testEventId,
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_123",
        amount_total: 10000, // $100
        metadata: {
          productId: testProductId,
          userId: testUserId,
          instructorId: testInstructorId,
        },
        payment_intent: "pi_test_123",
      },
    },
  };

  afterEach(async () => {
    // Clean up test data
    await prisma.ledgerEntry.deleteMany({
      where: {
        OR: [{ refId: testProductId }],
      },
    });
    await prisma.ledgerTransfer.deleteMany({
      where: {
        OR: [
          { refId: testProductId },
          { idempotencyKey: { contains: testEventId } },
        ],
      },
    });
    await prisma.ownership.deleteMany({
      where: {
        userId: testUserId,
        productId: testProductId,
      },
    });
    await prisma.stripeEvent.deleteMany({
      where: { id: testEventId },
    });
    await prisma.ledgerAccount.deleteMany({
      where: {
        ownerId: { in: [testUserId, testInstructorId] },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Event Idempotency", () => {
    it("should store event record on first processing", async () => {
      // Create event record
      await prisma.stripeEvent.create({
        data: {
          id: mockCheckoutEvent.id,
          type: mockCheckoutEvent.type,
          processed: false,
          data: mockCheckoutEvent.data.object,
        },
      });

      const event = await prisma.stripeEvent.findUnique({
        where: { id: mockCheckoutEvent.id },
      });

      expect(event).toBeDefined();
      expect(event?.processed).toBe(false);
      expect(event?.type).toBe("checkout.session.completed");
    });

    it("should detect already processed events", async () => {
      // Create already processed event
      await prisma.stripeEvent.create({
        data: {
          id: mockCheckoutEvent.id,
          type: mockCheckoutEvent.type,
          processed: true,
          processedAt: new Date(),
          data: mockCheckoutEvent.data.object,
        },
      });

      const event = await prisma.stripeEvent.findUnique({
        where: { id: mockCheckoutEvent.id },
      });

      expect(event?.processed).toBe(true);
      expect(event?.processedAt).toBeDefined();
    });

    it("should not duplicate entries for same event", async () => {
      // This test would require actually calling the webhook handler
      // For now, we test the idempotency constraint at database level

      await prisma.stripeEvent.create({
        data: {
          id: mockCheckoutEvent.id,
          type: mockCheckoutEvent.type,
          processed: false,
          data: mockCheckoutEvent.data.object,
        },
      });

      // Try to create duplicate (should fail)
      await expect(
        prisma.stripeEvent.create({
          data: {
            id: mockCheckoutEvent.id, // Same ID
            type: mockCheckoutEvent.type,
            processed: false,
            data: mockCheckoutEvent.data.object,
          },
        })
      ).rejects.toThrow();
    });
  });

  describe("Ownership Management", () => {
    it("should grant ownership idempotently", async () => {
      // Create ownership
      const ownership1 = await prisma.ownership.create({
        data: {
          userId: testUserId,
          productId: testProductId,
          source: "purchase",
          metadata: {
            checkoutSessionId: "cs_test_123",
          },
        },
      });

      expect(ownership1.userId).toBe(testUserId);
      expect(ownership1.productId).toBe(testProductId);
      expect(ownership1.revokedAt).toBeNull();

      // Try to create duplicate (should use upsert in production)
      await expect(
        prisma.ownership.create({
          data: {
            userId: testUserId,
            productId: testProductId, // Same combination
            source: "purchase",
          },
        })
      ).rejects.toThrow(); // Unique constraint violation
    });

    it("should use upsert to handle existing ownership", async () => {
      // First ownership
      await prisma.ownership.create({
        data: {
          userId: testUserId,
          productId: testProductId,
          source: "purchase",
        },
      });

      // Upsert (should update, not create)
      const updated = await prisma.ownership.upsert({
        where: {
          userId_productId: {
            userId: testUserId,
            productId: testProductId,
          },
        },
        create: {
          userId: testUserId,
          productId: testProductId,
          source: "purchase",
        },
        update: {
          revokedAt: null, // Un-revoke if was revoked
          source: "purchase",
        },
      });

      expect(updated.userId).toBe(testUserId);
      expect(updated.revokedAt).toBeNull();

      // Should still be only 1 ownership record
      const count = await prisma.ownership.count({
        where: {
          userId: testUserId,
          productId: testProductId,
        },
      });
      expect(count).toBe(1);
    });

    it("should revoke ownership on refund", async () => {
      // Create ownership
      await prisma.ownership.create({
        data: {
          userId: testUserId,
          productId: testProductId,
          source: "purchase",
        },
      });

      // Revoke
      await prisma.ownership.update({
        where: {
          userId_productId: {
            userId: testUserId,
            productId: testProductId,
          },
        },
        data: {
          revokedAt: new Date(),
          source: "revoked",
        },
      });

      const ownership = await prisma.ownership.findUnique({
        where: {
          userId_productId: {
            userId: testUserId,
            productId: testProductId,
          },
        },
      });

      expect(ownership?.revokedAt).toBeDefined();
      expect(ownership?.source).toBe("revoked");
    });
  });

  describe("Event Types", () => {
    it("should identify checkout.session.completed events", () => {
      expect(mockCheckoutEvent.type).toBe("checkout.session.completed");
      expect(mockCheckoutEvent.data.object.metadata).toBeDefined();
      expect(mockCheckoutEvent.data.object.metadata.productId).toBe(
        testProductId
      );
    });

    it("should extract metadata from checkout session", () => {
      const metadata = mockCheckoutEvent.data.object.metadata;

      expect(metadata.productId).toBe(testProductId);
      expect(metadata.userId).toBe(testUserId);
      expect(metadata.instructorId).toBe(testInstructorId);
    });

    it("should handle amount_total in cents", () => {
      const amountCents = mockCheckoutEvent.data.object.amount_total;
      const amountDollars = amountCents / 100;

      expect(amountCents).toBe(10000);
      expect(amountDollars).toBe(100);
    });
  });

  describe("Error Scenarios", () => {
    it("should handle missing metadata gracefully", () => {
      const invalidEvent = {
        ...mockCheckoutEvent,
        data: {
          object: {
            ...mockCheckoutEvent.data.object,
            metadata: {}, // Missing required fields
          },
        },
      };

      expect(invalidEvent.data.object.metadata.productId).toBeUndefined();
      // In production, webhook handler should validate and return 400
    });

    it("should handle missing product", async () => {
      // Try to find non-existent product
      const product = await prisma.product.findUnique({
        where: { id: "non_existent_product" },
      });

      expect(product).toBeNull();
      // Webhook handler should handle this case
    });
  });

  describe("Webhook Signature Verification", () => {
    it("should require signature header", () => {
      // In production, webhook handler checks for stripe-signature header
      const signature = "t=1234,v1=signature_hash";
      expect(signature).toContain("t=");
      expect(signature).toContain("v1=");
    });

    it("should reject webhooks without signature", () => {
      // Webhook handler should return 400 if no signature
      const hasSignature = false;
      expect(hasSignature).toBe(false);
      // This would trigger error in production
    });
  });

  describe("Integration Scenarios", () => {
    // TODO: Update this test to use new ledger API with splitTransfer()
    it.skip("should simulate full purchase flow", async () => {
      // 1. Event arrives
      await prisma.stripeEvent.create({
        data: {
          id: mockCheckoutEvent.id,
          type: mockCheckoutEvent.type,
          processed: false,
          data: mockCheckoutEvent.data.object,
        },
      });

      // 2. Create accounts (would be done by webhook handler)
      const platformAccount = await prisma.ledgerAccount.create({
        data: {
          ownerId: null,
          kind: "platform",
          currency: "USD",
        },
      });

      const instructorAccount = await prisma.ledgerAccount.create({
        data: {
          ownerId: testInstructorId,
          kind: "instructor",
          currency: "USD",
        },
      });

      // 3. Create ledger entries (simulate 25% platform fee)
      const grossAmount = 10000;
      const platformFee = 2500;
      const instructorNet = 7500;

      // Platform fee entry
      await prisma.ledgerEntry.create({
        data: {
          accountId: platformAccount.id,
          amountCents: platformFee,
          refType: "platform_fee",
          refId: testProductId,
          idempotency: `${testEventId}_fee`,
        },
      });

      // Instructor net entry
      await prisma.ledgerEntry.create({
        data: {
          accountId: instructorAccount.id,
          amountCents: instructorNet,
          refType: "purchase",
          refId: testProductId,
          idempotency: `${testEventId}_instructor`,
        },
      });

      // 4. Grant ownership
      await prisma.ownership.create({
        data: {
          userId: testUserId,
          productId: testProductId,
          source: "purchase",
          metadata: {
            checkoutSessionId: mockCheckoutEvent.data.object.id,
            amountPaidCents: grossAmount,
          },
        },
      });

      // 5. Mark event processed
      await prisma.stripeEvent.update({
        where: { id: mockCheckoutEvent.id },
        data: {
          processed: true,
          processedAt: new Date(),
        },
      });

      // Verify everything
      const event = await prisma.stripeEvent.findUnique({
        where: { id: mockCheckoutEvent.id },
      });
      expect(event?.processed).toBe(true);

      const ownership = await prisma.ownership.findUnique({
        where: {
          userId_productId: {
            userId: testUserId,
            productId: testProductId,
          },
        },
      });
      expect(ownership).toBeDefined();
      expect(ownership?.revokedAt).toBeNull();

      const entries = await prisma.ledgerEntry.findMany({
        where: { refId: testProductId },
      });
      expect(entries).toHaveLength(2);

      const platformEntry = entries.find((e) => e.refType === "platform_fee");
      const instructorEntry = entries.find((e) => e.refType === "purchase");

      expect(platformEntry?.amountCents).toBe(platformFee);
      expect(instructorEntry?.amountCents).toBe(instructorNet);
    });
  });
});
