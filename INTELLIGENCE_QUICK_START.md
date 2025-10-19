/\*\*

- 🎯 QUICK INTEGRATION EXAMPLE
-
- How to add AI Intelligence to your existing course player
- Copy-paste these snippets into your components
  \*/

// ============================================================================
// 1. ADD TO VIDEO PLAYER - Track Watch Events
// ============================================================================

// File: src/components/course/VideoPlayer.tsx

import { dynastyAI } from '@/lib/intelligence/DynastyIntelligenceEngine';
import { useSession } from 'next-auth/react';

export function VideoPlayer({ videoUrl, lessonId, courseId }: VideoPlayerProps) {
const { data: session } = useSession();
const [watchStartTime, setWatchStartTime] = useState<number>(0);

// Track when video starts playing
const handlePlay = async () => {
setWatchStartTime(Date.now());
};

// Track when video pauses (engagement signal)
const handlePause = async (currentTime: number) => {
if (!session?.user) return;

    const watchDuration = (Date.now() - watchStartTime) / 1000; // seconds

    await dynastyAI.trackEvent({
      userId: session.user.id,
      courseId,
      lessonId,
      type: 'video_watch',
      duration: watchDuration,
      engagement: calculateEngagement(watchDuration, currentTime),
      metadata: {
        videoTime: currentTime,
        pauseType: 'manual',
      }
    });

};

// Track replay (struggle signal)
const handleSeek = async (newTime: number, oldTime: number) => {
if (!session?.user) return;

    // If seeking backward, it's a replay
    if (newTime < oldTime) {
      await dynastyAI.trackEvent({
        userId: session.user.id,
        courseId,
        lessonId,
        type: 'video_watch',
        duration: 0,
        engagement: 0.5, // Medium engagement
        metadata: {
          action: 'replay',
          section: Math.floor(oldTime / 60), // Which minute
        }
      });
    }

};

// Calculate engagement score (0-1)
function calculateEngagement(watchDuration: number, videoTime: number): number {
// If watched continuously = high engagement
if (watchDuration > 0 && watchDuration <= videoTime _ 1.2) {
return 0.9;
}
// If paused frequently = medium engagement
if (watchDuration > videoTime _ 1.5) {
return 0.5;
}
// Default
return 0.7;
}

return (
<div className="video-player">
<ReactPlayer
url={videoUrl}
onPlay={handlePlay}
onPause={handlePause}
onSeek={handleSeek}
// ... other props
/>
</div>
);
}

// ============================================================================
// 2. ADD TO QUIZ COMPONENT - Track Performance
// ============================================================================

// File: src/components/course/QuizComponent.tsx

import { dynastyAI } from '@/lib/intelligence/DynastyIntelligenceEngine';
import { useSession } from 'next-auth/react';

export function QuizComponent({ quizId, lessonId, courseId }: QuizProps) {
const { data: session } = useSession();
const [startTime, setStartTime] = useState<number>(0);

const handleQuizStart = () => {
setStartTime(Date.now());
};

const handleQuizSubmit = async (score: number, totalQuestions: number) => {
if (!session?.user) return;

    const duration = (Date.now() - startTime) / 1000;
    const scorePercentage = (score / totalQuestions) * 100;

    await dynastyAI.trackEvent({
      userId: session.user.id,
      courseId,
      lessonId,
      type: 'quiz_complete',
      duration,
      engagement: scorePercentage > 80 ? 1.0 : scorePercentage > 60 ? 0.7 : 0.4,
      metadata: {
        score: scorePercentage,
        attempts: 1,
        totalQuestions,
      }
    });

};

return (
<div className="quiz-container">
<button onClick={handleQuizStart}>Start Quiz</button>
<button onClick={() => handleQuizSubmit(8, 10)}>Submit</button>
</div>
);
}

// ============================================================================
// 3. ADD TO COURSE PAGE - Display AI Dashboard
// ============================================================================

// File: src/app/(dashboard)/courses/[id]/page.tsx

