-- =====================================================
-- SAFE MODE LEDGER SCHEMA MIGRATION
-- Run this in Supabase SQL Editor (Database > SQL Editor)
-- =====================================================

-- Enable pgvector extension (for AI features)
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- STEP 1: Drop old ledger tables (if they exist)
-- =====================================================
DROP TABLE IF EXISTS "public"."ledger_entries" CASCADE;
DROP TABLE IF EXISTS "public"."ledger_transfers" CASCADE;
DROP TABLE IF EXISTS "public"."ledger_accounts" CASCADE;

-- =====================================================
-- STEP 2: Create new atomic ledger tables
-- =====================================================

-- LedgerAccount: One account per owner+kind+currency
CREATE TABLE "public"."ledger_accounts" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'user',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_accounts_pkey" PRIMARY KEY ("id")
);

-- Unique constraint: one account per owner+kind+currency
CREATE UNIQUE INDEX "ledger_accounts_ownerId_kind_currency_key" ON "public"."ledger_accounts"("ownerId", "kind", "currency");
CREATE INDEX "ledger_accounts_ownerId_kind_currency_idx" ON "public"."ledger_accounts"("ownerId", "kind", "currency");

-- LedgerTransfer: Atomic transfer header
CREATE TABLE "public"."ledger_transfers" (
    "id" TEXT NOT NULL,
    "fromAccountId" TEXT NOT NULL,
    "toAccountId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "refType" TEXT,
    "refId" TEXT,
    "idempotencyKey" TEXT,
    "metadata" JSONB,
    "state" TEXT NOT NULL DEFAULT 'posted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_transfers_pkey" PRIMARY KEY ("id")
);

-- Unique constraint for idempotency
CREATE UNIQUE INDEX "ledger_transfers_idempotencyKey_key" ON "public"."ledger_transfers"("idempotencyKey");
CREATE INDEX "ledger_transfers_fromAccountId_idx" ON "public"."ledger_transfers"("fromAccountId");
CREATE INDEX "ledger_transfers_toAccountId_idx" ON "public"."ledger_transfers"("toAccountId");
CREATE INDEX "ledger_transfers_refType_refId_idx" ON "public"."ledger_transfers"("refType", "refId");

-- LedgerEntry: Individual debit/credit entries
CREATE TABLE "public"."ledger_entries" (
    "id" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "refType" TEXT,
    "refId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- Foreign key constraints
ALTER TABLE "public"."ledger_entries" 
    ADD CONSTRAINT "ledger_entries_transferId_fkey" 
    FOREIGN KEY ("transferId") 
    REFERENCES "public"."ledger_transfers"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

ALTER TABLE "public"."ledger_entries" 
    ADD CONSTRAINT "ledger_entries_accountId_fkey" 
    FOREIGN KEY ("accountId") 
    REFERENCES "public"."ledger_accounts"("id") 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE;

-- Indexes for performance
CREATE INDEX "ledger_entries_transferId_idx" ON "public"."ledger_entries"("transferId");
CREATE INDEX "ledger_entries_accountId_idx" ON "public"."ledger_entries"("accountId");
CREATE INDEX "ledger_entries_refType_refId_idx" ON "public"."ledger_entries"("refType", "refId");

-- =====================================================
-- STEP 3: Verify double-entry invariant function
-- =====================================================
-- This function can be used to check ledger integrity
CREATE OR REPLACE FUNCTION check_ledger_balance()
RETURNS TABLE(total_balance BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT COALESCE(SUM(amount), 0)::BIGINT as total_balance
    FROM ledger_entries;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SUCCESS! 
-- =====================================================
-- Run this query to verify the sum is zero:
-- SELECT * FROM check_ledger_balance();
-- 
-- Expected result: total_balance = 0
-- =====================================================
