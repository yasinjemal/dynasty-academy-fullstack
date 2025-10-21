# 🔧 Phase 2D Column Name Fixes

**Issue**: PostgreSQL column names use camelCase (not snake_case)
**Root Cause**: Prisma schema defines fields in camelCase, which creates camelCase columns in PostgreSQL
**Date**: January 2025

---

## 🐛 The Problem

When attempting to access the publisher page, we encountered this error:

```
Raw query failed. Code: `42703`. Message: `column cl.course_id does not exist`
```

**Why?** The database tables use **camelCase** column names (e.g., `courseId`, `authorId`), but the SQL queries were using **snake_case** (e.g., `course_id`, `author_id`).

---

## 📊 Database Schema Pattern

### Prisma Schema Definition:

```prisma
model course_lessons {
  id        String  @id
  sectionId String  // ← camelCase in Prisma
  courseId  String  // ← camelCase in Prisma
  title     String
  // ...
}
```

### Actual PostgreSQL Columns:

```sql
-- Tables use camelCase column names!
course_lessons (
  id,
  "sectionId",  -- NOT section_id
  "courseId",   -- NOT course_id
  title
)
```

---

## ✅ Fixes Applied

### 1. Publisher Page Query (`src/app/admin/publisher/page.tsx`)

#### Published Courses Query:

```typescript
// ❌ BEFORE (snake_case - BROKEN)
LEFT JOIN course_lessons cl ON c.id = cl.course_id
LEFT JOIN course_quizzes cq ON c.id = cq.course_id
WHERE c.author_id = ${session.user.id}

// ✅ AFTER (camelCase - WORKING)
LEFT JOIN course_lessons cl ON c.id = cl."courseId"
LEFT JOIN course_quizzes cq ON c.id = cq."courseId"
WHERE c."authorId" = ${session.user.id}
```

#### SELECT Columns:

```typescript
// ❌ BEFORE
c.is_free as "isFree",
c.enrollment_count as "enrollmentCount",
c.lesson_count as "lessonCount",
c.certificate_enabled as "certificateEnabled"

// ✅ AFTER
c."isFree",
c."enrollmentCount",
c."lessonCount",
c."certificateEnabled"
```

#### Stats Query:

```typescript
// ❌ BEFORE
SUM(enrollment_count) as total_enrollments,
SUM(lesson_count) as total_lessons,
AVG(CASE WHEN average_rating > 0 THEN average_rating ELSE NULL END)
WHERE author_id = ${session.user.id}

// ✅ AFTER
COALESCE(SUM("enrollmentCount"), 0) as total_enrollments,
COALESCE(SUM("lessonCount"), 0) as total_lessons,
AVG(CASE WHEN "averageRating" > 0 THEN "averageRating" ELSE NULL END)
WHERE "authorId" = ${session.user.id}
```

---

### 2. AI Publisher Core (`src/lib/ai-publisher.ts`)

#### Course INSERT:

```typescript
// ❌ BEFORE
INSERT INTO courses (
  id, title, slug, description, short_description,
  level, category, tags,
  price, currency, is_free, discount,
  status, featured, is_premium,
  author_id, instructor_name, instructor_bio, instructor_image,
  certificate_enabled, certificate_template,
  created_at, updated_at, published_at
)

// ✅ AFTER
INSERT INTO courses (
  id, title, slug, description, "shortDescription",
  level, category, tags,
  price, currency, "isFree", discount,
  status, featured, "isPremium",
  "authorId", "instructorName", "instructorBio", "instructorImage",
  "certificateEnabled", "certificateTemplate",
  "createdAt", "updatedAt", "publishedAt"
)
```

#### Section INSERT:

```typescript
// ❌ BEFORE
INSERT INTO course_sections (
  id, course_id, title, description, "order",
  is_locked, created_at, updated_at
)

// ✅ AFTER
INSERT INTO course_sections (
  id, "courseId", title, description, "order",
  "isLocked", "createdAt", "updatedAt"
)
```

#### Section Query:

```typescript
// ❌ BEFORE
WHERE course_id = ${courseId}

// ✅ AFTER
WHERE "courseId" = ${courseId}
```

#### Lesson INSERT:

```typescript
// ❌ BEFORE
INSERT INTO course_lessons (
  id, section_id, course_id, title, slug,
  description, "order", type, content,
  is_free, is_locked, created_at, updated_at
)

// ✅ AFTER
INSERT INTO course_lessons (
  id, "sectionId", "courseId", title, slug,
  description, "order", type, content,
  "isFree", "isLocked", "createdAt", "updatedAt"
)
```

#### Lesson Query:

```typescript
// ❌ BEFORE
SELECT id, title, "order", section_id
FROM course_lessons
WHERE course_id = ${courseId}

// ✅ AFTER
SELECT id, title, "order", "sectionId"
FROM course_lessons
WHERE "courseId" = ${courseId}
```

#### Quiz INSERT:

