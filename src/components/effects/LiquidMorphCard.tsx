'use client'

import { motion } from 'framer-motion'
import { ReactNode, useState } from 'react'

interface LiquidMorphCardProps {
  children: ReactNode
  className?: string
}

export default function LiquidMorphCard({ children, className = '' }: LiquidMorphCardProps) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const [rippleId, setRippleId] = useState(0)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    const newRipple = { id: rippleId, x, y }
    setRipples([...ripples, newRipple])
    setRippleId(rippleId + 1)

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
    }, 1000)
  }

  return (
    <motion.div
      className={`relative overflow-hidden cursor-pointer ${className}`}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Liquid Ripple Effects */}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${ripple.x}%`,
            top: `${ripple.y}%`,
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
          }}
          initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
          animate={{
            width: 600,
            height: 600,
            opacity: [0.6, 0],
          }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      ))}

      {/* Morphing Border */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(168, 85, 247, 0.1) 50%, transparent 70%)',
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Liquid Shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          backgroundSize: '200% 100%',
        }}
        animate={{
          backgroundPosition: ['-200% 0%', '200% 0%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.div>
  )
}
