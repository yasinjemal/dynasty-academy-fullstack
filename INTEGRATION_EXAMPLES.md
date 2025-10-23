# 🎯 INTEGRATION EXAMPLES

## Real-World Integration Code

---

## Example 1: Update Homepage with Blackhole Portal

**File:** `src/app/page.tsx`

### Before:

```tsx
"use client";
import FuturePortalSimple from "@/components/intro/FuturePortalSimple";
// ... rest of imports

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {showIntro && (
        <FuturePortalSimple onComplete={() => setShowIntro(false)} />
      )}
      {/* ... homepage content */}
    </>
  );
}
```

### After (with NEW Blackhole Portal):

```tsx
"use client";
import BlackholePortal from "@/components/intro/BlackholePortal";  // ✅ NEW!
// ... rest of imports

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {showIntro && (
        <BlackholePortal onComplete={() => setShowIntro(false)} />  {/* ✅ UPGRADED! */}
      )}
      {/* ... homepage content */}
    </>
  );
}
```

**Result:** Users now see realistic 3D blackhole instead of simple portal!

---

## Example 2: Add AI Avatar to Course Page

**File:** `src/app/courses/[courseId]/page.tsx`

```tsx
"use client";
import { useParams } from "next/navigation";
import AIAvatarMentor from "@/components/ai/AIAvatarMentor"; // ✅ NEW!

export default function CoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;

  return (
    <div className="min-h-screen">
      {/* Your existing course content */}
      <CourseHeader />
      <LessonList />
      <CourseProgress />

      {/* ✅ AI Avatar appears in bottom-right corner */}
      <AIAvatarMentor context="course" courseId={courseId} minimizable={true} />
    </div>
  );
}
```

**Result:** Students get AI guidance throughout the course!

---

## Example 3: Add AI Avatar to Lesson Page

**File:** `src/app/courses/[courseId]/lessons/[lessonId]/page.tsx`

```tsx
"use client";
import { useParams } from "next/navigation";
import AIAvatarMentor from "@/components/ai/AIAvatarMentor"; // ✅ NEW!

export default function LessonPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  return (
    <div className="min-h-screen">
      {/* Your lesson content */}
      <LessonVideo />
      <LessonContent />
      <LessonQuiz />

      {/* ✅ AI Avatar provides lesson-specific help */}
      <AIAvatarMentor
        context="lesson"
        courseId={courseId}
        lessonId={lessonId}
        minimizable={true}
      />
    </div>
  );
}
```

**Result:** Avatar says things like "Let's understand this concept together!"

---

## Example 4: Add AI Avatar to Book Reader

**File:** `src/app/books/[bookId]/read/page.tsx`

```tsx
"use client";
import { useParams } from "next/navigation";
import AIAvatarMentor from "@/components/ai/AIAvatarMentor"; // ✅ NEW!

export default function BookReaderPage() {
  const params = useParams();
  const bookId = params.bookId as string;

  return (
    <div className="min-h-screen">
      {/* Your book reader */}
      <BookViewer bookId={bookId} />
      <ReadingControls />

      {/* ✅ AI Avatar helps with book comprehension */}
      <AIAvatarMentor context="book" minimizable={true} />
    </div>
  );
}
```

**Result:** Avatar says "Take notes as you read. I'll help you retain key insights."

---

## Example 5: Add AI Avatar to Dashboard

**File:** `src/app/(dashboard)/dashboard/page.tsx`

```tsx
"use client";
import AIAvatarMentor from "@/components/ai/AIAvatarMentor"; // ✅ NEW!

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      {/* Your dashboard */}
      <DashboardStats />
      <RecentCourses />
      <Achievements />

      {/* ✅ AI Avatar greets returning users */}
      <AIAvatarMentor context="dashboard" minimizable={true} />
    </div>
  );
}
```

**Result:** "Welcome back! Ready to continue your learning journey?"

---

## Example 6: Create Holographic Courses Page

**New File:** `src/app/courses/holographic/page.tsx`

```tsx
import HolographicDashboard from "@/components/courses/HolographicDashboard";

export default function HolographicCoursesPage() {
  return <HolographicDashboard />;
}
```

**Usage:** Visit `http://localhost:3000/courses/holographic`

---

## Example 7: Add Toggle Between Views

**File:** `src/app/courses/page.tsx`

```tsx
"use client";
import { useState } from "react";
import HolographicDashboard from "@/components/courses/HolographicDashboard";
import { Orbit, Grid } from "lucide-react";

export default function CoursesPage() {
  const [view, setView] = useState<"grid" | "holographic">("grid");

  return (
    <div className="min-h-screen">
      {/* View Toggle */}
      <div className="fixed top-6 right-6 z-50 flex gap-2">
        <button
          onClick={() => setView("grid")}
          className={`px-4 py-2 rounded-lg ${
            view === "grid"
              ? "bg-purple-600 text-white"
              : "bg-white/10 text-purple-300"
          }`}
        >
          <Grid className="w-5 h-5" />
        </button>
        <button
          onClick={() => setView("holographic")}
          className={`px-4 py-2 rounded-lg ${
            view === "holographic"
              ? "bg-purple-600 text-white"
              : "bg-white/10 text-purple-300"
          }`}
        >
          <Orbit className="w-5 h-5" />
        </button>
      </div>

      {/* Conditional Render */}
      {view === "grid" ? (
        <div className="container mx-auto px-6 py-12">
          {/* Your existing grid view */}
          <CourseGrid />
        </div>
      ) : (
        <HolographicDashboard />
      )}
    </div>
  );
}
```

