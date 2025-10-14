'use client'

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Trophy, Target } from 'lucide-react';

interface ComparisonStat {
  label: string;
  current: number;
  previous: number;
  unit: string;
  icon: any;
}

interface ComparisonStatsProps {
  stats: ComparisonStat[];
  userRank?: number;
  totalUsers?: number;
  percentile?: number;
}

export default function ComparisonStats({ stats, userRank, totalUsers, percentile }: ComparisonStatsProps) {
  return (
    <div className="space-y-6">
      {/* Rank Card */}
      {userRank && totalUsers && (
        <Card className="p-6 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Your Rank
              </h3>
              <p className="text-sm text-muted-foreground">Among all Dynasty readers</p>
            </div>
            
            <div className="text-right">
              <motion.div 
                className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-transparent bg-clip-text"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                #{userRank.toLocaleString()}
              </motion.div>
              <div className="text-xs text-muted-foreground">
                of {totalUsers.toLocaleString()} users
              </div>
              {percentile && (
                <Badge variant="outline" className="mt-2 border-yellow-500/50 text-yellow-500">
                  Top {percentile}%
                </Badge>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Comparison Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <ComparisonCard key={stat.label} stat={stat} index={index} />
        ))}
      </div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Target className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <div className="font-semibold">Keep Growing!</div>
              <div className="text-sm text-muted-foreground">
                {getMotivationalMessage(stats)}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function ComparisonCard({ stat, index }: { stat: ComparisonStat; index: number }) {
  const Icon = stat.icon;
  const change = stat.current - stat.previous;
  const changePercent = stat.previous > 0 
    ? Math.round((change / stat.previous) * 100) 
    : stat.current > 0 ? 100 : 0;
  
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;

  const getTrendColor = () => {
    if (isPositive) return 'text-green-500';
    if (isNegative) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getTrendIcon = () => {
    if (isPositive) return TrendingUp;
    if (isNegative) return TrendingDown;
    return Minus;
  };

  const TrendIcon = getTrendIcon();

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, x: -20 }}
      animate={{ scale: 1, opacity: 1, x: 0 }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.4,
        type: 'spring'
      }}
      whileHover={{ scale: 1.03, y: -4 }}
    >
      <Card className="p-5 relative overflow-hidden">
        {/* Background gradient */}
        <div className={`absolute inset-0 opacity-10 ${
          isPositive ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
          isNegative ? 'bg-gradient-to-br from-red-500 to-rose-500' :
          'bg-gradient-to-br from-gray-500 to-slate-500'
        }`} />

        <div className="relative">
          {/* Icon and Label */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Icon className="w-4 h-4 text-purple-500" />
              </div>
              <span className="text-sm font-medium">{stat.label}</span>
            </div>
            
            <TrendIcon className={`w-5 h-5 ${getTrendColor()}`} />
          </div>

          {/* Current Value */}
          <div className="mb-2">
            <motion.span 
              className="text-3xl font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
            >
              {stat.current.toLocaleString()}
            </motion.span>
            <span className="text-sm text-muted-foreground ml-2">{stat.unit}</span>
          </div>

          {/* Comparison */}
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              vs yesterday: <span className="font-medium">{stat.previous.toLocaleString()}</span>
            </div>
            
            <Badge 
              variant="outline" 
              className={`${
                isPositive ? 'border-green-500/50 text-green-500' :
                isNegative ? 'border-red-500/50 text-red-500' :
                'border-muted text-muted-foreground'
              }`}
            >
              {isPositive && '+'}{change.toLocaleString()} ({changePercent}%)
            </Badge>
          </div>

          {/* Progress visualization */}
          <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                isPositive ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                isNegative ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                'bg-gradient-to-r from-gray-500 to-slate-500'
              }`}
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(100, Math.abs(changePercent))}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 + 0.3 }}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function getMotivationalMessage(stats: ComparisonStat[]): string {
  const positiveChanges = stats.filter(s => s.current > s.previous).length;
  const total = stats.length;
  
  if (positiveChanges === total) {
    return "🔥 You're on fire! All metrics are up!";
  } else if (positiveChanges >= total / 2) {
    return "📈 Great progress! Keep the momentum going!";
  } else if (positiveChanges > 0) {
    return "💪 You're making progress! Focus on consistency!";
  } else {
    return "🎯 Every day is a fresh start! You got this!";
  }
}
