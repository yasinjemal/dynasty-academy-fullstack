"use client";

import AIChapterSummaries from "@/components/ai/AIChapterSummaries";

export default function SummariesPage() {
  return (
    <AIChapterSummaries
      bookTitle="Atomic Habits by James Clear"
      currentChapter={2}
      totalChapters={20}
    />
  );
}
