"use client";

/**
 * TRUST BADGE COMPONENT
 *
 * Displays instructor trust score as a visual badge
 * Used throughout the platform wherever instructor info is shown
 */

import { Shield, Star, Award } from "lucide-react";

interface TrustBadgeProps {
  trustScore: number; // 0-1000
  tier: string; // "Unverified", "Verified", "Trusted", "Elite", "Legendary"
  revenueShare?: number; // 0.50-0.95 (optional)
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
}

const TIER_COLORS = {
  Unverified: "bg-gray-500/20 text-gray-400 border-gray-500/50",
  Verified: "bg-green-500/20 text-green-400 border-green-500/50",
  Trusted: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  Elite: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  Legendary: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
};

const TIER_ICONS = {
  Unverified: Shield,
  Verified: Shield,
  Trusted: Award,
  Elite: Award,
  Legendary: Star,
};

export default function TrustBadge({
  trustScore,
  tier,
  revenueShare,
  size = "md",
  showDetails = false,
}: TrustBadgeProps) {
  const Icon = TIER_ICONS[tier as keyof typeof TIER_ICONS] || Shield;
  const colorClass =
    TIER_COLORS[tier as keyof typeof TIER_COLORS] || TIER_COLORS.Unverified;

  // Size classes
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  if (showDetails) {
    return (
      <div
        className={`${colorClass} border rounded-xl ${sizeClasses[size]} inline-flex items-center gap-2`}
      >
        <Icon className={iconSizes[size]} />
        <div className="flex flex-col">
          <span className="font-semibold">{tier} Instructor</span>
          {revenueShare && (
            <span className="text-xs opacity-80">
              {(revenueShare * 100).toFixed(0)}% revenue share
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${colorClass} border rounded-lg ${sizeClasses[size]} inline-flex items-center gap-1.5 font-semibold`}
      title={`${tier} Instructor - Trust Score: ${trustScore}/1000`}
    >
      <Icon className={iconSizes[size]} />
      {tier}
    </div>
  );
}

/**
 * Compact trust score indicator (just icon + score)
 */
export function TrustScoreCompact({
  trustScore,
  tier,
}: {
  trustScore: number;
  tier: string;
}) {
  const Icon = TIER_ICONS[tier as keyof typeof TIER_ICONS] || Shield;
  const colorClass =
    TIER_COLORS[tier as keyof typeof TIER_COLORS] || TIER_COLORS.Unverified;

  return (
    <div
      className={`${colorClass} border rounded-full px-2 py-1 text-xs inline-flex items-center gap-1 font-bold`}
      title={`${tier} - ${trustScore}/1000`}
    >
      <Icon className="w-3 h-3" />
      {trustScore}
    </div>
  );
}

/**
 * Trust score progress bar
 */
export function TrustScoreProgress({ trustScore }: { trustScore: number }) {
  const percentage = (trustScore / 1000) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Trust Score</span>
        <span>{trustScore}/1000</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
