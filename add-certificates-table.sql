-- Add certificates table for course completion certificates

CREATE TABLE IF NOT EXISTS "certificates" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "verificationCode" TEXT UNIQUE NOT NULL,
  "issuedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "pdfUrl" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "fk_certificates_user"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE,
  CONSTRAINT "fk_certificates_course"
    FOREIGN KEY ("courseId") REFERENCES "courses"("id")
    ON DELETE CASCADE,
    
  UNIQUE("userId", "courseId")
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_certificates_user" ON "certificates"("userId");
CREATE INDEX IF NOT EXISTS "idx_certificates_course" ON "certificates"("courseId");
CREATE INDEX IF NOT EXISTS "idx_certificates_verification" ON "certificates"("verificationCode");