import { AIDashboard } from '@/components/intelligence/AIDashboard';

export default async function CoursePage({ params }: { params: { id: string } }) {
// ... existing code ...

return (
<div className="min-h-screen bg-dark-950">
<div className="container mx-auto px-4 py-8">
<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Main Content - Video & Lessons */}
          <div className="xl:col-span-2 space-y-6">
            <VideoPlayer
              videoUrl={currentLesson.videoUrl}
              lessonId={currentLesson.id}
              courseId={params.id}
            />

            <LessonContent />

            <QuizComponent
              quizId={currentLesson.quizId}
              lessonId={currentLesson.id}
              courseId={params.id}
            />
          </div>

          {/* Sidebar - AI Intelligence + Progress */}
          <div className="xl:col-span-1 space-y-6">
            {/* 🧠 AI INTELLIGENCE DASHBOARD */}
            <AIDashboard
              courseId={params.id}
              className="sticky top-6"
            />

            {/* Course Navigation */}
            <CourseSidebar sections={sections} />
          </div>

        </div>
      </div>
    </div>

);
}

// ============================================================================
// 4. ADD TO APP LAYOUT - Start Attention Tracking
// ============================================================================

// File: src/app/layout.tsx or src/app/(dashboard)/layout.tsx

'use client';

import { useEffect } from 'react';
import { attentionTracker } from '@/lib/intelligence/DynastyIntelligenceEngine';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
useEffect(() => {
// Start tracking user attention globally
attentionTracker.startTracking();

    return () => {
      // Cleanup if needed
    };

}, []);

return (
<div className="dashboard-layout">
{children}
</div>
);
}

// ============================================================================
// 5. ADD TO NOTE EDITOR - Track Note Taking
// ============================================================================

// File: src/components/course/NoteEditor.tsx

import { dynastyAI } from '@/lib/intelligence/DynastyIntelligenceEngine';
import { useSession } from 'next-auth/react';

export function NoteEditor({ lessonId, courseId }: NoteEditorProps) {
const { data: session } = useSession();

const handleNoteSave = async (noteContent: string) => {
if (!session?.user) return;

    await dynastyAI.trackEvent({
      userId: session.user.id,
      courseId,
      lessonId,
      type: 'note_taken',
      duration: 0,
      engagement: 0.9, // High engagement for note-taking
      metadata: {
        noteLength: noteContent.length,
        hasCode: noteContent.includes('```'),
      }
    });

};

return (
<textarea
onBlur={(e) => handleNoteSave(e.target.value)}
placeholder="Take notes..."
/>
);
}

// ============================================================================
// 6. DISPLAY PREDICTIONS INLINE
// ============================================================================

// File: src/components/course/SmartRecommendations.tsx

'use client';

import { useState, useEffect } from 'react';
import { Brain, Sparkles } from 'lucide-react';

