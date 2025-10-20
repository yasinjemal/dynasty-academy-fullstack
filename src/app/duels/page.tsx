"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Swords,
  Trophy,
  BookOpen,
  Users,
  Target,
  Clock,
  TrendingUp,
  Flame,
  Crown,
  Zap,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DuelCenter from "@/components/duels/DuelCenter";

/**
 * 🎮 DUELS PAGE
 * The ultimate knowledge battle arena!
 */

interface Book {
  id: string;
  title: string;
  category: string;
}

export default function DuelsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "create" | "history">(
    "overview"
  );
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [opponentUsername, setOpponentUsername] = useState("");
  const [xpBet, setXpBet] = useState(100);
  const [coinBet, setCoinBet] = useState(10);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      // TODO: Create API to fetch user's books
      // For now, we'll just use a placeholder
      const res = await fetch("/api/books?limit=50");
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
      }
    } catch (error) {
      console.error("Failed to load books:", error);
    }
  };

  const handleCreateChallenge = async () => {
    if (!selectedBook || !opponentUsername) {
      alert("Please select a book and enter opponent's username");
      return;
    }

    try {
      setCreating(true);

      const res = await fetch("/api/duels/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opponentUsername,
          bookId: selectedBook,
          xpBet,
          coinBet,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Challenge sent to ${opponentUsername}!`);
        setOpponentUsername("");
        setActiveTab("overview");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to create challenge");
      }
    } catch (error) {
      console.error("Failed to create challenge:", error);
      alert("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-semibold text-purple-300">
                Turn Reading Into Epic Battles
              </span>
            </div>

            <h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 text-transparent bg-clip-text">
              DYNASTY DUELS
            </h1>

            <p className="text-xl text-purple-200 max-w-2xl mx-auto">
              Challenge friends, prove your knowledge mastery, and climb to the
              top of the leaderboard! ⚔️
            </p>

            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50K+</div>
                <div className="text-sm text-purple-300">Total Duels</div>
              </div>
              <div className="h-12 w-px bg-purple-500/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">10K+</div>
                <div className="text-sm text-purple-300">Active Duelists</div>
              </div>
              <div className="h-12 w-px bg-purple-500/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">99%</div>
                <div className="text-sm text-purple-300">Addicted</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Duel Center Widget */}
          <div className="lg:col-span-2">
            <DuelCenter />

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 grid md:grid-cols-3 gap-4"
            >
              <button
                onClick={() => setActiveTab("create")}
                className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/30 p-6 hover:border-purple-500/50 transition-all"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 w-fit mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Challenge Friend
                </h3>
                <p className="text-sm text-purple-300">
                  Send a duel challenge to any user
                </p>
              </button>

              <button className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/30 p-6 hover:border-blue-500/50 transition-all">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 w-fit mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Random Match
                </h3>
                <p className="text-sm text-blue-300">
                  Get matched with a random opponent
                </p>
              </button>

              <button
                onClick={() => setActiveTab("history")}
                className="group bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl border border-yellow-500/30 p-6 hover:border-yellow-500/50 transition-all"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 w-fit mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Duel History
                </h3>
                <p className="text-sm text-yellow-300">
                  View your past battles
                </p>
              </button>
            </motion.div>

            {/* Create Challenge Form */}
            {activeTab === "create" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl border border-purple-500/30 p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Swords className="w-6 h-6 text-purple-400" />
                  Create Challenge
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-purple-300 mb-2">
                      Opponent Username
                    </label>
                    <input
                      type="text"
                      value={opponentUsername}
                      onChange={(e) => setOpponentUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-purple-500/30 text-white placeholder-purple-400/50 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-purple-300 mb-2">
                      Select Book
                    </label>
                    <select
                      value={selectedBook}
                      onChange={(e) => setSelectedBook(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-purple-500/30 text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">Choose a book...</option>
                      {books.map((book) => (
                        <option key={book.id} value={book.id}>
                          {book.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-purple-300 mb-2">
                        XP Bet
                      </label>
                      <input
                        type="number"
                        value={xpBet}
                        onChange={(e) =>
                          setXpBet(Math.max(0, parseInt(e.target.value) || 0))
                        }
                        min="0"
                        step="50"
                        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-purple-500/30 text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-purple-300 mb-2">
                        Coin Bet
                      </label>
                      <input
                        type="number"
                        value={coinBet}
                        onChange={(e) =>
                          setCoinBet(Math.max(0, parseInt(e.target.value) || 0))
                        }
                        min="0"
                        step="10"
                        className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-purple-500/30 text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateChallenge}
                    disabled={creating || !selectedBook || !opponentUsername}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-6 text-lg"
                  >
                    {creating ? (
                      "Sending Challenge..."
                    ) : (
                      <>
                        <Swords className="w-5 h-5 mr-2" />
                        Send Challenge
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - How It Works */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl border border-purple-500/30 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                How It Works
              </h3>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-white">Pick Your Book</p>
                    <p className="text-sm text-purple-300">
                      Choose any book from your library
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      Challenge a Friend
                    </p>
                    <p className="text-sm text-purple-300">
                      Send a duel invitation with stakes
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-white">Battle It Out</p>
                    <p className="text-sm text-purple-300">
                      Answer 5 AI-generated questions
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      Winner Takes All
                    </p>
                    <p className="text-sm text-purple-300">
                      Earn XP, coins, and bragging rights!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tier System */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl border border-purple-500/30 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Tier System
              </h3>

              <div className="space-y-2">
                {[
                  { tier: "BRONZE", xp: "0-999", color: "amber" },
                  { tier: "SILVER", xp: "1K-2.9K", color: "gray" },
                  { tier: "GOLD", xp: "3K-5.9K", color: "yellow" },
                  { tier: "PLATINUM", xp: "6K-9.9K", color: "cyan" },
                  { tier: "DIAMOND", xp: "10K-19.9K", color: "blue" },
                  { tier: "MASTER", xp: "20K-49.9K", color: "purple" },
                  { tier: "LEGEND", xp: "50K+", color: "red" },
                ].map((tier) => (
                  <div
                    key={tier.tier}
                    className="flex items-center justify-between bg-slate-800/30 rounded-lg p-3"
                  >
                    <span className="font-semibold text-white">
                      {tier.tier}
                    </span>
                    <span className="text-sm text-purple-300">{tier.xp} XP</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
