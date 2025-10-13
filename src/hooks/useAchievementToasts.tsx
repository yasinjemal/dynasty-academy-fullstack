'use client'

import { useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Trophy, Zap, Crown, Star, Flame } from 'lucide-react'

interface Achievement {
  id: string
  key: string
  name: string
  description: string
  icon: string
  category: string
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  dynastyPoints: number
}

const rarityColors = {
  COMMON: 'from-gray-400 to-gray-600',
  RARE: 'from-blue-400 to-blue-600',
  EPIC: 'from-purple-400 to-purple-600',
  LEGENDARY: 'from-yellow-400 to-orange-600',
}

const rarityIcons = {
  COMMON: Star,
  RARE: Zap,
  EPIC: Crown,
  LEGENDARY: Flame,
}

export function useAchievementToasts() {
  // Show achievement unlock toast
  const showAchievementToast = useCallback((achievement: Achievement) => {
    const Icon = rarityIcons[achievement.rarity]
    const gradient = rarityColors[achievement.rarity]

    toast.custom(
      (t) => (
        <div
          className={`bg-gradient-to-r ${gradient} p-1 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 duration-500`}
        >
          <div className="bg-gray-900 rounded-lg p-4 flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/5 rounded-full flex items-center justify-center text-3xl animate-bounce">
                {achievement.icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <p className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                  Achievement Unlocked!
                </p>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                {achievement.name}
              </h3>
              <p className="text-sm text-gray-300 mb-2">
                {achievement.description}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-bold">
                    +{achievement.dynastyPoints} Dynasty Points
                  </span>
                </div>
                <div className={`text-xs font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent uppercase`}>
                  {achievement.rarity}
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        duration: 6000,
        position: 'top-center',
      }
    )
  }, [])

  // Listen for achievement events from API
  useEffect(() => {
    const handleAchievement = (event: CustomEvent<Achievement>) => {
      showAchievementToast(event.detail)
    }

    window.addEventListener('achievement-unlocked' as any, handleAchievement)

    return () => {
      window.removeEventListener('achievement-unlocked' as any, handleAchievement)
    }
  }, [showAchievementToast])

  return { showAchievementToast }
}

// Helper to trigger achievement unlock
export function triggerAchievement(achievement: Achievement) {
  const event = new CustomEvent('achievement-unlocked', {
    detail: achievement,
  })
  window.dispatchEvent(event)
}
