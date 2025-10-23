"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Brain,
  Sparkles,
  Lightbulb,
  Link2,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ChapterSummary {
  chapterNumber: number;
  title: string;
  aiSummary: string[];
  keyConcepts: string[];
  connections: string[];
  timeToRead: number;
  comprehensionQuiz?: QuizQuestion[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface AIChapterSummariesProps {
  bookTitle: string;
  currentChapter: number;
  totalChapters: number;
}

// Sample data - in production, this comes from AI API
const SAMPLE_SUMMARIES: ChapterSummary[] = [
  {
    chapterNumber: 1,
    title: "The Beginning of Knowledge",
    aiSummary: [
      "The chapter introduces the protagonist's journey into self-discovery through ancient wisdom texts.",
      "Key themes of persistence and curiosity are established as foundational principles.",
      "The author challenges conventional thinking about learning and retention.",
    ],
    keyConcepts: [
      "Growth Mindset",
      "Active Learning",
      "Knowledge Retention",
      "Self-Discovery",
      "Ancient Wisdom",
    ],
    connections: [
      "Links to Chapter 3: Deep Work Principles",
      "Relates to Chapter 7: Memory Techniques",
      "Foundation for Chapter 12: Mastery Framework",
    ],
    timeToRead: 18,
    comprehensionQuiz: [
      {
        question: "What is the main principle introduced in this chapter?",
        options: [
          "Passive learning is most effective",
          "Growth mindset enables continuous learning",
          "Knowledge is fixed at birth",
          "Ancient wisdom is irrelevant today",
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    chapterNumber: 2,
    title: "The Power of Habit",
    aiSummary: [
      "Habits form the foundation of consistent learning and personal transformation.",
      "The author introduces a three-step framework: Cue, Routine, Reward.",
      "Small daily actions compound into extraordinary results over time.",
    ],
    keyConcepts: [
      "Habit Formation",
      "Cue-Routine-Reward Loop",
      "Compound Effect",
      "Consistency",
      "Behavioral Change",
    ],
    connections: [
      "Builds on Chapter 1: Growth Mindset",
      "Prepares for Chapter 5: Daily Rituals",
      "Complements Chapter 9: Long-term Thinking",
    ],
    timeToRead: 22,
  },
  {
    chapterNumber: 3,
    title: "Deep Work Principles",
    aiSummary: [
      "Deep work requires eliminating distractions and creating focused time blocks.",
      "Quality of work matters more than quantity of hours spent.",
      "The modern world is optimized for shallow work; deep work is a competitive advantage.",
    ],
    keyConcepts: [
      "Deep Work",
      "Focus Management",
      "Distraction Elimination",
      "Time Blocking",
      "Competitive Advantage",
    ],
    connections: [
      "Referenced in Chapter 1: Active Learning",
      "Essential for Chapter 8: Peak Performance",
      "Relates to Chapter 11: Flow State",
    ],
    timeToRead: 25,
  },
];

export default function AIChapterSummaries({
  bookTitle,
  currentChapter,
  totalChapters,
}: AIChapterSummariesProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set([currentChapter])
  );
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<"correct" | "incorrect" | null>(
    null
  );

  const toggleChapter = (chapterNum: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterNum)) {
      newExpanded.delete(chapterNum);
    } else {
      newExpanded.add(chapterNum);
    }
    setExpandedChapters(newExpanded);
  };

  const checkAnswer = (chapterNum: number, answerIndex: number) => {
    const chapter = SAMPLE_SUMMARIES.find(
      (s) => s.chapterNumber === chapterNum
    );
    if (chapter?.comprehensionQuiz && chapter.comprehensionQuiz[0]) {
      const isCorrect =
        answerIndex === chapter.comprehensionQuiz[0].correctAnswer;
      setSelectedAnswer(answerIndex);
      setQuizResult(isCorrect ? "correct" : "incorrect");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-indigo-400" />
            <div>
              <h1 className="text-4xl font-bold text-white">
                AI Chapter Summaries
              </h1>
              <p className="text-indigo-300">{bookTitle}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 backdrop-blur-xl rounded-2xl p-6 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <p className="text-white font-semibold">AI-Powered Insights</p>
            </div>
            <p className="text-indigo-300 text-sm">
              Our AI has analyzed each chapter to extract key concepts, generate
              summaries, and identify connections. Save 10+ hours per book with
              instant comprehension! 🚀
            </p>
          </div>
        </motion.div>

        {/* Chapter Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              <span className="text-white font-semibold">Reading Progress</span>
            </div>
            <span className="text-indigo-300">
              Chapter {currentChapter} of {totalChapters}
            </span>
          </div>

          <div className="relative h-3 bg-slate-900/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentChapter / totalChapters) * 100}%` }}
              transition={{ duration: 1 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
            />
          </div>

          <p className="text-indigo-300 text-sm mt-2">
            {Math.round((currentChapter / totalChapters) * 100)}% completed
          </p>
        </motion.div>

        {/* Chapter Summaries */}
        <div className="space-y-4">
          {SAMPLE_SUMMARIES.map((summary, index) => {
            const isExpanded = expandedChapters.has(summary.chapterNumber);
            const isCurrent = summary.chapterNumber === currentChapter;

            return (
              <motion.div
                key={summary.chapterNumber}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white/5 backdrop-blur-xl rounded-2xl border overflow-hidden transition-all ${
                  isCurrent
                    ? "border-indigo-500 shadow-lg shadow-indigo-500/20"
                    : "border-white/10"
                }`}
              >
                {/* Chapter Header */}
                <button
                  onClick={() => toggleChapter(summary.chapterNumber)}
                  className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        isCurrent
                          ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white"
                          : "bg-white/10 text-indigo-300"
                      }`}
                    >
                      {summary.chapterNumber}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {summary.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-indigo-300">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {summary.timeToRead} min
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-1 bg-indigo-600 text-white rounded-full text-xs font-semibold">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-indigo-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-indigo-400" />
                  )}
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-6 space-y-6">
                        {/* AI Summary */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Brain className="w-5 h-5 text-purple-400" />
                            <h4 className="text-white font-semibold">
                              AI Summary
                            </h4>
                          </div>
                          <ul className="space-y-2">
                            {summary.aiSummary.map((point, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                                <span className="text-indigo-200">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Key Concepts */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="w-5 h-5 text-amber-400" />
                            <h4 className="text-white font-semibold">
                              Key Concepts
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {summary.keyConcepts.map((concept, i) => (
                              <span
                                key={i}
                                className="px-3 py-1.5 bg-amber-500/20 text-amber-300 rounded-full text-sm font-medium border border-amber-500/30"
                              >
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Connections */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Link2 className="w-5 h-5 text-cyan-400" />
                            <h4 className="text-white font-semibold">
                              Connections to Other Chapters
                            </h4>
                          </div>
                          <ul className="space-y-2">
                            {summary.connections.map((connection, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <TrendingUp className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                                <span className="text-cyan-200 text-sm">
                                  {connection}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Comprehension Quiz */}
                        {summary.comprehensionQuiz &&
                          summary.comprehensionQuiz[0] && (
                            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl p-4 border border-green-500/20">
                              <div className="flex items-center gap-2 mb-4">
                                <Brain className="w-5 h-5 text-green-400" />
                                <h4 className="text-white font-semibold">
                                  Test Your Understanding
                                </h4>
                              </div>

                              <p className="text-white mb-4">
                                {summary.comprehensionQuiz[0].question}
                              </p>

                              <div className="space-y-2">
                                {summary.comprehensionQuiz[0].options.map(
                                  (option, i) => (
                                    <button
                                      key={i}
                                      onClick={() =>
                                        checkAnswer(summary.chapterNumber, i)
                                      }
                                      disabled={selectedAnswer !== null}
                                      className={`w-full text-left p-3 rounded-lg transition-all ${
                                        selectedAnswer === i
                                          ? quizResult === "correct"
                                            ? "bg-green-600 text-white"
                                            : "bg-red-600 text-white"
                                          : selectedAnswer !== null &&
                                            i ===
                                              summary.comprehensionQuiz![0]
                                                .correctAnswer
                                          ? "bg-green-600/50 text-white"
                                          : "bg-white/10 text-indigo-200 hover:bg-white/20"
                                      } ${
                                        selectedAnswer !== null
                                          ? "cursor-not-allowed"
                                          : "cursor-pointer"
                                      }`}
                                    >
                                      {option}
                                    </button>
                                  )
                                )}
                              </div>

                              {quizResult && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`mt-4 p-3 rounded-lg ${
                                    quizResult === "correct"
                                      ? "bg-green-600/20 text-green-300"
                                      : "bg-red-600/20 text-red-300"
                                  }`}
                                >
                                  {quizResult === "correct"
                                    ? "✅ Correct! You understood the key concept!"
                                    : "❌ Not quite. Review the summary above."}
                                </motion.div>
                              )}
                            </div>
                          )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 text-center"
        >
          <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            AI Saves You 10+ Hours Per Book
          </h3>
          <p className="text-purple-300 max-w-2xl mx-auto">
            Instead of taking notes and highlighting manually, our AI does the
            heavy lifting. Focus on reading and understanding—we'll handle the
            organization! 🚀
          </p>
        </motion.div>
      </div>
    </div>
  );
}
