"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  X,
  Award,
  Zap,
  TrendingUp,
  Target,
  BookOpen,
  Brain,
  Sparkles,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Lesson {
  id: string;
  title: string;
  content: string[];
  quiz: Question;
}

const SAMPLE_COURSE: Lesson[] = [
  {
    id: "1",
    title: "Introduction to React",
    content: [
      "React is a JavaScript library for building user interfaces.",
      "It was created by Facebook and is now maintained by Meta.",
      "React uses a component-based architecture.",
      "Components are reusable pieces of UI.",
      "React uses a virtual DOM for efficient updates.",
    ],
    quiz: {
      id: "q1",
      question: "What is React primarily used for?",
      options: [
        "Building user interfaces",
        "Managing databases",
        "Server-side rendering only",
        "Writing CSS styles",
      ],
      correctAnswer: 0,
      explanation:
        "React is a JavaScript library specifically designed for building user interfaces!",
    },
  },
  {
    id: "2",
    title: "Components",
    content: [
      "Components are the building blocks of React apps.",
      "They can be functional or class-based.",
      "Functional components are simpler and more modern.",
      "Components can accept props (properties).",
      "Props make components reusable and dynamic.",
    ],
    quiz: {
      id: "q2",
      question: "What are props in React?",
      options: [
        "A type of component",
        "Properties passed to components",
        "CSS styling classes",
        "Database connections",
      ],
      correctAnswer: 1,
      explanation:
        "Props are properties that are passed to components to make them dynamic and reusable!",
    },
  },
  {
    id: "3",
    title: "State Management",
    content: [
      "State is data that changes over time in your app.",
      "useState is a hook for managing state.",
      "State updates trigger component re-renders.",
      "Each component can have its own state.",
      "State should be immutable - never modify directly.",
    ],
    quiz: {
      id: "q3",
      question: "What hook is used for managing state?",
      options: ["useEffect", "useState", "useContext", "useReducer"],
      correctAnswer: 1,
      explanation:
        "useState is the primary hook for managing state in functional components!",
    },
  },
];

