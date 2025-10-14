'use client'

import { motion } from 'framer-motion'
import { ReactNode, useState, MouseEvent } from 'react'

interface CrystalRefractionProps {
  children: ReactNode
  className?: string
}

export default function CrystalRefraction({ children, className = '' }: CrystalRefractionProps) {
  const [mouseX, setMouseX] = useState(50)
  const [mouseY, setMouseY] = useState(50)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMouseX(x)
    setMouseY(y)
  }

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Prismatic Light Beam */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: `radial-gradient(circle at ${mouseX}% ${mouseY}%, 
            rgba(239, 68, 68, 0.3) 0%,
            rgba(251, 191, 36, 0.3) 20%,
            rgba(34, 197, 94, 0.3) 40%,
            rgba(59, 130, 246, 0.3) 60%,
            rgba(168, 85, 247, 0.3) 80%,
            transparent 100%
          )`,
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Rainbow Shimmer Bars */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-full w-1 pointer-events-none"
          style={{
            left: `${(mouseX + i * 15) % 100}%`,
            background: `linear-gradient(180deg, 
              transparent,
              rgba(${i % 2 === 0 ? '239, 68, 68' : '59, 130, 246'}, 0.3),
              transparent
            )`,
            filter: 'blur(2px)',
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scaleX: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Crystal Facets */}
      <div className="absolute inset-0 pointer-events-none">
        <svg width="100%" height="100%" className="opacity-20">
          <defs>
            <linearGradient id="crystal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="25%" stopColor="#eab308" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#22c55e" stopOpacity="0.4" />
              <stop offset="75%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          
          {/* Diagonal crystal lines */}
          <motion.line
            x1="0" y1="0" x2="100%" y2="100%"
            stroke="url(#crystal-gradient)"
            strokeWidth="2"
            animate={{
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.line
            x1="100%" y1="0" x2="0" y2="100%"
            stroke="url(#crystal-gradient)"
            strokeWidth="2"
            animate={{
              opacity: [0.6, 0.2, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </svg>
      </div>

      {/* Sparkle Points */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white pointer-events-none"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 30}%`,
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: i * 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
