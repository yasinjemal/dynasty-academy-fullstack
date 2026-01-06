# 🎨 Community Feed Luxury Design Patterns

## Extracted from Dynasty Built Academy Community Feed

---

## 📋 **TABLE OF CONTENTS**

1. [Post Card Design Patterns](#1-post-card-design-patterns)
2. [Feed Layout & Navigation](#2-feed-layout--navigation)
3. [Comment Section Patterns](#3-comment-section-patterns)
4. [Engagement Interactions](#4-engagement-interactions)
5. [Mobile-First Responsive Design](#5-mobile-first-responsive-design)
6. [Loading & Empty States](#6-loading--empty-states)
7. [Infinite Scroll Implementation](#7-infinite-scroll-implementation)
8. [Social Features (Follow/Share)](#8-social-features-followshare)
9. [Topic & Hashtag Display](#9-topic--hashtag-display)
10. [User Profile Widgets](#10-user-profile-widgets)

---

## 1. POST CARD DESIGN PATTERNS

### **Main Post Card Component**

```tsx
<Link href={`/community/posts/${post.slug}`}>
  <div
    className="
    bg-white dark:bg-slate-800 
    rounded-xl 
    border border-slate-200 dark:border-slate-700 
    p-6 
    hover:border-purple-500 dark:hover:border-purple-500 
    transition-all duration-300
    cursor-pointer 
    group
    hover:shadow-xl hover:shadow-purple-500/10
    hover:scale-[1.02]
  "
  >
    {/* Card Content */}
  </div>
</Link>
```

**Key Features:**

- ✨ Gradient border on hover (purple glow)
- 🎯 Scale transform on hover (1.02x)
- 🌙 Dark mode support
- 📱 Group hover states for nested elements
- 🎨 Smooth transitions (300ms)

---

### **Author Header with Dynasty Score**

```tsx
<div className="flex items-center gap-3 mb-4">
  {/* Avatar */}
  <img
    src={post.author.image || "/default-avatar.png"}
    alt={post.author.name}
    className="
      w-10 h-10 
      rounded-full 
      ring-2 ring-purple-500/20
      group-hover:ring-purple-500/50
      transition-all
    "
  />

  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2 flex-wrap">
      {/* Author Name */}
      <span
        className="
        font-medium 
        text-slate-900 dark:text-white
        group-hover:text-purple-600 dark:group-hover:text-purple-400
        transition-colors
      "
      >
        {post.author.name}
      </span>

      {/* Dynasty Level Badge */}
      <span
        className="
        inline-flex items-center gap-1
        px-2 py-0.5
        bg-gradient-to-r from-amber-500 to-orange-500
        text-white text-xs font-bold
        rounded-full
        shadow-sm shadow-amber-500/30
      "
      >
        <span className="animate-pulse">⭐</span>
        Lv.{Math.floor(post.author.dynastyScore / 100)}
      </span>
    </div>

    {/* Username & Timestamp */}
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <span>@{post.author.username}</span>
      <span>·</span>
      <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
    </div>
  </div>

  {/* Options Menu */}
  <button
    className="
    opacity-0 group-hover:opacity-100
    transition-opacity
    p-2 
    hover:bg-slate-100 dark:hover:bg-slate-700
    rounded-lg
    touch-manipulation
    min-w-[44px] min-h-[44px]
  "
  >
    <MoreHorizontal className="w-5 h-5" />
  </button>
</div>
```

---

### **Post Content Area**

```tsx
{
  /* Title */
}
<h3
  className="
  text-xl font-bold 
  text-slate-900 dark:text-white 
  mb-2 
  group-hover:text-purple-600 dark:group-hover:text-purple-400 
  transition-colors duration-300
  line-clamp-2
"
>
  {post.title}
</h3>;

{
  /* Excerpt */
}
<p
  className="
  text-slate-600 dark:text-slate-300 
  mb-4 
  line-clamp-3
  text-sm sm:text-base
"
>
  {post.excerpt}
</p>;

{
  /* Rich Media Preview (if available) */
}
{
  post.imageUrl && (
    <div className="relative mb-4 overflow-hidden rounded-lg">
      <img
        src={post.imageUrl}
        alt={post.title}
        className="
        w-full h-48 object-cover
        group-hover:scale-105
        transition-transform duration-500
      "
      />
      {/* Gradient overlay */}
      <div
        className="
      absolute inset-0 
      bg-gradient-to-t from-slate-900/60 to-transparent
      opacity-0 group-hover:opacity-100
      transition-opacity
    "
      />
    </div>
  );
}
```

---

### **Topic Tags Display**

```tsx
{
  post.topics.length > 0 && (
    <div className="flex flex-wrap gap-2 mb-4">
      {post.topics.slice(0, 3).map((topic) => (
        <button
          key={topic}
          onClick={(e) => {
            e.preventDefault(); // Don't navigate to post
            filterByTopic(topic);
          }}
          className="
          px-3 py-1 
          bg-purple-100 dark:bg-purple-900/30 
          text-purple-700 dark:text-purple-300 
          rounded-full 
          text-sm font-medium
          hover:bg-purple-200 dark:hover:bg-purple-900/50
          hover:scale-105
          transition-all duration-200
          touch-manipulation
        "
        >
          #{topic}
        </button>
      ))}
      {post.topics.length > 3 && (
        <span
          className="
        px-3 py-1 
        text-slate-500 dark:text-slate-400 
        text-sm
      "
        >
          +{post.topics.length - 3} more
        </span>
      )}
    </div>
  );
}
```

---

### **Engagement Stats Row**

```tsx
<div
  className="
  flex items-center gap-6 
  text-slate-500 dark:text-slate-400
  pt-4 border-t border-slate-200 dark:border-slate-700
"
>
  {/* Like Button */}
  <button
    onClick={handleLike}
    className={`
      flex items-center gap-2 
      hover:text-red-500 
      transition-colors duration-200
      p-2 -m-2
      rounded-lg
      hover:bg-red-50 dark:hover:bg-red-900/20
      touch-manipulation
      min-w-[44px] min-h-[44px]
      ${liked ? "text-red-500" : ""}
    `}
    aria-label={liked ? "Unlike post" : "Like post"}
    aria-pressed={liked}
  >
    <Heart
      className={`
      w-5 h-5 
      ${liked ? "fill-current animate-bounce-gentle" : ""}
      transition-all
    `}
    />
    <span className="font-medium">{likeCount}</span>
  </button>

  {/* Comment Button */}
  <button
    className="
    flex items-center gap-2 
    hover:text-blue-500 
    transition-colors
    p-2 -m-2
    rounded-lg
    hover:bg-blue-50 dark:hover:bg-blue-900/20
    touch-manipulation
    min-w-[44px] min-h-[44px]
  "
  >
    <MessageSquare className="w-5 h-5" />
    <span className="font-medium">{post.commentCount}</span>
  </button>

  {/* View Count */}
  <div className="flex items-center gap-2">
    <Eye className="w-5 h-5" />
    <span className="font-medium">{post.viewCount}</span>
  </div>

  {/* Share Button (Right aligned) */}
  <button
    className="
    flex items-center gap-2 
    ml-auto 
    hover:text-purple-500 
    transition-colors
    p-2 -m-2
    rounded-lg
    hover:bg-purple-50 dark:hover:bg-purple-900/20
    touch-manipulation
    min-w-[44px] min-h-[44px]
  "
  >
    <Share2 className="w-5 h-5" />
  </button>
</div>
```

---

## 2. FEED LAYOUT & NAVIGATION

### **Feed Container with Tabs**

```tsx
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
  {/* Feed Header */}
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
      Community Feed
    </h1>
    <button
      className="
      bg-gradient-to-r from-purple-600 to-violet-600
      hover:from-purple-500 hover:to-violet-500
      text-white font-bold
      px-6 py-3 min-h-[44px]
      rounded-xl
      shadow-lg shadow-purple-500/30
      hover:shadow-purple-500/50
      hover:scale-105
      transition-all duration-300
      touch-manipulation
    "
    >
      <Plus className="w-5 h-5 inline mr-2" />
      Create Post
    </button>
  </div>

  {/* Filter Tabs */}
  <FeedTabs active={filter} onChange={setFilter} />

  {/* Posts List */}
  <div className="space-y-4 mt-6">
    {posts.map((post) => (
      <PostCard key={post.id} post={post} />
    ))}
  </div>
</div>
```

---

### **Tab Navigation Component**

```tsx
export default function FeedTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (filter: string) => void;
}) {
  const tabs = [
    { id: "hot", label: "Hot", icon: Flame, color: "orange" },
    { id: "new", label: "New", icon: Clock, color: "blue" },
    { id: "top", label: "Top", icon: TrendingUp, color: "green" },
    { id: "following", label: "Following", icon: Users, color: "purple" },
  ];

  return (
    <div
      className="
      flex items-center gap-2
      overflow-x-auto
      pb-2
      scrollbar-hide
      border-b border-slate-200 dark:border-slate-700
    "
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2
              px-4 py-2 min-h-[44px]
              rounded-lg
              font-medium
              transition-all duration-200
              whitespace-nowrap
              touch-manipulation
              ${
                isActive
                  ? `bg-${tab.color}-100 dark:bg-${tab.color}-900/30 text-${tab.color}-700 dark:text-${tab.color}-300 shadow-sm`
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }
            `}
          >
            <Icon className={`w-5 h-5 ${isActive ? `animate-pulse` : ""}`} />
            <span>{tab.label}</span>
            {isActive && (
              <span
                className="
                ml-1 px-2 py-0.5
                bg-white dark:bg-slate-900
                rounded-full
                text-xs font-bold
              "
              >
                {postCounts[tab.id] || 0}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
```

---

## 3. COMMENT SECTION PATTERNS

### **Comment Form (Primary)**

```tsx
<form onSubmit={handleSubmit} className="mb-8">
  <div
    className="
    bg-slate-50 dark:bg-slate-800/50
    rounded-xl
    border-2 border-slate-200 dark:border-slate-700
    focus-within:border-purple-500
    transition-colors
    overflow-hidden
  "
  >
    <textarea
      value={commentText}
      onChange={(e) => setCommentText(e.target.value)}
      placeholder="Share your thoughts..."
      className="
        w-full 
        px-4 py-3 
        bg-transparent
        text-slate-900 dark:text-white
        placeholder:text-slate-400
        focus:outline-none 
        resize-none
        min-h-[100px]
      "
      rows={3}
    />

    <div
      className="
      flex items-center justify-between 
      px-4 py-3 
      bg-slate-100 dark:bg-slate-800
      border-t border-slate-200 dark:border-slate-700
    "
    >
      {/* Formatting Tools */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
        >
          <Link className="w-4 h-4" />
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!commentText.trim() || submitting}
        className="
          bg-gradient-to-r from-purple-600 to-violet-600
          hover:from-purple-500 hover:to-violet-500
          disabled:from-slate-400 disabled:to-slate-500
          text-white font-bold
          px-6 py-2 min-h-[44px]
          rounded-lg
          shadow-lg shadow-purple-500/30
          hover:shadow-purple-500/50
          disabled:shadow-none
          hover:scale-105
          disabled:scale-100
          disabled:cursor-not-allowed
          transition-all duration-300
          touch-manipulation
        "
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <Wind className="w-4 h-4 animate-spin" />
            Posting...
          </span>
        ) : (
          "Post Comment"
        )}
      </button>
    </div>
  </div>
</form>
```

---

### **Comment Card (Nested Design)**

```tsx
<div
  className={`
  ${
    isReply
      ? "ml-12 border-l-2 border-purple-200 dark:border-purple-800 pl-4"
      : ""
  }
  ${isReply ? "mt-4" : "mb-6"}
`}
>
  <div className="flex gap-3">
    {/* Avatar */}
    <img
      src={comment.author.image || "/default-avatar.png"}
      alt={comment.author.name}
      className="
        w-10 h-10 
        rounded-full 
        ring-2 ring-slate-200 dark:ring-slate-700
      "
    />

    <div className="flex-1 min-w-0">
      {/* Comment Bubble */}
      <div
        className="
        bg-slate-100 dark:bg-slate-800 
        rounded-2xl rounded-tl-none
        p-4
        hover:bg-slate-150 dark:hover:bg-slate-750
        transition-colors
      "
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-slate-900 dark:text-white">
              {comment.author.name}
            </span>
            {comment.author.dynastyScore > 500 && (
              <span
                className="
                px-2 py-0.5
                bg-gradient-to-r from-amber-400 to-orange-400
                text-slate-900 text-xs font-bold
                rounded-full
              "
              >
                ⚡ Expert
              </span>
            )}
            <span className="text-sm text-slate-500">
              {formatDistanceToNow(new Date(comment.createdAt))} ago
            </span>
          </div>

          <button
            className="
            opacity-0 group-hover:opacity-100
            p-1 hover:bg-slate-200 dark:hover:bg-slate-700
            rounded transition-all
          "
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>

      {/* Comment Actions */}
      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
        <button
          onClick={handleLike}
          className={`
            flex items-center gap-1 
            hover:text-red-500 
            transition-colors
            p-2 -m-2 rounded-lg
            touch-manipulation
            ${liked ? "text-red-500" : ""}
          `}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          <span>{likeCount}</span>
        </button>

        <button
          onClick={() => setReplyingTo(comment.id)}
          className="
            flex items-center gap-1 
            hover:text-purple-500 
            transition-colors
            p-2 -m-2 rounded-lg
            touch-manipulation
          "
        >
          <Reply className="w-4 h-4" />
          <span>Reply</span>
        </button>

        {comment.replies?.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="
              flex items-center gap-1 
              hover:text-blue-500 
              transition-colors
              p-2 -m-2 rounded-lg
              touch-manipulation
            "
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showReplies ? "rotate-180" : ""
              }`}
            />
            <span>{comment.replies.length} replies</span>
          </button>
        )}
      </div>

      {/* Nested Replies */}
      {showReplies && comment.replies && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentCard key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  </div>
</div>
```

---

## 4. ENGAGEMENT INTERACTIONS

### **Like Button with Animation**

```tsx
const [liked, setLiked] = useState(false);
const [likeCount, setLikeCount] = useState(initialCount);
const [animating, setAnimating] = useState(false);

const handleLike = async (e: React.MouseEvent) => {
  e.preventDefault();
  if (loading) return;

  // Optimistic UI update
  const newLiked = !liked;
  setLiked(newLiked);
  setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));
  setAnimating(true);

  // Spawn floating hearts
  if (newLiked) {
    spawnFloatingHeart(e.clientX, e.clientY);
  }

  try {
    const res = await fetch(`/api/posts/${slug}/like`, {
      method: "POST",
    });
    const data = await res.json();

    // Sync with server response
    setLiked(data.liked);
    setLikeCount(data.likeCount);
  } catch (error) {
    // Revert on error
    setLiked(!newLiked);
    setLikeCount((prev) => (newLiked ? prev - 1 : prev + 1));
  } finally {
    setTimeout(() => setAnimating(false), 300);
  }
};

// Floating heart animation
function spawnFloatingHeart(x: number, y: number) {
  const heart = document.createElement("div");
  heart.innerHTML = "❤️";
  heart.className = "fixed pointer-events-none text-2xl animate-float-up z-50";
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  document.body.appendChild(heart);

  setTimeout(() => heart.remove(), 1000);
}

return (
  <button
    onClick={handleLike}
    className={`
      relative
      flex items-center gap-2 
      hover:text-red-500 
      transition-all duration-200
      p-2 -m-2
      rounded-lg
      hover:bg-red-50 dark:hover:bg-red-900/20
      touch-manipulation
      ${liked ? "text-red-500" : "text-slate-500"}
      ${animating ? "scale-125" : "scale-100"}
    `}
  >
    <Heart
      className={`
      w-5 h-5 
      transition-all
      ${liked ? "fill-current animate-bounce-gentle" : ""}
    `}
    />
    <span className="font-medium">{likeCount}</span>

    {/* Ripple effect on click */}
    {animating && (
      <span className="absolute inset-0 rounded-lg bg-red-500/20 animate-ping" />
    )}
  </button>
);
```

---

### **Share Menu Dropdown**

```tsx
const [showShareMenu, setShowShareMenu] = useState(false)

<div className="relative">
  <button
    onClick={() => setShowShareMenu(!showShareMenu)}
    className="
      flex items-center gap-2
      hover:text-purple-500
      transition-colors
      p-2 -m-2
      rounded-lg
      hover:bg-purple-50 dark:hover:bg-purple-900/20
      touch-manipulation
    "
  >
    <Share2 className="w-5 h-5" />
  </button>

  {showShareMenu && (
    <div className="
      absolute right-0 bottom-full mb-2
      bg-white dark:bg-slate-800
      border border-slate-200 dark:border-slate-700
      rounded-xl
      shadow-xl
      overflow-hidden
      min-w-[200px]
      z-50
      animate-slide-up
    ">
      <button className="
        w-full flex items-center gap-3
        px-4 py-3
        hover:bg-slate-50 dark:hover:bg-slate-700
        transition-colors
        text-left
      ">
        <Copy className="w-4 h-4" />
        <span>Copy Link</span>
      </button>

      <button className="
        w-full flex items-center gap-3
        px-4 py-3
        hover:bg-slate-50 dark:hover:bg-slate-700
        transition-colors
        text-left
      ">
        <Twitter className="w-4 h-4 text-blue-400" />
        <span>Share on Twitter</span>
      </button>

      <button className="
        w-full flex items-center gap-3
        px-4 py-3
        hover:bg-slate-50 dark:hover:bg-slate-700
        transition-colors
        text-left
      ">
        <Linkedin className="w-4 h-4 text-blue-600" />
        <span>Share on LinkedIn</span>
      </button>
    </div>
  )}
</div>
```

---

## 5. MOBILE-FIRST RESPONSIVE DESIGN

### **Responsive Grid Patterns**

```tsx
// 3-Column Layout (Desktop) → 1-Column (Mobile)
<div
  className="
  grid 
  grid-cols-1 lg:grid-cols-12 
  gap-4 lg:gap-6
"
>
  {/* Left Sidebar */}
  <aside
    className="
    hidden lg:block 
    lg:col-span-3
  "
  >
    <TopicSidebar />
  </aside>

  {/* Main Feed */}
  <main
    className="
    col-span-1 lg:col-span-6
  "
  >
    <CommunityFeed />
  </main>

  {/* Right Sidebar */}
  <aside
    className="
    hidden lg:block 
    lg:col-span-3
  "
  >
    <DynastyScoreWidget />
  </aside>
</div>
```

---

### **Mobile Navigation Bar**

```tsx
{
  /* Mobile-only bottom navigation */
}
<nav
  className="
  lg:hidden
  fixed bottom-0 inset-x-0
  bg-white dark:bg-slate-900
  border-t border-slate-200 dark:border-slate-700
  safe-bottom
  z-50
"
>
  <div className="flex items-center justify-around px-4 py-3">
    {[
      { icon: Home, label: "Feed", active: true },
      { icon: Search, label: "Search" },
      { icon: PlusSquare, label: "Create" },
      { icon: Bell, label: "Notifications", badge: 3 },
      { icon: User, label: "Profile" },
    ].map((item) => {
      const Icon = item.icon;
      return (
        <button
          key={item.label}
          className={`
            relative
            flex flex-col items-center gap-1
            p-2 min-w-[60px]
            transition-colors
            touch-manipulation
            ${
              item.active
                ? "text-purple-600"
                : "text-slate-400 hover:text-slate-600"
            }
          `}
        >
          <Icon className="w-6 h-6" />
          <span className="text-xs font-medium">{item.label}</span>

          {item.badge && (
            <span
              className="
              absolute top-0 right-2
              w-5 h-5
              bg-red-500 text-white
              text-xs font-bold
              rounded-full
              flex items-center justify-center
              animate-pulse
            "
            >
              {item.badge}
            </span>
          )}
        </button>
      );
    })}
  </div>
</nav>;
```

---

## 6. LOADING & EMPTY STATES

### **Loading Skeleton (Post Card)**

```tsx
export function PostCardSkeleton() {
  return (
    <div
      className="
      bg-white dark:bg-slate-800 
      rounded-xl 
      border border-slate-200 dark:border-slate-700 
      p-6
      animate-pulse
    "
    >
      {/* Author skeleton */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-slate-300 dark:bg-slate-700 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-32 mb-2" />
          <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-24" />
        </div>
      </div>

      {/* Title skeleton */}
      <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded w-full mb-2" />
      <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded w-2/3 mb-4" />

      {/* Content skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-full" />
        <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-full" />
        <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-4/5" />
      </div>

      {/* Stats skeleton */}
      <div className="flex items-center gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="h-5 bg-slate-200 dark:bg-slate-600 rounded w-12" />
        <div className="h-5 bg-slate-200 dark:bg-slate-600 rounded w-12" />
        <div className="h-5 bg-slate-200 dark:bg-slate-600 rounded w-12" />
      </div>
    </div>
  );
}

// Usage
{
  loading ? (
    <>
      <PostCardSkeleton />
      <PostCardSkeleton />
      <PostCardSkeleton />
    </>
  ) : (
    posts.map((post) => <PostCard key={post.id} post={post} />)
  );
}
```

---

### **Empty State Illustrations**

```tsx
export function EmptyFeedState({ filter }: { filter: string }) {
  const emptyStates = {
    hot: {
      icon: Flame,
      title: "No hot posts yet",
      description: "Be the first to ignite the conversation!",
      action: "Create Post",
      emoji: "🔥",
    },
    following: {
      icon: Users,
      title: "Your feed is empty",
      description: "Follow users to see their posts here",
      action: "Find People",
      emoji: "👥",
    },
    new: {
      icon: Clock,
      title: "No new posts",
      description: "Check back soon for fresh content",
      emoji: "⏰",
    },
  };

  const state = emptyStates[filter] || emptyStates.hot;

  return (
    <div
      className="
      flex flex-col items-center justify-center
      py-16 px-4
      text-center
    "
    >
      {/* Animated icon */}
      <div
        className="
        w-24 h-24
        bg-gradient-to-br from-purple-100 to-blue-100
        dark:from-purple-900/30 dark:to-blue-900/30
        rounded-full
        flex items-center justify-center
        mb-6
        animate-bounce-gentle
      "
      >
        <span className="text-5xl">{state.emoji}</span>
      </div>

      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        {state.title}
      </h3>

      <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
        {state.description}
      </p>

      <button
        className="
        bg-gradient-to-r from-purple-600 to-violet-600
        hover:from-purple-500 hover:to-violet-500
        text-white font-bold
        px-8 py-3 min-h-[44px]
        rounded-xl
        shadow-lg shadow-purple-500/30
        hover:shadow-purple-500/50
        hover:scale-105
        transition-all duration-300
        touch-manipulation
      "
      >
        {state.action}
      </button>
    </div>
  );
}
```

---

## 7. INFINITE SCROLL IMPLEMENTATION

### **Intersection Observer Pattern**

```tsx
import { useInView } from "react-intersection-observer";

export default function CommunityFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  // Trigger element for infinite scroll
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  // Fetch more posts when trigger is visible
  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchMorePosts();
    }
  }, [inView, hasMore, loading]);

  const fetchMorePosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        filter,
        limit: "20",
        ...(cursor && { cursor }),
      });

      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();

      setPosts((prev) => [...prev, ...data.posts]);
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-purple-600">
            <Wind className="w-6 h-6 animate-spin" />
            <span className="font-medium">Loading more posts...</span>
          </div>
        </div>
      )}

      {/* Infinite scroll trigger */}
      {hasMore && !loading && (
        <div ref={ref} className="h-20 flex items-center justify-center">
          <div className="text-slate-400 text-sm">Scroll for more ↓</div>
        </div>
      )}

      {/* End message */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            🎉 You've reached the end!
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="
              text-purple-600 hover:text-purple-700
              font-medium
              flex items-center gap-2 mx-auto
            "
          >
            <ChevronUp className="w-4 h-4" />
            Back to Top
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 8. SOCIAL FEATURES (FOLLOW/SHARE)

### **Follow Button Component**

```tsx
export function FollowButton({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setFollowing(!following); // Optimistic update

      const res = await fetch(`/api/users/${userId}/follow`, {
        method: following ? "DELETE" : "POST",
      });

      if (!res.ok) {
        setFollowing(following); // Revert on error
      }
    } catch (error) {
      setFollowing(following); // Revert on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`
        px-6 py-2 min-h-[44px]
        rounded-xl
        font-bold
        transition-all duration-300
        touch-manipulation
        ${
          following
            ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 group"
            : "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
        }
        ${loading ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {loading ? (
        <Wind className="w-4 h-4 animate-spin inline" />
      ) : following ? (
        <>
          <span className="group-hover:hidden">Following</span>
          <span className="hidden group-hover:inline">Unfollow</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 inline mr-2" />
          Follow
        </>
      )}
    </button>
  );
}
```

---

## 9. TOPIC & HASHTAG DISPLAY

### **Trending Topics Sidebar**

```tsx
export function TrendingTopics() {
  const [topics, setTopics] = useState<Array<{ name: string; count: number }>>(
    []
  );

  return (
    <div
      className="
      bg-white dark:bg-slate-800
      rounded-xl
      border border-slate-200 dark:border-slate-700
      overflow-hidden
    "
    >
      <div
        className="
        bg-gradient-to-r from-purple-600 to-violet-600
        px-4 py-3
      "
      >
        <h3 className="text-white font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Trending Topics
        </h3>
      </div>

      <div className="p-4 space-y-3">
        {topics.map((topic, index) => (
          <button
            key={topic.name}
            className="
              w-full
              flex items-center justify-between
              p-3
              hover:bg-slate-50 dark:hover:bg-slate-700
              rounded-lg
              transition-colors
              group
              touch-manipulation
            "
          >
            <div className="flex items-center gap-3">
              <span
                className="
                text-2xl font-bold
                text-slate-400 dark:text-slate-600
                group-hover:text-purple-500
                transition-colors
              "
              >
                {index + 1}
              </span>
              <div className="text-left">
                <p
                  className="
                  font-medium 
                  text-slate-900 dark:text-white
                  group-hover:text-purple-600 dark:group-hover:text-purple-400
                  transition-colors
                "
                >
                  #{topic.name}
                </p>
                <p className="text-xs text-slate-500">{topic.count} posts</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
          </button>
        ))}
      </div>

      <div
        className="
        border-t border-slate-200 dark:border-slate-700
        p-4
      "
      >
        <button
          className="
          w-full
          text-purple-600 hover:text-purple-700
          dark:text-purple-400 dark:hover:text-purple-300
          font-medium text-sm
          transition-colors
        "
        >
          View All Topics →
        </button>
      </div>
    </div>
  );
}
```

---

## 10. USER PROFILE WIDGETS

### **Dynasty Score Widget**

```tsx
export function DynastyScoreWidget({ user }: { user: User }) {
  const level = Math.floor(user.dynastyScore / 100);
  const progress = user.dynastyScore % 100;

  return (
    <div
      className="
      bg-gradient-to-br from-purple-600 via-violet-600 to-blue-600
      rounded-xl
      p-6
      text-white
      shadow-xl shadow-purple-500/30
      relative overflow-hidden
    "
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Dynasty Score</h3>
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>

        {/* Score Display */}
        <div className="text-center mb-6">
          <div className="text-5xl font-black mb-2">
            {user.dynastyScore.toLocaleString()}
          </div>
          <div
            className="
            inline-flex items-center gap-2
            bg-white/20 backdrop-blur-sm
            px-4 py-2 rounded-full
          "
          >
            <Crown className="w-4 h-4" />
            <span className="font-bold">Level {level}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Level {level}</span>
            <span>Level {level + 1}</span>
          </div>
          <div
            className="
            h-3 
            bg-white/20 
            rounded-full 
            overflow-hidden
            backdrop-blur-sm
          "
          >
            <div
              className="
                h-full 
                bg-gradient-to-r from-amber-400 to-orange-400
                rounded-full
                transition-all duration-500
                shadow-lg shadow-amber-500/50
              "
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-white/80 mt-2 text-center">
            {100 - progress} points to next level
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
          <div className="text-center">
            <div className="text-2xl font-bold">{user.postCount}</div>
            <div className="text-xs text-white/80">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{user.followerCount}</div>
            <div className="text-xs text-white/80">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{user.streak || 0}</div>
            <div className="text-xs text-white/80">Day Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎯 IMPLEMENTATION CHECKLIST

When building your community feed, make sure to include:

### **Core Features:**

- [ ] Post cards with hover effects (scale, border glow)
- [ ] Dynasty Score badges on author names
- [ ] Topic hashtags as clickable filters
- [ ] Like button with optimistic updates
- [ ] Comment section with nested replies
- [ ] Share menu with social options
- [ ] Follow/unfollow button
- [ ] Infinite scroll with cursor pagination

### **Responsive Design:**

- [ ] Mobile-first layout (1-column → 3-column)
- [ ] Touch-friendly buttons (44px minimum)
- [ ] Mobile bottom navigation
- [ ] Horizontal scrolling tabs
- [ ] Responsive typography (text-sm sm:text-base)
- [ ] Safe area support (safe-bottom for notch)

### **Performance:**

- [ ] Loading skeletons for initial load
- [ ] Optimistic UI updates (likes, follows)
- [ ] Debounced search
- [ ] Image lazy loading
- [ ] Cursor-based pagination (not offset)
- [ ] React.memo for expensive components

### **UX Polish:**

- [ ] Empty states with illustrations
- [ ] Loading indicators with personality
- [ ] Error states with retry buttons
- [ ] Success animations (floating hearts)
- [ ] Smooth transitions (duration-300)
- [ ] Hover glow effects
- [ ] Active states for touch devices

### **Accessibility:**

- [ ] Semantic HTML (article, header, footer)
- [ ] ARIA labels (aria-label, aria-pressed)
- [ ] Keyboard navigation support
- [ ] Focus visible indicators
- [ ] Screen reader text (sr-only)
- [ ] Color contrast compliance (WCAG AA)

---

**Every element should feel premium, responsive, and delightful to use!** ✨

---

**Document Version:** 1.0  
**Last Updated:** October 13, 2025  
**Companion Files:** LUXURY_DESIGN_SYSTEM.md, LUXURY_COMPONENTS.md, luxury-animations.css
