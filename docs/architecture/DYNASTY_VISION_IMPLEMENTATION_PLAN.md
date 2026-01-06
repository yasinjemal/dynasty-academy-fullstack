# 🏛️ Dynasty Built Academy - Implementation Roadmap

## 📋 Current Status Assessment

### ✅ What We Have (Phase 1-2 Complete)
- Database schema with Users, Books, BlogPosts, Comments, Likes, Follows
- Auth system (NextAuth with Google OAuth)
- E-commerce (Stripe, Cart, Orders, Purchases)
- Audio system (ElevenLabs integration)
- Basic community (ForumTopics, ForumPosts, BookReflections)
- Basic achievements (Achievement, UserAchievement models)
- Leaderboard page (showing activityScore)
- Public profiles (/@username)

### ❌ What's Missing (Your Vision)
- **Dynasty Score System** (comprehensive points engine)
- **Post/Reflection models** (separate from BlogPost/ForumTopic)
- **FeedItem aggregation** (unified feed)
- **Hot Score algorithm** (quality-weighted ranking)
- **Notifications system** (in-app bell dropdown)
- **Quest system** (daily/weekly challenges)
- **Collections** (save/organize feature)
- **Moderation system** (reports, admin actions)
- **DynastyActivity** (event log for all DS awards)
- **Search** (users + posts + tags)
- **Streaks tracking** (consecutive day activity)

---

## 🎯 Phase 3: Core Engagement (NOW - Week 1-2)

### Priority 1: Dynasty Score Engine
**Goal:** Implement the point system that drives all behavior

