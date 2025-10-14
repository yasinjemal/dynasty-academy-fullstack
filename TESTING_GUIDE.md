# 🧪 Dynasty Academy - Testing Guide

**Date:** October 14, 2025  
**Status:** All APIs Fixed & Ready for Testing  
**Dev Server:** http://localhost:3000

---

## ✅ **What's Ready to Test**

### **1. Posts System**
All endpoints working and TypeScript error-free:

**Create Post:**
```bash
POST http://localhost:3000/api/posts
Content-Type: application/json

{
  "title": "My First Dynasty Post",
  "content": "This is my first post on Dynasty Academy! I'm excited to share my journey...",
  "tags": ["mindset", "learning"],
  "published": true
}

# Response:
# - Returns post with slug
# - Awards +10 Dynasty Score
# - Creates FeedItem
# - Success message
```

**List Posts:**
```bash
GET http://localhost:3000/api/posts?limit=20&sortBy=hot

# Response:
# - Paginated posts
# - Sorted by hot score (quality + freshness)
# - Author info included
# - nextCursor for pagination
```

**Get Single Post:**
```bash
GET http://localhost:3000/api/posts/my-first-dynasty-post-abc123

# Response:
# - Full post content
# - Author details
# - Like/comment counts
# - View tracking
```

---

### **2. Like System**
```bash
POST http://localhost:3000/api/posts/{postId}/like

# Response:
# - Toggles like (on/off)
# - Updates likeCount
# - Creates notification for author
# - Awards Dynasty Score for milestones (5 likes, 10 likes, etc.)
```

---

### **3. Comment System**
```bash
POST http://localhost:3000/api/posts/{postId}/comments
Content-Type: application/json

{
  "content": "Great post! Really helpful insights.",
  "parentId": null
}

# Response:
# - Creates comment
# - Awards +3 Dynasty Score (capped at 10/day)
# - Creates notification for post author
# - Updates post commentCount
# - Returns comment with author info
```

**Threaded Replies:**
```bash
POST http://localhost:3000/api/posts/{postId}/comments
Content-Type: application/json

{
  "content": "Thanks! Glad it helped.",
  "parentId": "{parentCommentId}"
}

# Response:
# - Creates reply to comment
# - Notifies parent comment author
# - Threaded structure
```

---

### **4. Feed System**
```bash
# Hot Feed (Quality + Freshness)
GET http://localhost:3000/api/feed?type=home&limit=20

# Following Feed
GET http://localhost:3000/api/feed?type=following&limit=20

# Topic Feed
GET http://localhost:3000/api/feed?type=topic&topic=mindset&limit=20

# Response:
# - Unified feed (posts + reflections)
# - Hot score ranking
# - Author diversity penalty
# - Pagination with nextCursor
```

---

### **5. Reflections System**
```bash
POST http://localhost:3000/api/reflections
Content-Type: application/json

{
  "bookId": "{bookId}",
  "bookTitle": "Atomic Habits",
  "pageNumber": 42,
  "excerpt": "You do not rise to the level of your goals. You fall to the level of your systems.",
  "content": "This quote changed my perspective on habits...",
  "published": true
}

# Response:
# - Creates reflection
# - Awards +12 Dynasty Score
# - Links to book
# - Creates FeedItem
# - Shows on book page
```

**List Reflections:**
```bash
GET http://localhost:3000/api/reflections?bookId={bookId}&limit=20

# Response:
# - Book-specific reflections
# - Paginated
# - Author info
# - Like/comment counts
```

---

## 🎯 **End-to-End Test Flow**

### **Scenario: New User Creates First Post**

**Step 1: Sign In**
```
1. Navigate to http://localhost:3000
2. Click "Sign In"
3. Use Google OAuth or email
4. Redirected to dashboard
```

**Step 2: Create Post**
```
1. Navigate to http://localhost:3000/community
2. Click "Create Post" button
3. Fill in:
   - Title: "My Learning Journey Begins"
   - Content: Rich markdown content
   - Tags: ["mindset", "learning"]
   - Cover image (optional)
4. Click "Publish"

Expected Results:
✅ Post created successfully
✅ Dynasty Score +10 (shown in toast notification)
✅ Redirected to /posts/my-learning-journey-begins-abc123
✅ Post appears in Hot feed
✅ User level progress updated
```

**Step 3: Another User Likes the Post**
```
1. Different user signs in
2. Browses Hot feed at /community
3. Sees "My Learning Journey Begins" post
4. Clicks like button

Expected Results:
✅ Like count increments immediately (optimistic UI)
✅ Heart icon fills with color
✅ Original author receives notification
✅ Like persists on page refresh
```

**Step 4: User Comments on Post**
```
1. Same user clicks "Comment" button
2. Types: "This is so inspiring! Keep it up!"
3. Submits comment

Expected Results:
✅ Comment appears below post
✅ User receives +3 Dynasty Score
✅ Post author receives notification
✅ Comment count increments
✅ Post hot score increases (engagement boost)
```

