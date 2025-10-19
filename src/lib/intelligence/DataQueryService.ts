import { dynastyAI } from "./DynastyIntelligenceEngine";

export type LearningContext = {
  quizRecent: { scores: number[]; avg: number };
  video: { watchPct: number; pauses: number; seeks: number };
  attention: { avg: number; byHour: Record<string, number> };
  notes: { count: number; avgLen: number };
  weakTopics: string[];
  totalEvents: number;
  dateRange: { start: string; end: string };
};

/**
 * Queries IndexedDB for user's learning events and builds context for AI chat
 */
export async function getLearningContext(
  userId: string,
  courseId?: string
): Promise<LearningContext> {
  try {
    // Get events from IndexedDB (last 14 days)
    const evts = await dynastyAI.getEvents(userId, courseId);

    if (!evts || evts.length === 0) {
      return {
        quizRecent: { scores: [], avg: 0 },
        video: { watchPct: 0, pauses: 0, seeks: 0 },
        attention: { avg: 0, byHour: {} },
        notes: { count: 0, avgLen: 0 },
        weakTopics: [],
        totalEvents: 0,
        dateRange: { start: "N/A", end: "N/A" },
      };
    }

    // ========== QUIZ ANALYSIS ==========
    const quizzes = evts.filter((e) => e.type === "quiz_complete");
    const scores = quizzes
      .slice(-5) // Last 5 quizzes
      .map((q) => (q.metadata?.score ?? 0) as number);
    const avgScore = scores.length
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    // ========== VIDEO ANALYSIS ==========
    const videos = evts.filter((e) => e.type === "video_watch");
    const watchPct = videos.length
      ? videos.reduce(
          (a, v) => a + ((v.metadata?.watchPercentage as number) || 0),
          0
        ) / videos.length
      : 0;
    const pauses = videos.reduce(
      (a, v) => a + ((v.metadata?.pauseCount as number) || 0),
      0
    );
    const seeks = videos.reduce(
      (a, v) => a + ((v.metadata?.seekCount as number) || 0),
      0
    );

    // ========== ATTENTION ANALYSIS ==========
    // Note: We don't have explicit 'attention_tick' events yet,
    // but we can infer attention from engagement scores
    const attentionEvents = evts.filter(
      (e) => e.engagement !== undefined && e.engagement !== null
    );
    const attAvg = attentionEvents.length
      ? attentionEvents.reduce((a, v) => a + (v.engagement || 0), 0) /
        attentionEvents.length
      : 0;

    // Build hour-based attention pattern
    const byHour: Record<string, number> = {};
    const hourCounts: Record<string, number> = {};

    for (const a of attentionEvents) {
      const h = (a.timestamp ? new Date(a.timestamp) : new Date()).getHours();
      const hourKey = h.toString();
      byHour[hourKey] = (byHour[hourKey] || 0) + (a.engagement || 0);
      hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
    }

    // Average attention per hour
    for (const hour in byHour) {
      byHour[hour] = byHour[hour] / hourCounts[hour];
    }

    // ========== NOTES ANALYSIS ==========
    const notes = evts.filter((e) => e.type === "note_taken");
    const noteLens = notes.map((n) => (n.metadata?.noteLength as number) || 0);
    const avgLen = noteLens.length
      ? noteLens.reduce((a, b) => a + b, 0) / noteLens.length
      : 0;

    // ========== WEAK TOPICS ==========
    // Topics where engagement is below 0.5
    const weakTopics = videos
      .filter((v) => (v.engagement || 0) < 0.5)
      .map((v) => v.metadata?.topic as string)
      .filter(Boolean)
      .slice(0, 3); // Top 3 struggling topics

    // ========== DATE RANGE ==========
    const timestamps = evts
      .map((e) => (e.timestamp ? new Date(e.timestamp).getTime() : 0))
      .filter((t) => t > 0);
    const start = timestamps.length
      ? new Date(Math.min(...timestamps)).toISOString()
      : "N/A";
    const end = timestamps.length
      ? new Date(Math.max(...timestamps)).toISOString()
      : "N/A";

    return {
      quizRecent: { scores, avg: Math.round(avgScore) },
      video: { watchPct: +watchPct.toFixed(2), pauses, seeks },
      attention: { avg: Math.round(attAvg * 100), byHour }, // Convert to 0-100
      notes: { count: notes.length, avgLen: Math.round(avgLen) },
      weakTopics,
      totalEvents: evts.length,
      dateRange: { start, end },
    };
  } catch (error) {
    console.error("[DataQueryService] Error getting learning context:", error);
    return {
      quizRecent: { scores: [], avg: 0 },
      video: { watchPct: 0, pauses: 0, seeks: 0 },
      attention: { avg: 0, byHour: {} },
      notes: { count: 0, avgLen: 0 },
      weakTopics: [],
      totalEvents: 0,
      dateRange: { start: "N/A", end: "N/A" },
    };
  }
}