#### Database Changes Needed:
```prisma
model User {
  // Add these fields:
  dynastyScore    Int      @default(0)
  level           Int      @default(1)
  streakDays      Int      @default(0)
  lastActiveAt    DateTime?
  isMentor        Boolean  @default(false)
  isSuspended     Boolean  @default(false)
  suspendedUntil  DateTime?
  isBanned        Boolean  @default(false)
  banReason       String?
  username        String?  @unique  // For /@username (may already exist)
}

model Post {
  id            String   @id @default(cuid())
  authorId      String
  author        User     @relation("UserPosts", fields: [authorId], references: [id])
  title         String
  slug          String   @unique
  content       String   @db.Text
  excerpt       String?
  coverImage    String?
  tags          String[]
  
  viewCount     Int      @default(0)
  likeCount     Int      @default(0)
  commentCount  Int      @default(0)
  saveCount     Int      @default(0)
  hotScore      Float    @default(0)
  
  published     Boolean  @default(true)
  publishedAt   DateTime @default(now())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  comments      PostComment[]
  likes         PostLike[]
  collections   CollectionItem[]
  
  @@index([slug])
  @@index([authorId])
  @@index([hotScore])
  @@index([publishedAt])
}

model Reflection {
  id            String   @id @default(cuid())
  authorId      String
  author        User     @relation("UserReflections", fields: [authorId], references: [id])
  bookId        String
  book          Book     @relation("BookReflections", fields: [bookId], references: [id])
  bookTitle     String
  pageNumber    Int?
  excerpt       String?  @db.Text
  content       String   @db.Text
  
  likeCount     Int      @default(0)
  commentCount  Int      @default(0)
  hotScore      Float    @default(0)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  comments      ReflectionComment[]
  likes         ReflectionLike[]
  
  @@index([authorId])
  @@index([bookId])
  @@index([hotScore])
}

model PostComment {
  id         String   @id @default(cuid())
  authorId   String
  author     User     @relation("UserPostComments", fields: [authorId], references: [id])
  postId     String
  post       Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  parentId   String?
  parent     PostComment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies    PostComment[] @relation("CommentReplies")
  
  content    String   @db.Text
  likeCount  Int      @default(0)
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@index([postId])
  @@index([authorId])
}

model ReflectionComment {
  id           String   @id @default(cuid())
  authorId     String
  author       User     @relation("UserReflectionComments", fields: [authorId], references: [id])
  reflectionId String
  reflection   Reflection @relation(fields: [reflectionId], references: [id], onDelete: Cascade)
  parentId     String?
  parent       ReflectionComment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies      ReflectionComment[] @relation("CommentReplies")
  
  content      String   @db.Text
  likeCount    Int      @default(0)
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@index([reflectionId])
  @@index([authorId])
}

model PostLike {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation("UserPostLikes", fields: [userId], references: [id])
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  
  @@unique([userId, postId])
}

model ReflectionLike {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation("UserReflectionLikes", fields: [userId], references: [id])
  reflectionId String
  reflection   Reflection @relation(fields: [reflectionId], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now())
  
  @@unique([userId, reflectionId])
}

model FeedItem {
  id          String   @id @default(cuid())
  type        FeedType
  postId      String?
  post        Post?    @relation(fields: [postId], references: [id], onDelete: Cascade)
  reflectionId String?
  reflection  Reflection? @relation(fields: [reflectionId], references: [id], onDelete: Cascade)
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  publishedAt DateTime
  hotScore    Float    @default(0)
  tags        String[]
  
  createdAt   DateTime @default(now())
  
  @@index([hotScore])
  @@index([publishedAt])
  @@index([authorId])
  @@index([type])
}

enum FeedType {
  POST
  REFLECTION
}

model DynastyActivity {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation("UserActivities", fields: [userId], references: [id])
  action     String   // "CREATE_POST", "WRITE_REFLECTION", "COMMENT", "LIKE", etc.
  points     Int
  entityType String?  // "POST", "REFLECTION", "COMMENT"
  entityId   String?
  metadata   Json?    // Additional context
  createdAt  DateTime @default(now())
  
  @@index([userId])
  @@index([createdAt])
}

model Notification {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation("UserNotifications", fields: [userId], references: [id])
  type       NotificationType
  actorId    String?
  actor      User?    @relation("NotificationActors", fields: [actorId], references: [id])
  entityType String?  // "POST", "COMMENT", "FOLLOW"
  entityId   String?
  title      String
  message    String?
  link       String?
  seen       Boolean  @default(false)
  createdAt  DateTime @default(now())
  
  @@index([userId])
  @@index([seen])
  @@index([createdAt])
}

enum NotificationType {
  LIKE
  COMMENT
  FOLLOW
  MENTION
  ACHIEVEMENT
  LEVEL_UP
}

model Collection {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation("UserCollections", fields: [userId], references: [id])
  title       String
  slug        String
  description String?
  isPublic    Boolean  @default(false)
  items       CollectionItem[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([userId, slug])
  @@index([userId])
}

model CollectionItem {
  id           String   @id @default(cuid())
  collectionId String
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  entityType   String   // "POST", "REFLECTION"
  entityId     String
  post         Post?    @relation(fields: [entityId], references: [id])
  addedAt      DateTime @default(now())
  
  @@index([collectionId])
}

model Quest {
  id          String   @id @default(cuid())
  title       String
  description String
  type        QuestType
  requirement Json     // {type: "posts", count: 3, period: "weekly"}
  reward      Int      // Dynasty Score points
  isActive    Boolean  @default(true)
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime @default(now())
  
  userQuests  UserQuest[]
}

enum QuestType {
  DAILY
  WEEKLY
  SPECIAL
}

model UserQuest {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  questId    String
  quest      Quest    @relation(fields: [questId], references: [id])
  progress   Int      @default(0)
  completed  Boolean  @default(false)
  completedAt DateTime?
  createdAt  DateTime @default(now())
  
  @@unique([userId, questId])
  @@index([userId])
}

model Report {
  id              String   @id @default(cuid())
  type            ReportType
  reason          ReportReason
  status          ReportStatus @default(PENDING)
  reporterId      String
  reporter        User     @relation("UserReports", fields: [reporterId], references: [id])
  targetUserId    String?
  targetPostId    String?
  targetCommentId String?
  description     String?  @db.Text
  moderatorNotes  String?  @db.Text
  resolvedAt      DateTime?
  createdAt       DateTime @default(now())
  
  @@index([status])
  @@index([type])
}

enum ReportType {
  POST
  USER
  COMMENT
}

enum ReportReason {
  SPAM
  HARASSMENT
  INAPPROPRIATE
  MISINFORMATION
  OTHER
}

enum ReportStatus {
  PENDING
  REVIEWING
  RESOLVED
  DISMISSED
}
```