**Step 5: Original Author Replies**
```
1. Original author clicks notification bell
2. Sees "New Comment" notification
3. Clicks to navigate to post
4. Replies to comment: "Thank you! That means a lot."

Expected Results:
✅ Reply nested under original comment
✅ Commenter receives "New Reply" notification
✅ Threaded conversation visible
✅ Author earns +3 Dynasty Score
```

**Step 6: Post Rises in Hot Feed**
```
1. Navigate to /community (Hot Feed)
2. Check post position

Expected Results:
✅ Post ranked higher due to:
   - Likes (×4 weight)
   - Comments (×6 weight)
   - Recent activity (freshness boost)
✅ Hot score recalculated
✅ Appears in top 5 posts
```

---

## 🏆 **Dynasty Score Testing**

### **Test Point Awards:**

**Create Post (+10):**
```bash
POST /api/posts
# Check user.dynastyScore increased by 10
# Check DynastyActivity log created
```

**Write Reflection (+12):**
```bash
POST /api/reflections
# Check user.dynastyScore increased by 12
# Check activity log
```

**Comment on Post (+3, cap 10/day):**
```bash
POST /api/posts/{id}/comments
# First comment: +3 DS
# Second comment: +3 DS
# 10th comment: +3 DS (30 total)
# 11th comment: +0 DS (daily cap reached)
```

**Daily Login (+2):**
```bash
# Check lastActiveAt updated
# If > 24 hours since last login: +2 DS
```

**Streak Bonuses:**
```bash
# 7-day streak: +50 DS
# 30-day streak: +200 DS
# 100-day streak: +1000 DS
# Check user.streakDays field
```

**Level Up:**
```bash
# Level 1 → Level 2: 100 points
# Level 2 → Level 3: 400 points
# Level 3 → Level 4: 900 points
# Formula: nextLevel = 100 * level²

# Expected Results:
# - user.level increments
# - LEVEL_UP notification created
# - Confetti animation (frontend)
```

---

## 📊 **Hot Score Testing**

### **Algorithm:**
```
hotScore = ln(1 + likes*4 + comments*6 + views*0.5) + freshnessBoost
freshnessBoost = max(0, 24 - hoursSincePublish) * 0.03
```

### **Test Cases:**

**Fresh Post with Engagement:**
```
Post A (2 hours old):
- 10 likes, 5 comments, 50 views
- hotScore = ln(1 + 40 + 30 + 25) + (24-2)*0.03
- hotScore = ln(96) + 0.66 = 4.56 + 0.66 = 5.22
```

**Old Post with High Engagement:**
```
Post B (30 hours old):
- 50 likes, 20 comments, 500 views
- hotScore = ln(1 + 200 + 120 + 250) + 0
- hotScore = ln(571) = 6.35
```

**Recent Post, Low Engagement:**
```
Post C (1 hour old):
- 2 likes, 1 comment, 10 views
- hotScore = ln(1 + 8 + 6 + 5) + (24-1)*0.03
- hotScore = ln(20) + 0.69 = 3.00 + 0.69 = 3.69
```

**Expected Feed Order:** Post B > Post A > Post C

---

## 🔔 **Notification Testing**

### **Types to Test:**

**LIKE Notification:**
```
Trigger: User likes a post
Expected:
- Title: "New Like"
- Message: "{userName} liked your post"
- actorId: Liker's userId
- entityType: "POST"
- entityId: postId
- seen: false
- Bell icon shows badge count
```

**COMMENT Notification:**
```
Trigger: User comments on a post
Expected:
- Title: "New Comment"
- Message: "{userName} commented on your post"
- Click → Navigate to post
- Mark as read on click
```

**REPLY Notification:**
```
Trigger: User replies to a comment
Expected:
- Title: "New Reply"
- Message: "{userName} replied to your comment"
- actorId: Replier's userId
- entityType: "POST_COMMENT"
```

**FOLLOW Notification:**
```
Trigger: User follows another user
Expected:
- Title: "New Follower"
- Message: "{userName} followed you"
- Click → Navigate to follower's profile
```

**LEVEL_UP Notification:**
```
Trigger: User gains enough DS to level up
Expected:
- Title: "Level Up!"
- Message: "Congratulations! You reached Level {level}"
- Confetti animation
- Show new level badge
```

---

## 🎨 **Frontend Testing**

### **Community Page (/community)**

**Tabs:**
```
✅ Hot Feed - Default, shows all published posts/reflections
✅ Following Feed - Shows content from followed users only
✅ Topic Feed - Filter by topic tags (Mindset, Business, etc.)
```

**Features to Test:**
```
✅ Infinite scroll - Loads more posts on scroll
✅ Hot score ranking - Engaging posts appear first
✅ Search bar - Find posts, users, tags
✅ Create Post button - Opens modal
✅ Topic sidebar - Filter by category
✅ Dynasty Score widget - Shows level, progress, streak
```

