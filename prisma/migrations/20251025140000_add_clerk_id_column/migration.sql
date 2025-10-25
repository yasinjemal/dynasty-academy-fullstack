-- Add optional Clerk identity column expected by the Prisma schema
ALTER TABLE "public"."users"
  ADD COLUMN IF NOT EXISTS "clerk_id" text;

-- Ensure Clerk IDs remain unique when provided
CREATE UNIQUE INDEX IF NOT EXISTS "users_clerk_id_key"
  ON "public"."users"("clerk_id")
  WHERE "clerk_id" IS NOT NULL;
