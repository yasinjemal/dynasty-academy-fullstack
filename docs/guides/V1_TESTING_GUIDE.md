# V1 Feature Testing Guide - Quick Start

## 🎯 Testing Strategy

Test all 3 options in order to verify the complete V1 workflow:

1. **Option A**: Anyone can apply to become an instructor
2. **Option B**: All actions are logged and governed fairly
3. **Option C**: Students see personalized recommendations

---

## ✅ Option A: Instructor Onboarding

### Test 1: User Applies to Become Instructor

**Steps:**

1. Navigate to `http://localhost:3000/become-instructor`
2. Verify page displays:

   - Hero section with benefits
   - Application form
   - Success stories
   - FAQ section

3. Fill out form:

   - **Teaching Pitch**: (min 100 characters)
     ```
     I want to teach web development and AI engineering. I have 5 years of experience building production apps with Next.js, React, and Python. My courses will focus on practical, real-world projects that students can add to their portfolios.
     ```
   - **Topics**: Select 2-3 from dropdown (e.g., "Web Development", "AI & Machine Learning")
   - **Portfolio URL**: `https://yourwebsite.com` (optional)

4. Click "Submit Application"

**Expected Results:**

- ✅ Success message: "Application submitted successfully!"
- ✅ Status changes to "Pending Review"
- ✅ Form is disabled (can't resubmit)

**Database Check:**

```sql
SELECT * FROM "InstructorApplication"
WHERE "userId" = '<your-user-id>'
ORDER BY "createdAt" DESC
LIMIT 1;
```

---

### Test 2: Admin Reviews Application

**Steps:**

1. Login as admin user
2. Navigate to `http://localhost:3000/admin/instructor-applications`
3. Verify dashboard displays:

   - Stats cards (Total, Pending, Approved, Rejected)
   - Application cards with user info
   - Filter buttons (All, Pending, Approved, Rejected)

4. Click "View Details" on pending application
5. Review modal displays:

   - User name, email, profile image
   - Teaching pitch (full text)
   - Topics to teach (tags)
   - Portfolio URL (if provided)

6. **Test Approval:**

   - Click "Approve" button
   - Verify success message
   - Check application status changes to "Approved"

7. **Test Rejection:**
   - Click "Reject" button
   - Enter rejection reason: "We need more teaching experience demonstrated"
   - Verify success message
   - Check application status changes to "Rejected"

**Expected Results:**

- ✅ Approval: User role upgraded to `INSTRUCTOR` in database
- ✅ Rejection: Reason saved in `rejectionReason` field
- ✅ Both actions logged in `AuditLog` table

**Database Check:**

```sql
-- Check user role upgraded
SELECT "id", "role" FROM "User" WHERE "id" = '<applicant-user-id>';

-- Check audit log created
SELECT * FROM "AuditLog"
WHERE "action" LIKE '%instructor_application%'
ORDER BY "createdAt" DESC
LIMIT 5;
```

---

### Test 3: User Sees Updated Status

**Steps:**

1. Logout and login as the applicant user
2. Navigate to `http://localhost:3000/become-instructor`

**Expected Results (if Approved):**

- ✅ Green checkmark icon
- ✅ "Application Approved!" message
- ✅ "Start Creating Courses" button appears

**Expected Results (if Rejected):**

- ✅ Red X icon
- ✅ "Application Rejected" message
- ✅ Rejection reason displayed
- ✅ "Reapply" button (only after 30 days)

---

## ✅ Option B: Governance & Transparency

### Test 4: View Audit Logs

**Steps:**

1. Login as admin
2. Navigate to `http://localhost:3000/admin/governance`
3. Verify dashboard displays:

   - **Stats Cards:**

     - Total Actions (should include recent application approval/rejection)
     - Active Admins (at least 1 - you)
     - Entities Modified (at least 1)

   - **Top Actions Chart:**

     - Shows `approve_instructor_application` or `reject_instructor_application`

   - **Top Entities Chart:**
     - Shows `instructor_application`

4. **Test Filters:**

   - Change timeframe: "Last 24 Hours" → "Last 7 Days" → "Last 30 Days"
   - Filter by entity: Select "Applications"
   - Filter by action: Select "Approve Application"

5. **View Audit Log Table:**
   - Verify columns: Timestamp, Actor, Action, Entity, Details
   - Check your admin name appears in Actor column
   - Verify action type is human-readable (e.g., "Approve Instructor Application")

**Expected Results:**

- ✅ All admin actions logged (approve, reject, etc.)
- ✅ Actor name matches admin who performed action
- ✅ Before/After states captured (if applicable)
- ✅ Filters work correctly

**Database Check:**

```sql
SELECT
  al."id",
  al."action",
  al."entity",
  u."name" as actor_name,
  al."createdAt"
FROM "AuditLog" al
JOIN "User" u ON al."actorUserId" = u."id"
ORDER BY al."createdAt" DESC
LIMIT 10;
```

---

### Test 5: Ranking Algorithm Transparency

**Steps:**

1. Open `src/lib/governance/ranking.ts`
2. Review the ranking formula:

   ```
   Score = (Quality * 0.4) + (Engagement * 0.3) + (Accessibility * 0.2) + (Freshness * 0.1)
   ```

3. Test the `explainRanking()` function:
   - Open Node.js REPL or create a test file
   - Import the function
   - Call it with sample metrics

**Example Test:**

```typescript
import {
  calculateCourseRanking,
  explainRanking,
} from "@/lib/governance/ranking";

const sampleMetrics = {
  averageRating: 4.5,
  totalRatings: 50,
  completionRate: 75,
  enrollmentCount: 100,
  activeStudents: 40,
  discussionActivity: 0.6,
  isFree: true,
  hasClosedCaptions: true,
  multilingualSupport: false,
  publishedAt: new Date("2024-01-01"),
  lastUpdatedAt: new Date(),
  instructorExperience: 12,
  instructorCourseCount: 2,
};

const ranking = calculateCourseRanking(sampleMetrics);
console.log(explainRanking(ranking));
```

**Expected Output:**

```
Final Score: 78.35/100

Quality: 82.5/100 (40% weight)
Engagement: 76.2/100 (30% weight)
Accessibility: 75.0/100 (20% weight)
Freshness: 100.0/100 (10% weight)
```

**Expected Results:**

- ✅ Algorithm weights are transparent (no hidden factors)
- ✅ Explanation shows breakdown by category
- ✅ New instructors get boost (freshness score)

---

## ✅ Option C: Personalized Student Experience

### Test 6: View Personalized Dashboard

**Steps:**

1. Login as a regular user (not admin)
2. Navigate to `http://localhost:3000/dashboard`
3. Scroll to "Continue Learning" section (if user has enrolled courses)

**Expected Results (with enrolled courses):**

- ✅ "Continue Learning" section displays
- ✅ Shows in-progress courses
- ✅ Progress bar displays completion percentage
- ✅ "Last accessed" timestamp shown

**Expected Results (new user, no enrollments):**

- ✅ Empty state displays
- ✅ Message: "Start Your Learning Journey"
- ✅ "Browse Courses" button appears

---

### Test 7: View AI Recommendations

**Steps:**

1. Still on dashboard (`http://localhost:3000/dashboard`)
2. Scroll to "Recommended for You" section

**Expected Results (with enrollment history):**

- ✅ AI-generated recommendations display
- ✅ Match percentage shown (e.g., "85% Match")
- ✅ Reasons displayed (e.g., "Matches your interest in Web Development")
- ✅ Course cards show:
  - Cover image
  - Title
  - Instructor name + avatar
  - Rating (if available)
  - Topic tags

**API Check:**

```
GET http://localhost:3000/api/recommendations?limit=6
```

**Expected Response:**

```json
{
  "success": true,
  "recommendations": [
    {
      "courseId": "...",
      "score": 85.5,
      "reasons": [
        "Matches your interest in Web Development, AI",
        "Popular with similar learners",
        "Recently updated content"
      ],
      "course": {
        "id": "...",
        "title": "Advanced Next.js Development",
        "coverImage": "...",
        "instructor": { "name": "John Doe", "image": "..." },
        ...
      }
    }
  ]
}
```

---

### Test 8: Recommendation Engine Accuracy

**Steps:**

1. Enroll in a course (e.g., "Web Development Basics")
2. Complete 50% of the course
3. Wait a few minutes (or clear cache)
4. Refresh dashboard

**Expected Results:**

- ✅ "Continue Learning" shows partially completed course
- ✅ "Recommended for You" shows related courses:
  - Similar topics (e.g., more web development courses)
  - Appropriate difficulty (if beginner course → more beginner/intermediate courses)
  - High engagement (popular courses prioritized)

**Verify Scoring:**

- Open browser DevTools → Network tab
- Reload dashboard
- Find `/api/recommendations` request
- Check response for `score` values (should be 0-100)
- Higher scores = better match

---

## 🐛 Common Issues & Solutions

### Issue 1: "Unauthorized" error

**Cause**: Not logged in or session expired.  
**Solution**: Logout and login again.

### Issue 2: Recommendations section empty

**Cause**: No courses in database OR user has enrolled in all courses.  
**Solution**:

- Seed database with sample courses
- Create test accounts with different enrollment histories

### Issue 3: Audit logs not appearing

**Cause**: Actions performed before migration.  
**Solution**: Perform new actions (approve/reject applications) after migration.

### Issue 4: Application form disabled

**Cause**: Already have pending/approved application.  
**Solution**:

- Check status at bottom of `/become-instructor` page
- If testing, delete application from database:
  ```sql
  DELETE FROM "InstructorApplication" WHERE "userId" = '<your-user-id>';
  ```

---

## 📊 Testing Metrics

Track these metrics during testing:

### Option A Metrics

- [ ] Application submission works (no errors)
- [ ] Admin can view all applications
- [ ] Approve action upgrades user role
- [ ] Reject action saves reason
- [ ] Status updates visible to applicant

### Option B Metrics

- [ ] All admin actions logged
- [ ] Audit log displays in dashboard
- [ ] Filters work correctly
- [ ] Ranking algorithm is transparent
- [ ] No hidden scoring factors

### Option C Metrics

- [ ] Personalized feed renders
- [ ] Continue Learning shows in-progress courses
- [ ] Recommendations include match percentage
- [ ] Reasons display (at least 1 per course)
- [ ] Empty state shows for new users

---

## ✅ Final Checklist

Before marking V1 as production-ready:

### Functionality

- [ ] All 15 files created/updated
- [ ] Database migration completed
- [ ] No TypeScript errors (`npm run build`)
- [ ] All 8 tests passed

### User Experience

- [ ] Forms have validation
- [ ] Error messages are clear
- [ ] Loading states display
- [ ] Responsive design works (mobile/desktop)

### Performance

- [ ] API responses < 500ms
- [ ] Recommendations cached (1-hour TTL)
- [ ] No N+1 queries (check Prisma logs)

### Security

- [ ] Admin routes protected (role check)
- [ ] User can't see other users' applications
- [ ] SQL injection prevented (Prisma ORM)
- [ ] XSS prevented (React auto-escaping)

---

## 🎉 Success!

If all tests pass:

- ✅ **Option A**: Instructor onboarding complete
- ✅ **Option B**: Governance system operational
- ✅ **Option C**: Personalized recommendations working

**Dynasty Academy V1 is LIVE! 🚀**

Next: Deploy to production and monitor real user behavior!