### **Post Detail Page (/posts/[slug])**

**Features:**
```
✅ Full post content with markdown rendering
✅ Author card with follow button
✅ Like button (optimistic UI)
✅ Comment section (threaded)
✅ Share button
✅ Bookmark button
✅ View count
✅ Related posts
```

### **Profile Page (/@username)**

**Tabs:**
```
✅ Overview - Stats, recent activity, achievements
✅ Posts - User's published posts
✅ Reflections - User's book reflections
✅ Collections - Saved content collections
```

**Features:**
```
✅ Dynasty Score display
✅ Level badge
✅ Streak counter
✅ Achievement showcase
✅ Follow/Unfollow button
✅ Recent activity feed
```

---

## 🚨 **Error Handling Tests**

### **Validation Errors:**

**Invalid Post Creation:**
```bash
POST /api/posts
{
  "title": "Ab",  # Too short (min 3)
  "content": "Short",  # Too short (min 10)
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"]  # Too many (max 5)
}

Expected Response (400):
{
  "error": "Validation failed",
  "details": [
    { "field": "title", "message": "Title must be at least 3 characters" },
    { "field": "content", "message": "Content must be at least 10 characters" },
    { "field": "tags", "message": "Maximum 5 tags allowed" }
  ]
}
```

### **Authorization Errors:**

**Unauthenticated Request:**
```bash
POST /api/posts
# No auth header

Expected Response (401):
{
  "error": "Unauthorized - Please sign in to create posts"
}
```

**Banned User:**
```bash
# User with isBanned: true tries to post

Expected Response (403):
{
  "error": "You are banned from creating content"
}
```

**Suspended User:**
```bash
# User with isSuspended: true, suspendedUntil: future date

Expected Response (403):
{
  "error": "You are suspended until {date}"
}
```

---

## 📈 **Performance Tests**

### **Database Query Optimization:**

**Feed Query (should use indexes):**
```sql
-- Check execution plan
EXPLAIN ANALYZE
SELECT * FROM "FeedItem"
WHERE "type" = 'POST'
ORDER BY "hotScore" DESC
LIMIT 20;

-- Expected: Index scan on (type, hotScore)
-- Execution time: < 50ms
```

**Post List with Author (should avoid N+1):**
```sql
-- Single query with JOIN
EXPLAIN ANALYZE
SELECT p.*, u.* FROM "Post" p
JOIN "User" u ON p."authorId" = u."id"
ORDER BY p."hotScore" DESC
LIMIT 20;

-- Expected: Hash Join
-- Execution time: < 100ms
```

### **API Response Times:**

**Target P95:**
```
GET /api/posts - < 250ms
POST /api/posts - < 500ms
GET /api/feed - < 300ms
POST /api/posts/{id}/like - < 150ms
POST /api/posts/{id}/comments - < 400ms
```

---

## ✅ **Testing Checklist**

### **Core Functionality:**
- [ ] Create post → Earn +10 DS
- [ ] Post appears in Hot feed
- [ ] Like post → Notification sent
- [ ] Unlike post → Like removed
- [ ] Comment → Earn +3 DS (max 10/day)
- [ ] Reply → Threaded correctly
- [ ] Create reflection → Earn +12 DS
- [ ] Follow user → FOLLOW notification
- [ ] Level up → LEVEL_UP notification

### **Feed Ranking:**
- [ ] Fresh posts with engagement rank high
- [ ] Old posts with low engagement rank low
- [ ] Same author repeated → Diversity penalty
- [ ] Hot score recalculates on engagement

### **Dynasty Score:**
- [ ] Points awarded correctly per action
- [ ] Daily caps enforced (comments, follows)
- [ ] Streak tracking works
- [ ] Level calculation correct
- [ ] Activity log created for each award

### **Notifications:**
- [ ] Bell icon shows unread count
- [ ] Click notification → Navigate to entity
- [ ] Mark as read → Badge count decreases
- [ ] All notification types working

### **UI/UX:**
- [ ] Optimistic UI updates (likes, follows)
- [ ] Loading states shown
- [ ] Error toasts displayed
- [ ] Success messages shown
- [ ] Mobile responsive
- [ ] Smooth animations

---

## 🎉 **Success Criteria**

Your Dynasty Academy platform is **production-ready** when:

✅ All API endpoints return correct responses  
✅ TypeScript compilation: 0 errors  
✅ Dynasty Score system awards points accurately  
✅ Hot score ranking reflects quality + freshness  
✅ Notifications sent and received properly  
✅ Frontend UI/UX is smooth and responsive  
✅ Database queries optimized (< 100ms average)  
✅ No console errors in browser  
✅ All features work on mobile  
✅ End-to-end flow: Post → Like → Comment → Notification works  

---

**Ready to test?** Start with the end-to-end flow and let me know what you find! 🚀