**Result:** Users can switch between traditional grid and 3D holographic view!

---

## Example 8: Context-Based Avatar Behavior

**Custom Hook:** `src/hooks/useAvatarContext.ts`

```tsx
import { usePathname } from "next/navigation";

export function useAvatarContext() {
  const pathname = usePathname();

  if (pathname.includes("/courses/") && pathname.includes("/lessons/")) {
    return { context: "lesson" as const, show: true };
  }

  if (pathname.includes("/courses/")) {
    return { context: "course" as const, show: true };
  }

  if (pathname.includes("/books/")) {
    return { context: "book" as const, show: true };
  }

  if (pathname === "/dashboard") {
    return { context: "dashboard" as const, show: true };
  }

  return { context: "dashboard" as const, show: false };
}
```

**Usage in Layout:** `src/app/layout.tsx`

```tsx
"use client";
import { useAvatarContext } from "@/hooks/useAvatarContext";
import AIAvatarMentor from "@/components/ai/AIAvatarMentor";

export default function RootLayout({ children }) {
  const { context, show } = useAvatarContext();

  return (
    <html>
      <body>
        {children}

        {/* ✅ Avatar appears automatically on relevant pages */}
        {show && <AIAvatarMentor context={context} minimizable={true} />}
      </body>
    </html>
  );
}
```

**Result:** Avatar automatically appears on all relevant pages with correct context!

---

## Example 9: Admin Control Panel

**File:** `src/app/admin/settings/features/page.tsx`

```tsx
"use client";
import { useState } from "react";

export default function FeatureSettingsPage() {
  const [settings, setSettings] = useState({
    blackholePortal: true,
    aiAvatar: true,
    holographicDashboard: true,
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Feature Settings</h1>

      <div className="space-y-4">
        {/* Blackhole Portal Toggle */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h3 className="font-semibold">Blackhole Portal Intro</h3>
            <p className="text-sm text-gray-400">
              3D cinematic intro for new users
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.blackholePortal}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  blackholePortal: e.target.checked,
                }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* AI Avatar Toggle */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h3 className="font-semibold">AI Avatar Mentor</h3>
            <p className="text-sm text-gray-400">3D AI guide for students</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.aiAvatar}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  aiAvatar: e.target.checked,
                }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Holographic Dashboard Toggle */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h3 className="font-semibold">Holographic Dashboard</h3>
            <p className="text-sm text-gray-400">3D course navigation</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.holographicDashboard}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  holographicDashboard: e.target.checked,
                }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
```

**Result:** Admins can enable/disable features without code changes!

---

## Example 10: Performance Optimization

**File:** `src/components/ai/AIAvatarMentorLazy.tsx`

```tsx
"use client";
import dynamic from "next/dynamic";

// ✅ Lazy load 3D component to improve initial page load
const AIAvatarMentor = dynamic(() => import("@/components/ai/AIAvatarMentor"), {
  ssr: false, // Disable SSR for Three.js
  loading: () => (
    <div className="fixed bottom-6 right-6 w-24 h-24 bg-purple-900/50 rounded-full animate-pulse" />
  ),
});

export default AIAvatarMentor;
```

**Usage:**

```tsx
import AIAvatarMentor from "@/components/ai/AIAvatarMentorLazy";
```

**Result:** Faster page loads, avatar loads progressively!

---

## 🎯 QUICK WINS

### Option A: Minimal Integration (5 minutes)

1. Add Blackhole Portal to homepage ✅
2. Visit `/extraordinary` to demo ✅

### Option B: Medium Integration (15 minutes)

1. Add Blackhole Portal to homepage ✅
2. Add AI Avatar to dashboard ✅
3. Create `/courses/holographic` route ✅

### Option C: Full Integration (30 minutes)

1. Replace homepage intro ✅
2. Add AI Avatar to all course/lesson pages ✅
3. Add view toggle on courses page ✅
4. Create admin settings page ✅

---

## 📊 Testing Checklist

After integration, test:

- [ ] Blackhole portal plays smoothly
- [ ] Skip button appears after 3 seconds
- [ ] Portal remembers user has seen it
- [ ] AI Avatar speaks (check browser permissions)
- [ ] Avatar minimizes/maximizes
- [ ] Avatar mute button works
- [ ] Holographic dashboard renders
- [ ] Can rotate/zoom dashboard
- [ ] Can switch between grid/carousel
- [ ] No console errors
- [ ] Works on mobile (or hidden on mobile)
- [ ] Performance is acceptable (check FPS)

---

## 🚀 YOU'RE READY!

Pick your integration level and deploy! 🎉
