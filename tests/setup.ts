/**
 * Test setup file
 * Runs before all tests
 */

import { beforeAll, afterAll } from "vitest";

beforeAll(async () => {
  console.log("🧪 Starting Safe Mode test suite...");

  // Set test environment variables
  process.env.CREDITS_ONLY = "true";
  process.env.ENABLE_CRYPTO = "false";
  process.env.TRUST_FEE_ENABLED = "true";
  process.env.REQUIRE_INSTRUCTOR_KYC = "true";
  process.env.MIN_PAYOUT_AMOUNT_CENTS = "5000";
  process.env.AUDIT_ALL_TRANSACTIONS = "false"; // Disable for tests (no test users in DB)
  process.env.SKIP_AUDIT_LOGS = "true"; // Skip audit logging in tests
});

afterAll(async () => {
  console.log("✅ Test suite complete");
});
