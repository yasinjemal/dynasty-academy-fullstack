'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Zap, TrendingUp, Crown, Flame } from 'lucide-react'
import { useEffect, useState } from 'react'

interface DynastyEvent {
  id: string
  user: string
  action: string
  points: number
  icon: 'zap' | 'crown' | 'flame' | 'trending'
  color: string
}

const iconMap = {
  zap: Zap,
  crown: Crown,
  flame: Flame,
  trending: TrendingUp
}

export default function LiveActivityFeed() {
  const [events, setEvents] = useState<DynastyEvent[]>([])
  const [isVisible, setIsVisible] = useState(true)
  
  useEffect(() => {
    // Simulate live events
    const actions = [
      { action: 'completed a book', points: 50, icon: 'zap' as const, color: 'from-orange-500 to-yellow-500' },
      { action: 'reached 30-day streak', points: 100, icon: 'flame' as const, color: 'from-red-500 to-orange-500' },
      { action: 'became Premium', points: 200, icon: 'crown' as const, color: 'from-yellow-500 to-orange-500' },
      { action: 'leveled up', points: 75, icon: 'trending' as const, color: 'from-purple-500 to-pink-500' },
    ]
    
    const users = ['Alex', 'Sarah', 'Marcus', 'Elena', 'David', 'Aisha', 'James', 'Sophie']
    
    const interval = setInterval(() => {
      const randomAction = actions[Math.floor(Math.random() * actions.length)]
      const randomUser = users[Math.floor(Math.random() * users.length)]
      
      const newEvent: DynastyEvent = {
        id: Date.now().toString(),
        user: randomUser,
        action: randomAction.action,
        points: randomAction.points,
        icon: randomAction.icon,
        color: randomAction.color
      }
      
      setEvents(prev => [newEvent, ...prev.slice(0, 4)])
    }, 4000)
    
    return () => clearInterval(interval)
  }, [])
  
  if (!isVisible) return null
  
  return (
    <motion.div
      className="fixed bottom-24 left-8 z-40 max-w-xs"
      initial={{ x: -400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20 }}
    >
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Zap className="w-5 h-5 text-orange-400" />
            </motion.div>
            <h3 className="text-white font-semibold text-sm">Live Activity</h3>
          </div>
          
          <motion.div
            className="flex items-center gap-1 text-xs text-white/60"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Online</span>
          </motion.div>
        </div>
        
        {/* Events List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {events.map((event) => {
              const Icon = iconMap[event.icon]
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -50, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 50, height: 0 }}
                  transition={{ type: "spring", damping: 25 }}
                  className="relative overflow-hidden rounded-xl"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${event.color} opacity-10`} />
                  
                  <div className="relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <motion.div
                        className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${event.color} p-0.5`}
                        animate={{
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <div className="w-full h-full bg-[#0A0E27] rounded-lg flex items-center justify-center">
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                      </motion.div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs leading-relaxed">
                          <span className="font-semibold">{event.user}</span>
                          {' '}{event.action}
                        </p>
                        
                        {/* Points Badge */}
                        <motion.div
                          className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-gradient-to-r ${event.color} rounded-full`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                        >
                          <Zap className="w-3 h-3 text-white" />
                          <span className="text-xs font-bold text-white">+{event.points} DS</span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
        
        {/* Footer */}
        <motion.div
          className="mt-4 pt-4 border-t border-white/10 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-xs text-white/40">
            <span className="font-semibold text-white/60">12.5K+</span> Dynasty members active now
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
