"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Trophy,
  Flame,
  Target,
  Clock,
  Star,
  Crown,
  Sparkles,
  Shield,
  Swords,
  Award,
  TrendingUp,
  Brain,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DuelQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  questionOrder: number;
  difficulty: number;
  estimatedTime: number;
}

interface DuelPlayer {
  id: string;
  name: string;
  image?: string;
  username?: string;
}

interface DuelData {
  id: string;
  challenger: DuelPlayer;
  opponent: DuelPlayer;
  book: {
    id: string;
    title: string;
    coverImage?: string;
  };
  questions: DuelQuestion[];
  xpBet: number;
  coinBet: number;
  timeLimit: number;
}

interface BattleArenaProps {
  duel: DuelData;
  isChallenger: boolean;
  onComplete: (results: DuelResults) => void;
}

interface DuelResults {
  myScore: number;
  opponentScore: number;
  answersCorrect: number;
  totalTime: number;
  xpEarned: number;
  coinsEarned: number;
  newRank?: number;
  achievements?: string[];
}

export default function DuelBattleArena({
  duel,
  isChallenger,
  onComplete,
}: BattleArenaProps) {
  // Game State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(duel.timeLimit);
  const [myScore, setMyScore] = useState(0);
  const [myAnswers, setMyAnswers] = useState<(number | null)[]>(
    new Array(duel.questions.length).fill(null)
  );
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isAnswering, setIsAnswering] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gamePhase, setGamePhase] = useState<"intro" | "battle" | "results">(
    "intro"
  );
  const [streak, setStreak] = useState(0);
  const [combo, setCombo] = useState(0);

  // Sound effects (we'll use Web Audio API)
  const audioContextRef = useRef<AudioContext | null>(null);

  // Particle effect state
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; type: string }>
  >([]);

  // Initialize audio
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }, []);

  // Play sound effect
  const playSound = (
    frequency: number,
    duration: number,
    type: string = "sine"
  ) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type as OscillatorType;

    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContextRef.current.currentTime + duration
    );

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  // Timer countdown
  useEffect(() => {
    if (gamePhase !== "battle") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gamePhase, currentQuestion]);

  // Handle timeout
  const handleTimeout = () => {
    playSound(200, 0.3, "sawtooth");
    handleAnswer(null); // No answer selected
  };

  // Handle answer selection
  const handleAnswer = async (answerIndex: number | null) => {
    if (isAnswering) return;

    setIsAnswering(true);
    setSelectedAnswer(answerIndex);

    const question = duel.questions[currentQuestion];
    const isCorrect = answerIndex === question.correctAnswer;
    const timeTaken = Date.now() - questionStartTime;

    // Calculate score
    let points = 0;
    if (isCorrect) {
      // Base points: 100
      // Time bonus: up to 50 points (faster = more points)
      const timeBonus = Math.max(0, 50 - Math.floor(timeTaken / 1000) * 5);
      // Difficulty bonus: up to 50 points
      const difficultyBonus = Math.floor(question.difficulty * 50);
      // Combo multiplier
      const comboMultiplier = 1 + combo * 0.1;

      points = Math.floor(
        (100 + timeBonus + difficultyBonus) * comboMultiplier
      );

      setMyScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
      setCombo((prev) => prev + 1);

      // Success sound
      playSound(800, 0.2);
      setTimeout(() => playSound(1000, 0.2), 100);

      // Create particles
      createParticles("success");
    } else {
      // Wrong answer sound
      playSound(200, 0.4, "sawtooth");
      setCombo(0);
      createParticles("fail");
    }

    // Update answers array
    const newAnswers = [...myAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setMyAnswers(newAnswers);

    // Show explanation
    setShowExplanation(true);

    // Wait 3 seconds then move to next question
    setTimeout(() => {
      if (currentQuestion < duel.questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setIsAnswering(false);
        setQuestionStartTime(Date.now());
        setTimeLeft(duel.timeLimit);
      } else {
        // Battle complete!
        finishBattle();
      }
    }, 3000);
  };

  // Create particle effects
  const createParticles = (type: string) => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      type,
    }));
    setParticles((prev) => [...prev, ...newParticles]);

    // Remove particles after animation
    setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.find((np) => np.id === p.id))
      );
    }, 1000);
  };

  // Finish battle
  const finishBattle = () => {
    const answersCorrect = myAnswers.filter(
      (answer, index) => answer === duel.questions[index].correctAnswer
    ).length;

    const results: DuelResults = {
      myScore,
      opponentScore: 0, // TODO: Get from real-time DB
      answersCorrect,
      totalTime: duel.questions.length * duel.timeLimit - timeLeft,
      xpEarned: myScore,
      coinsEarned: Math.floor(myScore / 10),
    };

    setGamePhase("results");

    // Victory sound
    if (results.myScore > results.opponentScore) {
      playSound(523, 0.2); // C
      setTimeout(() => playSound(659, 0.2), 150); // E
      setTimeout(() => playSound(784, 0.4), 300); // G
      createParticles("victory");
    }

    onComplete(results);
  };

  const question = duel.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / duel.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1a1047] to-[#0A0E27] relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(to right, #8b5cf6 1px, transparent 1px),
            linear-gradient(to bottom, #8b5cf6 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 1, scale: 0, x: particle.x, y: particle.y }}
            animate={{
              opacity: 0,
              scale: 2,
              y: particle.y - 200,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className={`absolute pointer-events-none ${
              particle.type === "success"
                ? "text-green-400"
                : particle.type === "victory"
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {particle.type === "success"
              ? "✨"
              : particle.type === "victory"
              ? "🏆"
              : "💥"}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* INTRO PHASE */}
      {gamePhase === "intro" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center min-h-screen p-4"
        >
          <div className="max-w-4xl w-full">
            {/* VS Screen */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 blur-3xl" />

              <div className="relative backdrop-blur-xl bg-white/5 border-2 border-purple-500/30 rounded-3xl p-8">
                {/* Book Info */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 px-6 py-3 rounded-full mb-4"
                  >
                    <Swords className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-300 font-bold">
                      KNOWLEDGE DUEL
                    </span>
                  </motion.div>

                  <h2 className="text-2xl font-bold text-white mb-2">
                    {duel.book.title}
                  </h2>
                  <p className="text-white/60">
                    {duel.questions.length} Questions • {duel.timeLimit}s each
                  </p>
                </div>

                {/* Players */}
                <div className="grid grid-cols-3 gap-4 items-center mb-8">
                  {/* Challenger */}
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                  >
                    <div className="relative inline-block mb-3">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 p-1">
                        <div className="w-full h-full rounded-full bg-[#0A0E27] flex items-center justify-center">
                          {duel.challenger.image ? (
                            <img
                              src={duel.challenger.image}
                              alt={duel.challenger.name || ""}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <Crown className="w-10 h-10 text-blue-400" />
                          )}
                        </div>
                      </div>
                      {isChallenger && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                          YOU
                        </div>
                      )}
                    </div>
                    <h3 className="text-white font-bold">
                      {duel.challenger.name || duel.challenger.username}
                    </h3>
                    <p className="text-white/60 text-sm">Challenger</p>
                  </motion.div>

                  {/* VS */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="text-center"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 blur-2xl opacity-50" />
                      <div className="relative bg-gradient-to-r from-red-500 via-orange-500 to-red-500 text-white text-4xl font-black px-8 py-4 rounded-2xl transform -rotate-3">
                        VS
                      </div>
                    </div>
                  </motion.div>

                  {/* Opponent */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                  >
                    <div className="relative inline-block mb-3">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-pink-500 p-1">
                        <div className="w-full h-full rounded-full bg-[#0A0E27] flex items-center justify-center">
                          {duel.opponent.image ? (
                            <img
                              src={duel.opponent.image}
                              alt={duel.opponent.name || ""}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <Shield className="w-10 h-10 text-red-400" />
                          )}
                        </div>
                      </div>
                      {!isChallenger && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                          YOU
                        </div>
                      )}
                    </div>
                    <h3 className="text-white font-bold">
                      {duel.opponent.name || duel.opponent.username}
                    </h3>
                    <p className="text-white/60 text-sm">Opponent</p>
                  </motion.div>
                </div>

                {/* Stakes */}
                {(duel.xpBet > 0 || duel.coinBet > 0) && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center justify-center gap-6 mb-8"
                  >
                    {duel.xpBet > 0 && (
                      <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 px-4 py-2 rounded-full">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-white font-bold">
                          {duel.xpBet} XP
                        </span>
                      </div>
                    )}
                    {duel.coinBet > 0 && (
                      <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 px-4 py-2 rounded-full">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-white font-bold">
                          {duel.coinBet} Coins
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Start Button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-center"
                >
                  <Button
                    onClick={() => {
                      setGamePhase("battle");
                      setQuestionStartTime(Date.now());
                      playSound(440, 0.1);
                      setTimeout(() => playSound(554, 0.1), 100);
                      setTimeout(() => playSound(659, 0.2), 200);
                    }}
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white font-bold text-lg px-12 py-6 rounded-2xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 hover:scale-105"
                  >
                    <Flame className="w-6 h-6 mr-2" />
                    START BATTLE
                  </Button>
                  <p className="text-white/40 text-sm mt-4">
                    May the smartest warrior win! ⚔️
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* BATTLE PHASE */}
      {gamePhase === "battle" && (
        <div className="min-h-screen flex flex-col p-4 pt-8">
          {/* Header Stats */}
          <div className="max-w-5xl mx-auto w-full mb-6">
            <div className="grid grid-cols-3 gap-4">
              {/* Score */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-white/80 text-sm">Your Score</span>
                </div>
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  {myScore}
                </div>
                {combo > 1 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                    <span className="text-orange-400 text-sm font-bold">
                      {combo}x Combo!
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Timer */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="backdrop-blur-xl bg-white/5 border-2 border-white/10 rounded-2xl p-4"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock
                    className={`w-5 h-5 ${
                      timeLeft <= 10
                        ? "text-red-400 animate-pulse"
                        : "text-cyan-400"
                    }`}
                  />
                  <span className="text-white/80 text-sm">Time Left</span>
                </div>
                <div
                  className={`text-4xl font-black text-center ${
                    timeLeft <= 10
                      ? "text-red-400 animate-pulse"
                      : "text-cyan-400"
                  }`}
                >
                  {timeLeft}s
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: `${(timeLeft / duel.timeLimit) * 100}%` }}
                    className={`h-full ${
                      timeLeft <= 10
                        ? "bg-gradient-to-r from-red-500 to-orange-500"
                        : "bg-gradient-to-r from-cyan-500 to-blue-500"
                    }`}
                  />
                </div>
              </motion.div>

              {/* Progress */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="backdrop-blur-xl bg-white/5 border-2 border-white/10 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-green-400" />
                  <span className="text-white/80 text-sm">Progress</span>
                </div>
                <div className="text-3xl font-black text-green-400">
                  {currentQuestion + 1}/{duel.questions.length}
                </div>
                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Question Card */}
          <motion.div
            key={currentQuestion}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="max-w-4xl w-full">
              {/* Question */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 blur-3xl" />
                <div className="relative backdrop-blur-xl bg-white/10 border-2 border-purple-500/30 rounded-3xl p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-purple-400 text-sm font-bold">
                          QUESTION {currentQuestion + 1}
                        </span>
                        <div className="flex gap-1">
                          {Array.from({
                            length: Math.ceil(question.difficulty * 5),
                          }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white leading-relaxed">
                        {question.questionText}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === question.correctAnswer;
                  const shouldShowCorrect = showExplanation && isCorrect;
                  const shouldShowWrong =
                    showExplanation && isSelected && !isCorrect;

                  return (
                    <motion.button
                      key={index}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={!isAnswering ? { scale: 1.02 } : {}}
                      whileTap={!isAnswering ? { scale: 0.98 } : {}}
                      onClick={() => !isAnswering && handleAnswer(index)}
                      disabled={isAnswering}
                      className={`
                        relative group p-6 rounded-2xl border-2 transition-all duration-300
                        ${
                          shouldShowCorrect
                            ? "bg-green-500/20 border-green-500 shadow-lg shadow-green-500/50"
                            : shouldShowWrong
                            ? "bg-red-500/20 border-red-500 shadow-lg shadow-red-500/50"
                            : isSelected
                            ? "bg-purple-500/20 border-purple-500"
                            : "bg-white/5 border-white/10 hover:border-purple-500/50 hover:bg-white/10"
                        }
                        ${isAnswering ? "cursor-not-allowed" : "cursor-pointer"}
                      `}
                    >
                      {/* Glow effect */}
                      {(shouldShowCorrect || shouldShowWrong) && (
                        <div
                          className={`absolute inset-0 blur-xl ${
                            shouldShowCorrect
                              ? "bg-green-500/30"
                              : "bg-red-500/30"
                          }`}
                        />
                      )}

                      <div className="relative flex items-center gap-4">
                        {/* Option Letter */}
                        <div
                          className={`
                          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold
                          ${
                            shouldShowCorrect
                              ? "bg-green-500 text-white"
                              : shouldShowWrong
                              ? "bg-red-500 text-white"
                              : isSelected
                              ? "bg-purple-500 text-white"
                              : "bg-white/10 text-white/60 group-hover:bg-purple-500/50 group-hover:text-white"
                          }
                        `}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>

                        {/* Option Text */}
                        <div className="flex-1 text-left">
                          <p
                            className={`font-semibold ${
                              shouldShowCorrect || shouldShowWrong || isSelected
                                ? "text-white"
                                : "text-white/80 group-hover:text-white"
                            }`}
                          >
                            {option}
                          </p>
                        </div>

                        {/* Checkmark/Cross */}
                        {shouldShowCorrect && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
                          >
                            ✓
                          </motion.div>
                        )}
                        {shouldShowWrong && (
                          <motion.div
                            initial={{ scale: 0, rotate: 180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center"
                          >
                            ✗
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-6"
                  >
                    <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="text-blue-300 font-bold mb-2">
                            Explanation
                          </h4>
                          <p className="text-white/80 leading-relaxed">
                            {question.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Bottom Streak Indicator */}
          {streak > 2 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center py-4"
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 px-6 py-3 rounded-full">
                <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
                <span className="text-white font-bold">
                  🔥 {streak} Streak! On fire!
                </span>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* RESULTS PHASE - To be implemented next */}
      {gamePhase === "results" && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Calculating results...</p>
          </div>
        </div>
      )}
    </div>
  );
}
