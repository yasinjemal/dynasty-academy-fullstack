"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Flame,
  Star,
  Crown,
  Sparkles,
  Clock,
  Users,
  TrendingUp,
  Gift,
  Lock,
} from "lucide-react";

interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: any;
  multiplier: number;
  duration: string;
  cost: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  isActive?: boolean;
  expiresAt?: Date;
}

interface Event {
  id: string;
  name: string;
  description: string;
  icon: any;
  bonus: string;
  endsAt: Date;
  isActive: boolean;
}

interface PowerUpsProps {
  powerUps: PowerUp[];
  events: Event[];
  userCoins: number;
}

const rarityConfig = {
  common: {
    color: "from-gray-400 to-gray-600",
    bgColor: "bg-gray-500/20",
    borderColor: "border-gray-500/50",
    textColor: "text-gray-400",
  },
  rare: {
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/50",
    textColor: "text-blue-400",
  },
  epic: {
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500/50",
    textColor: "text-purple-400",
  },
  legendary: {
    color: "from-orange-400 via-yellow-400 to-orange-400",
    bgColor: "bg-gradient-to-br from-orange-500/20 to-yellow-500/20",
    borderColor: "border-orange-500/50",
    textColor: "text-orange-400",
  },
};

export default function PowerUpsSystem({
  powerUps,
  events,
  userCoins,
}: PowerUpsProps) {
  const [activePowerUps, setActivePowerUps] = useState(
    powerUps.filter((p) => p.isActive)
  );

  return (
    <div className="space-y-6">
      {/* Header with coins */}
      <Card className="p-6 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border-yellow-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              Power-Ups & Events
            </h2>
            <p className="text-sm text-muted-foreground">
              Boost your reading progress
            </p>
          </div>

          <motion.div
            className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg border border-yellow-500/30"
            whileHover={{ scale: 1.05 }}
          >
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-2xl font-bold">
              {userCoins.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">coins</span>
          </motion.div>
        </div>
      </Card>

      {/* Active Power-Ups */}
      {activePowerUps.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Active Power-Ups ({activePowerUps.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePowerUps.map((powerUp, index) => (
              <ActivePowerUpCard
                key={powerUp.id}
                powerUp={powerUp}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active Events */}
      {events.filter((e) => e.isActive).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-pink-500" />
            Live Events
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events
              .filter((e) => e.isActive)
              .map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
          </div>
        </div>
      )}

      {/* Available Power-Ups */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Power-Ups</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {powerUps
            .filter((p) => !p.isActive)
            .map((powerUp, index) => (
              <PowerUpCard
                key={powerUp.id}
                powerUp={powerUp}
                index={index}
                userCoins={userCoins}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

function ActivePowerUpCard({
  powerUp,
  index,
}: {
  powerUp: PowerUp;
  index: number;
}) {
  const Icon = powerUp.icon;
  const config = rarityConfig[powerUp.rarity];

  // Calculate time remaining
  const timeRemaining = powerUp.expiresAt
    ? powerUp.expiresAt.getTime() - Date.now()
    : 0;
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor(
    (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className={`p-5 border-2 ${config.borderColor} ${config.bgColor} relative overflow-hidden`}
      >
        {/* Animated shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        />

        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.div
                className={`p-3 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Icon className="w-6 h-6 text-white" />
              </motion.div>

              <div>
                <div className="font-bold">{powerUp.name}</div>
                <Badge
                  variant="outline"
                  className={`${config.textColor} ${config.borderColor} text-xs`}
                >
                  {powerUp.multiplier}x XP
                </Badge>
              </div>
            </div>

            <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
              ACTIVE
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            {powerUp.description}
          </p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {hoursRemaining}h {minutesRemaining}m left
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function PowerUpCard({
  powerUp,
  index,
  userCoins,
}: {
  powerUp: PowerUp;
  index: number;
  userCoins: number;
}) {
  const Icon = powerUp.icon;
  const config = rarityConfig[powerUp.rarity];
  const canAfford = userCoins >= powerUp.cost;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.05, y: -5 }}
    >
      <Card
        className={`p-5 border-2 ${config.borderColor} ${config.bgColor} relative overflow-hidden`}
      >
        <div className="relative">
          {/* Icon and title */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>

            <div>
              <div className="font-bold">{powerUp.name}</div>
              <Badge
                variant="outline"
                className={`${config.textColor} ${config.borderColor} text-xs capitalize`}
              >
                {powerUp.rarity}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-3">
            {powerUp.description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm mb-4">
            <div className={`font-bold ${config.textColor}`}>
              {powerUp.multiplier}x XP Boost
            </div>
            <div className="text-muted-foreground">{powerUp.duration}</div>
          </div>

          {/* Buy button */}
          <Button
            className={`w-full ${
              canAfford ? "" : "opacity-50 cursor-not-allowed"
            }`}
            disabled={!canAfford}
          >
            {canAfford ? (
              <>
                <Star className="w-4 h-4 mr-2" /> Buy for {powerUp.cost} coins
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" /> Not enough coins
              </>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function EventCard({ event, index }: { event: Event; index: number }) {
  const Icon = event.icon;

  // Calculate time remaining
  const timeRemaining = event.endsAt.getTime() - Date.now();
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="p-5 border-2 border-pink-500/50 bg-gradient-to-br from-pink-500/20 to-purple-500/20 relative overflow-hidden">
        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Icon className="w-6 h-6 text-white" />
              </motion.div>

              <div>
                <div className="font-bold flex items-center gap-2">
                  {event.name}
                  <motion.span
                    className="text-xs text-pink-500"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ● LIVE
                  </motion.span>
                </div>
                <Badge className="bg-pink-500/20 text-pink-500 border-pink-500/50 text-xs mt-1">
                  {event.bonus}
                </Badge>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            {event.description}
          </p>

          <div className="flex items-center gap-2 text-sm text-pink-500 font-medium">
            <Clock className="w-4 h-4" />
            <span>
              Ends in {daysRemaining}d {hoursRemaining}h
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Sample data
export const samplePowerUps: PowerUp[] = [
  {
    id: "1",
    name: "Double XP",
    description: "Earn 2x XP from all reading activities",
    icon: Zap,
    multiplier: 2,
    duration: "24 hours",
    cost: 500,
    rarity: "common",
    isActive: true,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
  },
  {
    id: "2",
    name: "Mega Boost",
    description: "Earn 5x XP from all activities",
    icon: Crown,
    multiplier: 5,
    duration: "1 hour",
    cost: 1000,
    rarity: "legendary",
  },
  {
    id: "3",
    name: "Streak Saver",
    description: "Protect your streak for one day",
    icon: Flame,
    multiplier: 1,
    duration: "24 hours",
    cost: 300,
    rarity: "rare",
  },
];

export const sampleEvents: Event[] = [
  {
    id: "1",
    name: "Weekend Reading Marathon",
    description: "Read for 2x XP all weekend long!",
    icon: TrendingUp,
    bonus: "2x XP Weekend",
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
];
