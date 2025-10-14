"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Eye,
  Users,
  TrendingUp,
  Clock,
  MapPin,
  Star,
  Sparkles,
} from "lucide-react";

interface Visitor {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  visitedAt: Date;
  isFollowing: boolean;
  isNew: boolean;
  location?: string;
  level?: number;
}

interface ProfileVisitorsProps {
  visitors: Visitor[];
  totalViews: number;
  newVisitorsToday: number;
}

export default function ProfileVisitors({
  visitors,
  totalViews,
  newVisitorsToday,
}: ProfileVisitorsProps) {
  // Group visitors by time
  const recentVisitors = visitors.filter((v) => {
    const hoursSinceVisit =
      (Date.now() - v.visitedAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceVisit < 24;
  });

  const olderVisitors = visitors.filter((v) => {
    const hoursSinceVisit =
      (Date.now() - v.visitedAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceVisit >= 24;
  });

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card className="p-6 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10">
        <div className="grid grid-cols-3 gap-4">
          {/* Total views */}
          <motion.div
            className="text-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Eye className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <div className="text-2xl font-bold">
              {totalViews.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Views</div>
          </motion.div>

          {/* Unique visitors */}
          <motion.div
            className="text-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 rounded-lg bg-pink-500/20">
                <Users className="w-5 h-5 text-pink-500" />
              </div>
            </div>
            <div className="text-2xl font-bold">
              {visitors.length.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Unique Visitors</div>
          </motion.div>

          {/* New today */}
          <motion.div
            className="text-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-orange-500">
              +{newVisitorsToday}
            </div>
            <div className="text-xs text-muted-foreground">New Today</div>
          </motion.div>
        </div>
      </Card>

      {/* Recent Visitors (Last 24h) */}
      {recentVisitors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Recent Visitors ({recentVisitors.length})
          </h3>
          <div className="space-y-3">
            {recentVisitors.map((visitor, index) => (
              <VisitorCard
                key={visitor.id}
                visitor={visitor}
                index={index}
                isRecent={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Older Visitors */}
      {olderVisitors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Earlier Visitors ({olderVisitors.length})
          </h3>
          <div className="space-y-3">
            {olderVisitors.map((visitor, index) => (
              <VisitorCard
                key={visitor.id}
                visitor={visitor}
                index={index + recentVisitors.length}
                isRecent={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Avatar Stack Visualization */}
      <Card className="p-6 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
        <h3 className="text-sm font-semibold mb-4">Your Visitor Community</h3>
        <div className="flex items-center">
          {/* Avatar stack */}
          <div className="flex -space-x-3">
            {visitors.slice(0, 10).map((visitor, index) => (
              <motion.div
                key={visitor.id}
                initial={{ scale: 0, x: -10 }}
                animate={{ scale: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <Avatar className="w-10 h-10 border-2 border-background">
                  <AvatarImage src={visitor.avatar} alt={visitor.name} />
                  <AvatarFallback>{visitor.name[0]}</AvatarFallback>
                </Avatar>
                {visitor.isNew && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                )}
              </motion.div>
            ))}
            {visitors.length > 10 && (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                +{visitors.length - 10}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function VisitorCard({
  visitor,
  index,
  isRecent,
}: {
  visitor: Visitor;
  index: number;
  isRecent: boolean;
}) {
  const timeAgo = getTimeAgo(visitor.visitedAt);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={`p-4 ${
          isRecent ? "border-purple-500/30 bg-purple-500/5" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={visitor.avatar} alt={visitor.name} />
                <AvatarFallback>{visitor.name[0]}</AvatarFallback>
              </Avatar>

              {/* New visitor badge */}
              {visitor.isNew && (
                <motion.div
                  className="absolute -top-1 -right-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.6 }}
                >
                  <Badge className="bg-green-500 text-white text-xs px-1.5 py-0">
                    NEW
                  </Badge>
                </motion.div>
              )}

              {/* Level badge */}
              {visitor.level && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white border-2 border-background">
                  {visitor.level}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="font-semibold flex items-center gap-2">
                @{visitor.username}
                {visitor.isFollowing && (
                  <Badge
                    variant="outline"
                    className="text-xs border-purple-500/50 text-purple-500"
                  >
                    Following
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {visitor.name}
              </div>
              {visitor.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{visitor.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Time and actions */}
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <Clock className="w-3 h-3" />
              <span>{timeAgo}</span>
            </div>

            <motion.button
              className="text-sm text-purple-500 hover:text-purple-600 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Profile
            </motion.button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

// Sample data
export const sampleVisitors: Visitor[] = [
  {
    id: "1",
    username: "bookworm23",
    name: "Sarah Johnson",
    avatar: undefined,
    visitedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
    isFollowing: true,
    isNew: true,
    location: "New York, USA",
    level: 42,
  },
  {
    id: "2",
    username: "readerfan",
    name: "Mike Chen",
    avatar: undefined,
    visitedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
    isFollowing: false,
    isNew: true,
    location: "Toronto, Canada",
    level: 28,
  },
  {
    id: "3",
    username: "litlover",
    name: "Emma Wilson",
    avatar: undefined,
    visitedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5h ago
    isFollowing: true,
    isNew: false,
    location: "London, UK",
    level: 55,
  },
];
