-- Add moderation fields to PageChat
ALTER TABLE "page_chat" ADD COLUMN IF NOT EXISTS "flagged" BOOLEAN DEFAULT FALSE;
ALTER TABLE "page_chat" ADD COLUMN IF NOT EXISTS "flagReason" TEXT;
ALTER TABLE "page_chat" ADD COLUMN IF NOT EXISTS "flaggedBy" TEXT;
ALTER TABLE "page_chat" ADD COLUMN IF NOT EXISTS "flaggedAt" TIMESTAMP(3);
ALTER TABLE "page_chat" ADD COLUMN IF NOT EXISTS "moderatorDeleted" BOOLEAN DEFAULT FALSE;
ALTER TABLE "page_chat" ADD COLUMN IF NOT EXISTS "deletedBy" TEXT;

-- Create MessageFlag table for detailed flag tracking
CREATE TABLE IF NOT EXISTS "message_flags" (
  "id" TEXT PRIMARY KEY,
  "messageId" TEXT NOT NULL,
  "flaggedBy" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "details" TEXT,
  "resolved" BOOLEAN DEFAULT FALSE,
  "resolvedBy" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "message_flags_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "page_chat"("id") ON DELETE CASCADE,
  CONSTRAINT "message_flags_flaggedBy_fkey" FOREIGN KEY ("flaggedBy") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "message_flags_messageId_idx" ON "message_flags"("messageId");
CREATE INDEX IF NOT EXISTS "message_flags_flaggedBy_idx" ON "message_flags"("flaggedBy");
CREATE INDEX IF NOT EXISTS "message_flags_resolved_idx" ON "message_flags"("resolved");

-- Create ModerationLog table for audit trail
CREATE TABLE IF NOT EXISTS "moderation_logs" (
  "id" TEXT PRIMARY KEY,
  "action" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "moderatorId" TEXT NOT NULL,
  "reason" TEXT,
  "details" JSONB,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "moderation_logs_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "moderation_logs_moderatorId_idx" ON "moderation_logs"("moderatorId");
CREATE INDEX IF NOT EXISTS "moderation_logs_targetType_targetId_idx" ON "moderation_logs"("targetType", "targetId");
CREATE INDEX IF NOT EXISTS "moderation_logs_createdAt_idx" ON "moderation_logs"("createdAt");
