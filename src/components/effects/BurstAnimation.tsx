'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface BurstParticle {
  id: number
  x: number
  y: number
  color: string
  size: number
}

interface BurstAnimationProps {
  trigger?: boolean
  x?: number
  y?: number
  color?: string
  particleCount?: number
}

export default function BurstAnimation({ 
  trigger = false,
  x = 50,
  y = 50,
  color = '#ef4444',
  particleCount = 20
}: BurstAnimationProps) {
  const [show, setShow] = useState(false)
  const [particles, setParticles] = useState<BurstParticle[]>([])

  useEffect(() => {
    if (trigger) {
      setShow(true)
      
      // Generate burst particles
      const newParticles: BurstParticle[] = []
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount
        const velocity = 50 + Math.random() * 50
        newParticles.push({
          id: i,
          x: Math.cos(angle) * velocity,
          y: Math.sin(angle) * velocity,
          color,
          size: 4 + Math.random() * 6
        })
      }
      setParticles(newParticles)

      setTimeout(() => {
        setShow(false)
      }, 1000)
    }
  }, [trigger, color, particleCount])

  return (
    <AnimatePresence>
      {show && (
        <div
          className="fixed pointer-events-none z-40"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          {/* Center Flash */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 30,
              height: 30,
              backgroundColor: color,
              x: -15,
              y: -15,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: [0, 2, 0],
              opacity: [1, 0.5, 0],
            }}
            transition={{ duration: 0.6 }}
          />

          {/* Particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                boxShadow: `0 0 10px ${particle.color}`,
              }}
              initial={{ 
                x: -particle.size / 2, 
                y: -particle.size / 2, 
                scale: 0,
                opacity: 1 
              }}
              animate={{
                x: particle.x,
                y: particle.y,
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 0.8,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Ring Wave */}
          <motion.div
            className="absolute border-2 rounded-full"
            style={{
              borderColor: color,
              x: -25,
              y: -25,
            }}
            initial={{ width: 50, height: 50, opacity: 0.8 }}
            animate={{
              width: 150,
              height: 150,
              x: -75,
              y: -75,
              opacity: 0,
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      )}
    </AnimatePresence>
  )
}
