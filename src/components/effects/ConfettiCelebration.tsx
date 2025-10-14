'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Confetti {
  id: number
  x: number
  y: number
  color: string
  rotation: number
  size: number
}

export default function ConfettiCelebration({ trigger }: { trigger: boolean }) {
  const [confetti, setConfetti] = useState<Confetti[]>([])
  
  useEffect(() => {
    if (!trigger) return
    
    const colors = ['#f97316', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#eab308']
    const newConfetti: Confetti[] = []
    
    // Create 50 confetti pieces
    for (let i = 0; i < 50; i++) {
      newConfetti.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -50,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        size: Math.random() * 10 + 5
      })
    }
    
    setConfetti(newConfetti)
    
    // Clear after animation
    const timer = setTimeout(() => {
      setConfetti([])
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [trigger])
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]">
      <AnimatePresence>
        {confetti.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute"
            initial={{
              x: piece.x,
              y: piece.y,
              rotate: piece.rotation,
              opacity: 1
            }}
            animate={{
              y: window.innerHeight + 100,
              rotate: piece.rotation + 720,
              opacity: 0
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 3,
              ease: "easeIn"
            }}
          >
            <div
              className="rounded-sm"
              style={{
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
