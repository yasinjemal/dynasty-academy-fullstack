'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TrailPoint {
  id: number
  x: number
  y: number
  color: string
}

export default function RainbowTrail() {
  const [trail, setTrail] = useState<TrailPoint[]>([])
  const [nextId, setNextId] = useState(0)

  const colors = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#a855f7', // purple
  ]

  useEffect(() => {
    let animationFrame: number

    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
      
      animationFrame = requestAnimationFrame(() => {
        const newPoint: TrailPoint = {
          id: nextId,
          x: e.clientX,
          y: e.clientY,
          color: colors[nextId % colors.length],
        }

        setTrail((prev) => {
          const newTrail = [...prev, newPoint]
          // Keep only last 15 points
          return newTrail.slice(-15)
        })
        
        setNextId((prev) => prev + 1)

        // Remove the point after animation
        setTimeout(() => {
          setTrail((prev) => prev.filter((p) => p.id !== newPoint.id))
        }, 800)
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [nextId])

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      <AnimatePresence>
        {trail.map((point, index) => (
          <motion.div
            key={point.id}
            className="absolute rounded-full"
            style={{
              left: point.x,
              top: point.y,
              background: `radial-gradient(circle, ${point.color} 0%, transparent 70%)`,
            }}
            initial={{ 
              width: 40, 
              height: 40, 
              x: -20, 
              y: -20,
              opacity: 0.8,
              scale: 1
            }}
            animate={{
              opacity: 0,
              scale: 0.5,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Cursor dot */}
      <AnimatePresence>
        {trail.length > 0 && (
          <motion.div
            className="absolute w-4 h-4 rounded-full"
            style={{
              left: trail[trail.length - 1]?.x,
              top: trail[trail.length - 1]?.y,
              x: -8,
              y: -8,
              background: 'white',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