export function SmartRecommendations({ courseId }: { courseId: string }) {
const [recommendations, setRecommendations] = useState<string[]>([]);

useEffect(() => {
async function fetchRecommendations() {
const res = await fetch(`/api/ai/predict-outcome?courseId=${courseId}`);
const data = await res.json();

      if (data.success) {
        setRecommendations(data.prediction.recommendations);
      }
    }

    fetchRecommendations();

}, [courseId]);

if (recommendations.length === 0) return null;

return (
<div className="glass-morphism rounded-lg p-4 mb-6">
<div className="flex items-center gap-2 mb-3">
<Brain className="w-5 h-5 text-purple-400" />
<h3 className="font-semibold text-white">AI Recommendations</h3>
<Sparkles className="w-4 h-4 text-yellow-400" />
</div>

      <ul className="space-y-2">
        {recommendations.slice(0, 3).map((rec, i) => (
          <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </div>

);
}

// Add to course page:
<SmartRecommendations courseId={params.id} />

// ============================================================================
// 7. INSTRUCTOR DASHBOARD - View Student Predictions
// ============================================================================

// File: src/app/(instructor)/courses/[id]/analytics/page.tsx

import { advancedMLEngine } from '@/lib/intelligence/server/AdvancedMLEngine';

export default async function CourseAnalytics({ params }: { params: { id: string } }) {
// Get all students in course
const enrollments = await prisma.course_enrollments.findMany({
where: { courseId: params.id },
include: { user: true },
});

// Get predictions for each student
const studentPredictions = await Promise.all(
enrollments.map(async (enrollment) => {
const prediction = await advancedMLEngine.predictStudentOutcome(
enrollment.userId,
params.id
);

      return {
        student: enrollment.user,
        prediction,
      };
    })

);

// Sort by intervention level (critical first)
const sortedByRisk = studentPredictions.sort((a, b) => {
const levels = { critical: 5, high: 4, medium: 3, low: 2, none: 1 };
return levels[b.prediction.interventionLevel] - levels[a.prediction.interventionLevel];
});

return (
<div className="container mx-auto p-6">
<h1 className="text-3xl font-bold text-white mb-6">Student Analytics</h1>

      <div className="grid gap-4">
        {sortedByRisk.map(({ student, prediction }) => (
          <div
            key={student.id}
            className={`glass-morphism rounded-lg p-4 border-l-4 ${
              prediction.interventionLevel === 'critical' ? 'border-red-500' :
              prediction.interventionLevel === 'high' ? 'border-orange-500' :
              prediction.interventionLevel === 'medium' ? 'border-yellow-500' :
              'border-green-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">{student.name}</h3>
                <p className="text-sm text-gray-400">{student.email}</p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {Math.round(prediction.probability * 100)}%
                </div>
                <div className="text-xs text-gray-400">Risk Score</div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {prediction.recommendations.map((rec, i) => (
                <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">
                  {rec}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>

);
}

// ============================================================================
// 8. BACKGROUND JOB - Auto-Interventions
// ============================================================================

// File: src/lib/jobs/ai-interventions.ts

import { advancedMLEngine } from '@/lib/intelligence/server/AdvancedMLEngine';
import { sendEmail } from '@/lib/email';

/\*\*

- Run daily to check all students and send interventions
  \*/
  export async function runDailyInterventions() {
  // Get all active enrollments
  const enrollments = await prisma.course_enrollments.findMany({
  where: {
  status: 'active',
  completedAt: null,
  },
  include: {
  user: true,
  course: true
  },
  });

for (const enrollment of enrollments) {
const prediction = await advancedMLEngine.predictStudentOutcome(
enrollment.userId,
enrollment.courseId
);

    // Send intervention if critical
    if (prediction.interventionLevel === 'critical') {
      await sendEmail({
        to: enrollment.user.email,
        subject: `We're here to help with ${enrollment.course.title}`,
        html: `
          <h2>Hey ${enrollment.user.name}!</h2>
          <p>We noticed you might be facing some challenges. Here's what can help:</p>
          <ul>
            ${prediction.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
          <p>Would you like to schedule a 1-on-1 support session?</p>
          <a href="https://yoursite.com/support">Get Help</a>
        `,
      });

      console.log(`✉️ Sent intervention to ${enrollment.user.email}`);
    }

}

console.log(`✅ Processed ${enrollments.length} students`);
}

// Run with cron job or Vercel Cron
// _/
export const config = {
schedule: '0 0 _ \* \*', // Daily at midnight
};

export default async function handler() {
await runDailyInterventions();
return new Response('OK');
}

// ============================================================================
// DONE! 🎉
// ============================================================================

/\*\*

- SUMMARY
-
- ✅ Track video watches (play/pause/seek)
- ✅ Track quiz performance
- ✅ Track note-taking
- ✅ Display AI Dashboard in sidebar
- ✅ Show inline recommendations
- ✅ Instructor analytics page
- ✅ Automated interventions
-
- Your Intelligence Engine is now FULLY INTEGRATED! 🚀
  \*/
