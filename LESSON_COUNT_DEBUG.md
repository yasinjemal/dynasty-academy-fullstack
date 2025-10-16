# 🔍 LESSON COUNT DEBUG INVESTIGATION

## Problem

User reports course shows "0/12 Lessons" despite 12 lessons existing in database.

## Database Verification ✅

**Course ID:** `course-1760650591599`
**Database Check Results:**

```json
{
  "id": "course-1760650591599",
  "title": "The 9 AI Powers Final Reordered",
  "lessonCount": 12,
  "status": "published"
}
```

**Lesson Count in DB:** 12 lessons confirmed ✅

## API Analysis

### GET /api/courses/[id] Route

**File:** `src/app/api/courses/[id]/route.ts`

**SQL Query (Lines 22-32):**

```sql
SELECT
  c.id, c.title, c.description, c."coverImage",
  c.level, c.category, c.duration, c."lessonCount",  ← From courses table
  c."instructorName" as "instructor",
  COALESCE(e.progress, 0) as progress,
  COALESCE(e."completedLessons", 0) as "completedLessons",
  c."lessonCount" as "totalLessons"  ← ALIASED! Should = 12
FROM courses c
LEFT JOIN course_enrollments e ON e."courseId" = c.id AND e."userId" = ${userId}
WHERE c.id = ${courseId}
LIMIT 1
```

**Expected Response Structure:**

```typescript
{
  id: string,
  title: string,
  lessonCount: 12,        // Direct from courses table
  totalLessons: 12,       // Aliased from courses.lessonCount
  completedLessons: 0,    // From enrollments (default 0 if not enrolled)
  progress: 0,            // From enrollments (default 0 if not enrolled)
  sections: [...]         // Array of sections with lessons
}
```

## Frontend Usage

### Page: `src/app/(dashboard)/courses/[id]/page.tsx`

**Lines that use totalLessons:**

- Line 207: `((courseData.completedLessons + 1) / courseData.totalLessons) * 100`
- Line 751: `(courseData.completedLessons / courseData.totalLessons) * 100`

**Data Fetching (Line 112):**

```typescript
const response = await fetch(`/api/courses/${courseId}`);
const data = await response.json();
setCourseData(data);
```

## Debug Logging Added

### API Debug (Lines 75-81):

```typescript
console.log("📊 API Response Debug:");
console.log("- totalLessons:", courseData.totalLessons);
console.log("- lessonCount:", courseData.lessonCount);
console.log("- completedLessons:", courseData.completedLessons);
console.log("- sections:", courseData.sections?.length);
```

### Frontend Debug (Lines 115-120):

```typescript
console.log("📦 Frontend Received Data:");
console.log("- totalLessons:", data.totalLessons);
console.log("- lessonCount:", data.lessonCount);
console.log("- completedLessons:", data.completedLessons);
console.log("- sections:", data.sections?.length);
```

## Potential Issues

### 1. SQL Query Type Issue

- `$queryRaw` returns array, using `course[0]` to get first result
- If query returns empty array, `course[0]` would be undefined
- But API has error handling for this

### 2. Data Type Conversion

- PostgreSQL bigint might be returned as string
- But number fields should auto-convert

### 3. Enrollment Table Conflict

- `course_enrollments` also has `totalLessons` field (see schema.prisma lines 1315-1316)
- But SQL explicitly selects `c."lessonCount" as "totalLessons"` from courses table
- LEFT JOIN means NULL if not enrolled, then COALESCE to 0 for enrollment fields only

### 4. Display Location Mystery

- User says sees "0/12 Lessons"
- Haven't found exact location of this text in course detail page
- Might be in a different component or page

## Next Steps

1. **Refresh Browser** - Check console for debug logs

   - Should see "📊 API Response Debug" in server console
   - Should see "📦 Frontend Received Data" in browser console

2. **Verify API Response** - If dev server running:

   ```bash
   curl http://localhost:3000/api/courses/course-1760650591599
   ```

3. **Check Where "0/12" Displays** - Search for:

   - Overview cards/stats
   - Course list view
   - Different page than course detail

4. **Fix If Needed**:
   - If totalLessons is undefined: Check SQL query result structure
   - If totalLessons is 0: Check database lessonCount field
   - If display issue: Find and fix the component showing "0/12"

## Success Criteria

✅ API returns `totalLessons: 12`
✅ Frontend receives `totalLessons: 12`
✅ UI displays "12 Lessons" or "0/12 Lessons" correctly
✅ Progress calculation works: `(completedLessons / totalLessons) * 100`