export default function SoloLearnStylePlayer() {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(3);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const currentLesson = SAMPLE_COURSE[currentLessonIndex];
  const isLastCard = currentCardIndex === currentLesson.content.length - 1;
  const isLastLesson = currentLessonIndex === SAMPLE_COURSE.length - 1;
  const progress =
    (currentLessonIndex * 100 +
      ((currentCardIndex + 1) / currentLesson.content.length) * 100) /
    SAMPLE_COURSE.length;

  const handleNext = () => {
    setDirection("right");

    if (isLastCard) {
      // Show quiz after last card
      setShowQuiz(true);
    } else {
      setCurrentCardIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setDirection("left");

    if (showQuiz) {
      setShowQuiz(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
    } else if (currentLessonIndex > 0) {
      setCurrentLessonIndex((prev) => prev - 1);
      setCurrentCardIndex(
        SAMPLE_COURSE[currentLessonIndex - 1].content.length - 1
      );
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Already answered

    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentLesson.quiz.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setXp((prev) => prev + 10);
      if (!completedLessons.includes(currentLesson.id)) {
        setCompletedLessons((prev) => [...prev, currentLesson.id]);
      }
    }
  };

  const handleNextLesson = () => {
    if (!isLastLesson) {
      setCurrentLessonIndex((prev) => prev + 1);
      setCurrentCardIndex(0);
      setShowQuiz(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setDirection("right");
    }
  };

  const handleSwipe = (info: PanInfo) => {
    if (info.offset.x < -100) {
      handleNext();
    } else if (info.offset.x > 100) {
      handlePrevious();
    }
  };

  const variants = {
    enter: (direction: string) => ({
      x: direction === "right" ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: string) => ({
      x: direction === "right" ? -1000 : 1000,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col">
      {/* Header Stats */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">{xp} XP</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-white font-bold">{streak} day streak</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <span className="text-white text-sm">
              Lesson {currentLessonIndex + 1} of {SAMPLE_COURSE.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-5xl mx-auto mt-3">
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        <div className="w-full max-w-2xl relative" style={{ height: "600px" }}>
          <AnimatePresence mode="wait" custom={direction}>
            {!showQuiz ? (
              /* Content Card */
              <motion.div
                key={`lesson-${currentLessonIndex}-card-${currentCardIndex}`}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => handleSwipe(info)}
                className="absolute inset-0"
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 h-full flex flex-col justify-center items-center text-center shadow-2xl">
                  {/* Lesson Title */}
                  <div className="mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold mb-4">
                      <Brain className="w-4 h-4" />
                      {currentLesson.title}
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-3xl md:text-4xl font-bold text-white leading-relaxed">
                    {currentLesson.content[currentCardIndex]}
                  </p>

                  {/* Card Counter */}
                  <div className="mt-8 flex gap-2">
                    {currentLesson.content.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentCardIndex
                            ? "bg-purple-500 w-6"
                            : "bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Quiz Card */
              <motion.div
                key={`lesson-${currentLessonIndex}-quiz`}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-0"
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 h-full flex flex-col shadow-2xl">
                  {/* Quiz Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold mb-4">
                      <Target className="w-4 h-4" />
                      Quiz Time!
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {currentLesson.quiz.question}
                    </h3>
                  </div>

                  {/* Answer Options */}
                  <div className="flex-1 space-y-3">
                    {currentLesson.quiz.options.map((option, index) => (
                      <motion.button
                        key={index}
                        whileHover={{
                          scale: selectedAnswer === null ? 1.02 : 1,
                        }}
                        whileTap={{ scale: selectedAnswer === null ? 0.98 : 1 }}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={selectedAnswer !== null}
                        className={`w-full p-4 rounded-xl text-left font-semibold transition-all ${
                          selectedAnswer === null
                            ? "bg-white/10 hover:bg-white/20 text-white border-2 border-white/20"
                            : selectedAnswer === index
                            ? isCorrect
                              ? "bg-green-500/20 text-green-300 border-2 border-green-500"
                              : "bg-red-500/20 text-red-300 border-2 border-red-500"
                            : index === currentLesson.quiz.correctAnswer
                            ? "bg-green-500/20 text-green-300 border-2 border-green-500"
                            : "bg-white/5 text-slate-500 border-2 border-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {selectedAnswer !== null && (
                            <>
                              {selectedAnswer === index &&
                                (isCorrect ? (
                                  <CheckCircle className="w-6 h-6 text-green-400" />
                                ) : (
                                  <X className="w-6 h-6 text-red-400" />
                                ))}
                              {selectedAnswer !== index &&
                                index === currentLesson.quiz.correctAnswer && (
                                  <CheckCircle className="w-6 h-6 text-green-400" />
                                )}
                            </>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Explanation */}
                  <AnimatePresence>
                    {selectedAnswer !== null && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={`mt-6 p-4 rounded-xl ${
                          isCorrect
                            ? "bg-green-500/20 border-2 border-green-500/50"
                            : "bg-blue-500/20 border-2 border-blue-500/50"
                        }`}
                      >
                        <p
                          className={`font-semibold mb-2 ${
                            isCorrect ? "text-green-300" : "text-blue-300"
                          }`}
                        >
                          {isCorrect ? "🎉 Correct!" : "💡 Learn:"}
                        </p>
                        <p className="text-white">
                          {currentLesson.quiz.explanation}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Next Lesson Button */}
                  {selectedAnswer !== null && (
                    <motion.button
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNextLesson}
                      disabled={isLastLesson}
                      className={`mt-4 w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${
                        isLastLesson
                          ? "bg-white/5 text-slate-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      }`}
                    >
                      {isLastLesson ? (
                        <>
                          <Award className="w-5 h-5" />
                          Course Complete!
                        </>
                      ) : (
                        <>
                          Next Lesson
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-t border-white/10 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrevious}
            disabled={
              currentLessonIndex === 0 && currentCardIndex === 0 && !showQuiz
            }
            className="w-14 h-14 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <div className="text-center">
            <p className="text-slate-400 text-sm mb-1">
              Swipe or click to continue
            </p>
            <p className="text-white font-bold">
              {showQuiz
                ? "Answer the question"
                : `${currentCardIndex + 1} / ${currentLesson.content.length}`}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            disabled={showQuiz || (isLastCard && showQuiz)}
            className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-500/50"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