#### Implementation Files:
1. **src/lib/dynasty-score.ts** - Core scoring engine
2. **src/lib/hot-score.ts** - Feed ranking algorithm
3. **src/lib/validations/post.ts** - Zod schemas
4. **src/app/api/posts/route.ts** - CRUD endpoints
5. **src/app/api/reflections/route.ts** - CRUD endpoints
6. **src/app/api/feed/route.ts** - Unified feed
7. **src/app/api/notifications/route.ts** - Bell notifications
8. **src/app/api/notifications/mark-seen/route.ts** - Mark read
9. **src/components/shared/CreatePostModal.tsx** - Composer
10. **src/components/shared/FeedItem.tsx** - Feed card
11. **src/components/shared/NotificationDropdown.tsx** - Bell UI

---

## 🎯 Phase 4: Growth & Retention (Week 3-4)

### Priority 2: Search & Discovery
- Global search (users + posts + reflections + tags)
- "People to Follow" recommendations
- "Similar Posts" algorithm
- Trending topics

### Priority 3: Collections & Bookmarking
- Save posts/reflections
- Organize into collections
- Public collection pages

### Priority 4: Quests System
- Daily quest: "Post 1 reflection"
- Weekly quest: "Get 5 comments"
- Special quest: "7-day streak"

---

## 🎯 Phase 5: Moderation & Safety (Week 5-6)

### Priority 5: Moderation Tools
- Report system (spam, harassment, etc.)
- Admin dashboard (/admin/moderation)
- Suspend/ban actions
- Audit log

### Priority 6: Email Notifications
- Welcome email
- Weekly digest (top posts)
- Comment/like/follow alerts
- User preferences

---

## 🚀 Immediate Action Items (Next 2 Hours)

1. ✅ Create migration plan
2. ⏳ Update Prisma schema with new models
3. ⏳ Run migration
4. ⏳ Create dynasty-score.ts utility
5. ⏳ Create hot-score.ts utility
6. ⏳ Create Zod validation schemas
7. ⏳ Implement POST /api/posts
8. ⏳ Implement GET /api/feed
9. ⏳ Build CreatePostModal component
10. ⏳ Build FeedItem component

---

## 📊 Success Metrics

### Week 1 Target:
- [ ] Users can create posts
- [ ] Users can write reflections
- [ ] Dynasty Score updates on actions
- [ ] Feed shows ranked content
- [ ] Hot score algorithm working

### Week 2 Target:
- [ ] Notifications bell working
- [ ] Search functional
- [ ] Collections working
- [ ] Quests display + progress

### Week 4 Target:
- [ ] Moderation dashboard live
- [ ] Email notifications sent
- [ ] 7-day retention > 40%
- [ ] Avg posts/user/week > 2

---

## 🎨 UI/UX Notes

### Feed Design:
- Infinite scroll
- Mix of posts + reflections
- Author card (avatar, name, level, follow button)
- Hot/Following/Topic tabs
- "Create" FAB button (mobile)

### Composer:
- Title + rich text editor (start with textarea, upgrade to TipTap)
- Tag selector (autocomplete)
- Cover image upload (optional)
- "Share as Reflection" toggle (links to book)
- Preview mode

### Notifications:
- Bell icon (header)
- Red badge (unread count)
- Dropdown (10 recent)
- "See All" → /notifications
- Types: like, comment, follow, mention, achievement, level-up

---

## 🔥 Quick Wins (Low-Hanging Fruit)

1. **Streaks Widget** - Show "🔥 X Day Streak" on dashboard
2. **Level Progress Bar** - Visual DS → next level
3. **Recent Activity Feed** - On user profile
4. **Earn Points List** - Sidebar widget showing ways to earn
5. **Toast Notifications** - "+10 DS" on actions

---

## 💡 Notes

- Keep BlogPost model for marketing/SEO content
- Post model is for community content
- BookReflection can be mapped to Reflection (or keep separate)
- Use ForumTopic/ForumPost OR new Post/Comment (decide based on existing data)
- Hot score recalculates on cron job (every 5 min)
- DS awards are idempotent (check DynastyActivity before granting)

---

**Ready to start?** Let's begin with the schema migration! 🚀