```typescript
// ❌ BEFORE
INSERT INTO course_quizzes (
  id, course_id, lesson_id, title, description,
  passing_score, time_limit, max_attempts, show_answers,
  "order", created_at, updated_at
)

// ✅ AFTER
INSERT INTO course_quizzes (
  id, "courseId", "lessonId", title, description,
  "passingScore", "timeLimit", "maxAttempts", "showAnswers",
  "order", "createdAt", "updatedAt"
)
```

#### Quiz Question INSERT:

```typescript
// ❌ BEFORE
INSERT INTO quiz_questions (
  id, quiz_id, question, type, options,
  correct_answer, explanation, points,
  "order", created_at
)

// ✅ AFTER
INSERT INTO quiz_questions (
  id, "quizId", question, type, options,
  "correctAnswer", explanation, points,
  "order", "createdAt"
)
```

#### Course UPDATE:

```typescript
// ❌ BEFORE
UPDATE courses
SET lesson_count = ${lessonsCreated},
    updated_at = NOW()
WHERE id = ${courseId}

// ✅ AFTER
UPDATE courses
SET "lessonCount" = ${lessonsCreated},
    "updatedAt" = NOW()
WHERE id = ${courseId}
```

#### Status UPDATE:

```typescript
// ❌ BEFORE
UPDATE courses
SET status = ${status},
    published_at = ${status === "published" ? "NOW()" : null},
    updated_at = NOW()

// ✅ AFTER
UPDATE courses
SET status = ${status},
    "publishedAt" = ${status === "published" ? "NOW()" : null},
    "updatedAt" = NOW()
```

#### Published Courses Query:

```typescript
// ❌ BEFORE
SELECT
  id, title, slug, description, short_description,
  level, category, tags, price, currency, is_free,
  status, featured, is_premium, enrollment_count,
  lesson_count, published_at, created_at
FROM courses
WHERE author_id = ${authorId}

// ✅ AFTER
SELECT
  id, title, slug, description, "shortDescription",
  level, category, tags, price, currency, "isFree",
  status, featured, "isPremium", "enrollmentCount",
  "lessonCount", "publishedAt", "createdAt"
FROM courses
WHERE "authorId" = ${authorId}
```

#### Course Status Query:

```typescript
// ❌ BEFORE
SELECT
  id, status,
  enrollment_count,
  completion_count,
  average_rating,
  review_count,
  published_at
FROM courses

// ✅ AFTER
SELECT
  id, status,
  "enrollmentCount",
  "completionCount",
  "averageRating",
  "reviewCount",
  "publishedAt"
FROM courses
```

---

### 3. Other Fixes

#### cuid Import:

```typescript
// ❌ BEFORE
import { cuid } from "@paralleldrive/cuid2";

// ✅ AFTER
import { createId as cuid } from "@paralleldrive/cuid2";
```

---

## 📝 Pattern Rules

### When writing raw SQL queries:

1. **Use double quotes for camelCase columns:**

   ```sql
   SELECT "courseId", "authorId", "createdAt" FROM courses
   ```

2. **Simple columns don't need quotes:**

   ```sql
   SELECT id, title, slug, description FROM courses
   ```

3. **JOIN conditions need quotes:**

   ```sql
   LEFT JOIN course_lessons cl ON c.id = cl."courseId"
   ```

4. **WHERE clauses need quotes:**

   ```sql
   WHERE "authorId" = ${userId} AND "isFree" = true
   ```

5. **INSERT columns need quotes:**

   ```sql
   INSERT INTO courses (id, "authorId", "createdAt") VALUES (...)
   ```

6. **UPDATE columns need quotes:**
   ```sql
   UPDATE courses SET "lessonCount" = 10, "updatedAt" = NOW()
   ```

---

## ✅ Verification

All Phase 2d files now error-free:

- ✅ `src/lib/ai-publisher.ts` - No errors
- ✅ `src/app/api/admin/ai/publish/route.ts` - No errors
- ✅ `src/app/admin/publisher/page.tsx` - No errors
- ✅ `src/app/admin/publisher/PublisherClient.tsx` - No errors

---

## 🚀 Testing

Navigate to: **http://localhost:3001/admin/publisher**

The page should now load successfully without any SQL column errors! 🎉

---

## 💡 Why This Happened

When using Prisma with PostgreSQL:

- Prisma generates TypeScript types with camelCase
- Prisma creates database columns matching the TypeScript field names
- Therefore, PostgreSQL columns are camelCase (not snake_case)
- Raw SQL queries must use the exact column names with quotes

**Key Lesson**: When writing raw SQL in Prisma projects, always check the actual database schema!

---

## 📚 Related Tables Affected

All course-related tables use camelCase:

- ✅ `courses` - All columns fixed
- ✅ `course_sections` - All columns fixed
- ✅ `course_lessons` - All columns fixed
- ✅ `course_quizzes` - All columns fixed
- ✅ `quiz_questions` - All columns fixed

---

**Status**: All column name issues resolved ✅  
**Publisher**: Ready for testing 🚀  
**Next**: Publish first AI-generated course! 🎉
