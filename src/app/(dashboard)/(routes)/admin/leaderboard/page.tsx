/**
 * Dynasty Score Leaderboard
 *
 * Global ranking system showing top scholars
 */

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  TrendingUp,
  Search,
  Filter,
} from "lucide-react";

type Tier =
  | "Novice"
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Legend";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  tier: Tier;
  avatar: string | null;
}

const tierColors: Record<Tier, string> = {
  Novice: "bg-gray-500",
  Bronze: "bg-amber-700",
  Silver: "bg-gray-400",
  Gold: "bg-yellow-500",
  Platinum: "bg-cyan-500",
  Diamond: "bg-blue-600",
  Legend: "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600",
};

const tierIcons: Record<Tier, string> = {
  Novice: "🌱",
  Bronze: "🥉",
  Silver: "🥈",
  Gold: "🥇",
  Platinum: "💎",
  Diamond: "💠",
  Legend: "👑",
};

export default function DynastyLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now
    const mockData: LeaderboardEntry[] = Array.from(
      { length: 100 },
      (_, i) => ({
        rank: i + 1,
        userId: `user-${i + 1}`,
        username: `Scholar${i + 1}`,
        score: 10000 - i * 50,
        tier: getTierFromScore(10000 - i * 50),
        avatar: null,
      })
    );

    setLeaderboard(mockData);
    setLoading(false);
  }, []);

  const filteredLeaderboard = leaderboard.filter((entry) =>
    entry.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topThree = filteredLeaderboard.slice(0, 3);
  const restOfLeaderboard = filteredLeaderboard.slice(3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dynasty Score Leaderboard
        </h1>
        <p className="text-muted-foreground">
          Global ranking of top scholars and learners
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Podium */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Champions
          </CardTitle>
          <CardDescription>
            The elite few who've reached the summit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="order-2 md:order-1">
                <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600">
                  <Medal className="h-8 w-8 text-gray-400 mb-2" />
                  <div className="text-4xl mb-2">🥈</div>
                  <Avatar className="h-20 w-20 mb-3">
                    <AvatarFallback className="text-2xl">
                      {topThree[1].username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg">{topThree[1].username}</h3>
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">
                    {topThree[1].score.toLocaleString()}
                  </div>
                  <Badge className={tierColors[topThree[1].tier]}>
                    {tierIcons[topThree[1].tier]} {topThree[1].tier}
                  </Badge>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <div className="order-1 md:order-2">
                <div className="flex flex-col items-center p-6 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border-2 border-yellow-500 dark:border-yellow-600 transform md:scale-110">
                  <Crown className="h-10 w-10 text-yellow-500 mb-2 animate-pulse" />
                  <div className="text-5xl mb-2">👑</div>
                  <Avatar className="h-24 w-24 mb-3 ring-4 ring-yellow-500">
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-yellow-400 to-amber-500 text-white">
                      {topThree[0].username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-xl">{topThree[0].username}</h3>
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                    {topThree[0].score.toLocaleString()}
                  </div>
                  <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                    {tierIcons[topThree[0].tier]} {topThree[0].tier}
                  </Badge>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="order-3">
                <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-amber-700 dark:border-amber-600">
                  <Award className="h-8 w-8 text-amber-700 mb-2" />
                  <div className="text-4xl mb-2">🥉</div>
                  <Avatar className="h-20 w-20 mb-3">
                    <AvatarFallback className="text-2xl">
                      {topThree[2].username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg">{topThree[2].username}</h3>
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-600 mb-2">
                    {topThree[2].score.toLocaleString()}
                  </div>
                  <Badge className={tierColors[topThree[2].tier]}>
                    {tierIcons[topThree[2].tier]} {topThree[2].tier}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Global Rankings</CardTitle>
          <CardDescription>
            All scholars ranked by Dynasty Score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {restOfLeaderboard.map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-12 text-center">
                    <span className="text-2xl font-bold text-muted-foreground">
                      #{entry.rank}
                    </span>
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-lg">
                      {entry.username[0]}
                    </AvatarFallback>
                  </Avatar>

                  {/* Username & Tier */}
                  <div>
                    <div className="font-semibold">{entry.username}</div>
                    <Badge variant="outline" className="text-xs">
                      {tierIcons[entry.tier]} {entry.tier}
                    </Badge>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Dynasty Points
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredLeaderboard.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scholars found matching "{searchTerm}"</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tier Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Tier Distribution</CardTitle>
          <CardDescription>Breakdown of scholars by tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(
              [
                "Legend",
                "Diamond",
                "Platinum",
                "Gold",
                "Silver",
                "Bronze",
                "Novice",
              ] as Tier[]
            ).map((tier) => {
              const count = leaderboard.filter((e) => e.tier === tier).length;
              const percentage = (count / leaderboard.length) * 100;

              return (
                <div key={tier}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{tierIcons[tier]}</span>
                      <span className="font-medium">{tier}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {count} scholars ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`${tierColors[tier]} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getTierFromScore(score: number): Tier {
  if (score >= 10000) return "Legend";
  if (score >= 5000) return "Diamond";
  if (score >= 3000) return "Platinum";
  if (score >= 1500) return "Gold";
  if (score >= 500) return "Silver";
  if (score >= 100) return "Bronze";
  return "Novice";
}
