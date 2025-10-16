"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  ThumbsUp,
  CheckCircle2,
  Send,
  Filter,
  Award,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Question {
  id: string;
  title: string;
  content: string;
  userId: string;
  user: {
    name: string;
    image?: string;
  };
  upvotes: number;
  answerCount: number;
  isResolved: boolean;
  hasUpvoted: boolean;
  createdAt: string;
}

interface Answer {
  id: string;
  content: string;
  userId: string;
  user: {
    name: string;
    image?: string;
  };
  upvotes: number;
  isInstructorAnswer: boolean;
  isBestAnswer: boolean;
  hasUpvoted: boolean;
  createdAt: string;
}

interface LessonDiscussionProps {
  lessonId: string;
  courseId: string;
}

export function LessonDiscussion({
  lessonId,
  courseId,
}: LessonDiscussionProps) {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [filter, setFilter] = useState<"all" | "resolved" | "unresolved">(
    "all"
  );
  const [showAskForm, setShowAskForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: "", content: "" });
  const [newAnswer, setNewAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch questions
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch(
          `/api/lessons/${lessonId}/questions?filter=${filter}`
        );
        if (response.ok) {
          const data = await response.json();
          setQuestions(data.questions);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuestions();
  }, [lessonId, filter]);

  // Fetch answers when question selected
  useEffect(() => {
    if (!selectedQuestion) return;

    async function fetchAnswers() {
      try {
        const response = await fetch(
          `/api/questions/${selectedQuestion}/answers`
        );
        if (response.ok) {
          const data = await response.json();
          setAnswers(data.answers);
        }
      } catch (error) {
        console.error("Failed to fetch answers:", error);
      }
    }

    fetchAnswers();
  }, [selectedQuestion]);

  const handleAskQuestion = async () => {
    if (!newQuestion.title || !newQuestion.content) {
      console.log("Missing title or content");
      return;
    }

    console.log("Submitting question:", newQuestion);

    try {
      const response = await fetch(`/api/lessons/${lessonId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestion),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Question posted successfully:", data);
        setQuestions([data.question, ...questions]);
        setNewQuestion({ title: "", content: "" });
        setShowAskForm(false);
      } else {
        const error = await response.json();
        console.error("Failed to post question:", error);
        alert(`Error: ${error.error || "Failed to post question"}`);
      }
    } catch (error) {
      console.error("Failed to ask question:", error);
      alert("Failed to post question. Please try again.");
    }
  };

  const handlePostAnswer = async () => {
    if (!newAnswer || !selectedQuestion) return;

    try {
      const response = await fetch(
        `/api/questions/${selectedQuestion}/answers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newAnswer }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnswers([...answers, data.answer]);
        setNewAnswer("");
      }
    } catch (error) {
      console.error("Failed to post answer:", error);
    }
  };

  const handleUpvoteQuestion = async (questionId: string) => {
    try {
      await fetch(`/api/questions/${questionId}/upvote`, { method: "POST" });
      setQuestions(
        questions.map((q) =>
          q.id === questionId
            ? {
                ...q,
                upvotes: q.hasUpvoted ? q.upvotes - 1 : q.upvotes + 1,
                hasUpvoted: !q.hasUpvoted,
              }
            : q
        )
      );
    } catch (error) {
      console.error("Failed to upvote:", error);
    }
  };

  const handleUpvoteAnswer = async (answerId: string) => {
    try {
      await fetch(`/api/answers/${answerId}/upvote`, { method: "POST" });
      setAnswers(
        answers.map((a) =>
          a.id === answerId
            ? {
                ...a,
                upvotes: a.hasUpvoted ? a.upvotes - 1 : a.upvotes + 1,
                hasUpvoted: !a.hasUpvoted,
              }
            : a
        )
      );
    } catch (error) {
      console.error("Failed to upvote:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-purple-600" />
            Lesson Discussion
          </h2>
          <p className="text-gray-600 mt-1">
            Ask questions and help your fellow students
          </p>
        </div>
        <button
          onClick={() => setShowAskForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold"
        >
          Ask Question
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-gray-400" />
        <div className="flex gap-2">
          {(["all", "unresolved", "resolved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Ask Question Modal */}
      <AnimatePresence>
        {showAskForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAskForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ask a Question
              </h3>
              <input
                type="text"
                placeholder="Question title..."
                value={newQuestion.title}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, title: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
              <textarea
                placeholder="Describe your question in detail..."
                value={newQuestion.content}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, content: e.target.value })
                }
                rows={5}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowAskForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Post Question button clicked!");
                    handleAskQuestion();
                  }}
                  disabled={!newQuestion.title || !newQuestion.content}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  Post Question
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No questions yet. Be the first to ask!
          </div>
        ) : (
          questions.map((question) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-purple-300 transition-all cursor-pointer"
              onClick={() => setSelectedQuestion(question.id)}
            >
              <div className="flex gap-4">
                {/* Upvote */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpvoteQuestion(question.id);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      question.hasUpvoted
                        ? "bg-purple-100 text-purple-600"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                  </button>
                  <span className="font-semibold text-gray-700">
                    {question.upvotes}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      {question.title}
                      {question.isResolved && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-3">{question.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      <span>{question.user.name}</span>
                    </div>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(question.createdAt))} ago
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {question.answerCount} answers
                    </span>
                  </div>
                </div>
              </div>

              {/* Answers (if selected) */}
              {selectedQuestion === question.id && answers.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                  {answers.map((answer) => (
                    <div key={answer.id} className="flex gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpvoteAnswer(answer.id);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            answer.hasUpvoted
                              ? "bg-purple-100 text-purple-600"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-sm text-gray-700">
                          {answer.upvotes}
                        </span>
                      </div>

                      <div className="flex-1">
                        <p className="text-gray-800 mb-2">{answer.content}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-gray-600" />
                          </div>
                          <span className="text-gray-600">
                            {answer.user.name}
                          </span>
                          {answer.isInstructorAnswer && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              Instructor
                            </span>
                          )}
                          {answer.isBestAnswer && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Best Answer
                            </span>
                          )}
                          <span className="text-gray-400">
                            • {formatDistanceToNow(new Date(answer.createdAt))}{" "}
                            ago
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Answer input */}
                  <div className="flex gap-3 pt-4">
                    <textarea
                      placeholder="Write your answer..."
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      rows={3}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePostAnswer();
                      }}
                      disabled={!newAnswer}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 h-fit"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
