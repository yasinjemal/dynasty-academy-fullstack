"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  Trophy,
} from "lucide-react";
import { dynastyAI } from "@/lib/intelligence/DynastyIntelligenceEngine";
import { useSession } from "next-auth/react";

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "MULTIPLE_SELECT";
  options: QuizOption[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  passingScore: number;
  timeLimit?: number;
  maxAttempts?: number;
  questions: QuizQuestion[];
}

interface QuizAttempt {
  score: number;
  passed: boolean;
  answers: Record<string, string | string[]>;
  attemptNumber: number;
  timeSpent: number;
}

interface QuizComponentProps {
  lessonId: string;
  onComplete?: (passed: boolean, score: number) => void;
}

export function QuizComponent({ lessonId, onComplete }: QuizComponentProps) {
  const { data: session } = useSession();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  // Dynasty Intelligence tracking state
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [questionStartTimes, setQuestionStartTimes] = useState<
    Record<string, number>
  >({});

  // Fetch quiz data
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const response = await fetch(`/api/lessons/${lessonId}/quiz`);
        if (response.ok) {
          const data = await response.json();
          setQuiz(data.quiz);
          if (data.quiz.timeLimit) {
            setTimeRemaining(data.quiz.timeLimit * 60); // Convert to seconds
          }
        }
      } catch (error) {
        console.error("Failed to fetch quiz:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuiz();
  }, [lessonId]);

  // Timer countdown
  useEffect(() => {
    if (!hasStarted || timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, timeRemaining]);

  const currentQuestion = quiz?.questions[currentQuestionIndex];

  const handleAnswerChange = (
    questionId: string,
    answer: string | string[]
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    const totalTime = quizStartTime
      ? Math.floor((Date.now() - quizStartTime) / 1000)
      : 0;

    try {
      const response = await fetch(`/api/lessons/${lessonId}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (response.ok) {
        const data = await response.json();
        setAttempt(data.attempt);
        setShowResults(true);
        onComplete?.(data.attempt.passed, data.attempt.score);

        // Track quiz completion with Dynasty Intelligence
        await trackQuizComplete(
          data.attempt.score,
          data.attempt.passed,
          totalTime
        );
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setAttempt(null);
    setHasStarted(false);
    if (quiz?.timeLimit) {
      setTimeRemaining(quiz.timeLimit * 60);
    }
  };

  // Dynasty Intelligence Tracking Functions
  const trackQuizStart = async () => {
    if (!session?.user?.id || !quiz) return;

    const startTime = Date.now();
    setQuizStartTime(startTime);

    try {
      await dynastyAI.trackEvent({
        userId: session.user.id,
        courseId: lessonId, // Using lessonId as courseId for now
        lessonId: lessonId,
        type: "quiz_complete", // Using quiz_complete for both start and completion
        duration: 0,
        engagement: 1.0, // Starting quiz shows high engagement
        metadata: {
          quizId: quiz.id,
          questionCount: quiz.questions.length,
          timeLimit: quiz.timeLimit,
          passingScore: quiz.passingScore,
          status: "started",
          timestamp: new Date().toISOString(),
        },
      });
      console.log("📊 [Dynasty AI] Quiz started:", quiz.id);
    } catch (error) {
      console.error("[Dynasty AI] Quiz start tracking failed:", error);
    }
  };

  const trackQuizComplete = async (
    finalScore: number,
    passed: boolean,
    totalTime: number
  ) => {
    if (!session?.user?.id || !quiz) return;

    // Calculate engagement based on completion time and score
    const avgTimePerQuestion = totalTime / quiz.questions.length;
    const timeEngagement = Math.min(avgTimePerQuestion / 60, 1); // Normalize to 0-1
    const scoreEngagement = finalScore / 100;
    const engagement = timeEngagement * 0.4 + scoreEngagement * 0.6;

    try {
      await dynastyAI.trackEvent({
        userId: session.user.id,
        courseId: lessonId,
        lessonId: lessonId,
        type: "quiz_complete",
        duration: totalTime,
        engagement: engagement,
        metadata: {
          quizId: quiz.id,
          score: finalScore,
          passed: passed,
          status: "completed",
          questionCount: quiz.questions.length,
          correctAnswers: Object.keys(answers).filter((qId) => {
            const question = quiz.questions.find((q) => q.id === qId);
            return question && answers[qId] === question.correctAnswer;
          }).length,
          totalQuestions: quiz.questions.length,
          accuracy: finalScore / 100,
          timeSpent: totalTime,
          timestamp: new Date().toISOString(),
        },
      });
      console.log("📊 [Dynasty AI] Quiz completed:", {
        score: finalScore,
        passed,
        engagement: engagement.toFixed(2),
      });
    } catch (error) {
      console.error("[Dynasty AI] Quiz completion tracking failed:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center p-8 text-gray-500">
        No quiz available for this lesson.
      </div>
    );
  }

  // Start screen
  if (!hasStarted && !showResults) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto p-8"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-200">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {quiz.title}
            </h2>
            {quiz.description && (
              <p className="text-gray-600">{quiz.description}</p>
            )}
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Questions</span>
              <span className="font-semibold text-gray-900">
                {quiz.questions.length}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Passing Score</span>
              <span className="font-semibold text-gray-900">
                {quiz.passingScore}%
              </span>
            </div>
            {quiz.timeLimit && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time Limit
                </span>
                <span className="font-semibold text-gray-900">
                  {quiz.timeLimit} minutes
                </span>
              </div>
            )}
            {quiz.maxAttempts && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Max Attempts</span>
                <span className="font-semibold text-gray-900">
                  {quiz.maxAttempts}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setHasStarted(true);
              trackQuizStart();
            }}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold text-lg flex items-center justify-center gap-2"
          >
            Start Quiz
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    );
  }

  // Results screen
  if (showResults && attempt) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-8"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-200">
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                attempt.passed ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {attempt.passed ? (
                <Trophy className="w-10 h-10 text-green-600" />
              ) : (
                <AlertCircle className="w-10 h-10 text-red-600" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {attempt.passed ? "Congratulations!" : "Keep Trying!"}
            </h2>
            <p className="text-gray-600">
              {attempt.passed
                ? "You've passed the quiz!"
                : "You didn't pass this time, but you can try again."}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
              <span className="text-gray-700 text-lg">Your Score</span>
              <span
                className={`text-3xl font-bold ${
                  attempt.passed ? "text-green-600" : "text-red-600"
                }`}
              >
                {attempt.score}%
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Passing Score</span>
              <span className="font-semibold text-gray-900">
                {quiz.passingScore}%
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Attempt Number</span>
              <span className="font-semibold text-gray-900">
                {attempt.attemptNumber}
              </span>
            </div>
          </div>

          {!attempt.passed && (
            <button
              onClick={handleRetake}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold text-lg flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Retake Quiz
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Quiz question screen
  if (!currentQuestion) return null;

  const isAnswered = currentQuestion.id in answers;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="bg-white rounded-t-2xl shadow-lg p-6 border-2 border-b-0 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
          </div>
          {timeRemaining !== null && (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeRemaining < 60
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="font-semibold">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                ((currentQuestionIndex + 1) / quiz.questions.length) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-b-2xl shadow-lg p-8 border-2 border-t-0 border-purple-200"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3 mb-8">
            {currentQuestion.type === "MULTIPLE_CHOICE" &&
              currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() =>
                      handleAnswerChange(currentQuestion.id, option.id)
                    }
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-purple-600 bg-purple-600"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-gray-900">{option.text}</span>
                    </div>
                  </button>
                );
              })}

            {currentQuestion.type === "TRUE_FALSE" &&
              ["True", "False"].map((option) => {
                const isSelected = answers[currentQuestion.id] === option;
                return (
                  <button
                    key={option}
                    onClick={() =>
                      handleAnswerChange(currentQuestion.id, option)
                    }
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-purple-600 bg-purple-600"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-gray-900 font-medium">
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={!isAnswered}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Submit Quiz
                <CheckCircle2 className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isAnswered}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next Question
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
