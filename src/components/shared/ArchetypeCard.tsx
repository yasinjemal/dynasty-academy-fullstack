'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Sparkles, TrendingUp, Zap, Brain, Target, Rocket } from 'lucide-react'
import type { ArchetypeProfile, BuilderArchetype } from '@/lib/algorithms/archetype-detector'

const ARCHETYPE_CONFIG = {
  VISIONARY: {
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    title: 'The Visionary',
    tagline: 'Architect of Possibilities',
    emoji: '🔮',
    description: 'You think in systems and see patterns others miss. Your strength is strategic vision and deep conceptual understanding.'
  },
  STRATEGIST: {
    icon: Target,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    title: 'The Strategist',
    tagline: 'Tactical Commander',
    emoji: '🎯',
    description: 'You excel at structured execution and methodical planning. Your discipline turns ideas into completed realities.'
  },
  HUSTLER: {
    icon: Rocket,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    title: 'The Hustler',
    tagline: 'Speed Executor',
    emoji: '⚡',
    description: 'You move fast and learn by doing. Your momentum and bias toward action create rapid results.'
  }
}

export default function ArchetypeCard() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<ArchetypeProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEvolved, setIsEvolved] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchArchetype()
    } else {
      setLoading(false)
    }
  }, [session])

  const fetchArchetype = async () => {
    try {
      const res = await fetch('/api/archetypes/detect')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        
        // Animation trigger
        setTimeout(() => setIsEvolved(true), 300)
      }
    } catch (error) {
      console.error('Failed to fetch archetype:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/10">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Discover Your Builder DNA</h3>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Sign in to unlock your personalized archetype profile and AI-powered recommendations.
        </p>
        <button className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity">
          Sign In to Discover
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 backdrop-blur-xl animate-pulse">
        <div className="h-6 bg-gray-700/50 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-700/50 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 backdrop-blur-xl">
        <p className="text-gray-400 text-sm">
          Keep interacting to unlock your archetype profile...
        </p>
      </div>
    )
  }

  const config = ARCHETYPE_CONFIG[profile.primaryArchetype]
  const Icon = config.icon
  const secondaryArchetype = Object.entries(profile.scores)
    .filter(([type]) => type.toUpperCase() !== profile.primaryArchetype)
    .sort((a, b) => b[1] - a[1])[0]

  return (
    <div className={`
      relative p-6 rounded-2xl overflow-hidden
      bg-gradient-to-br from-gray-900/80 to-gray-800/80
      border ${config.borderColor}
      backdrop-blur-xl
      transition-all duration-700
      ${isEvolved ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
    `}>
      {/* Animated background gradient */}
      <div className={`
        absolute inset-0 opacity-10 blur-3xl
        bg-gradient-to-br ${config.color}
        animate-pulse
      `} />

      {/* Header */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`
              p-3 rounded-xl ${config.bgColor}
              border ${config.borderColor}
            `}>
              <Icon className={`w-6 h-6 bg-gradient-to-br ${config.color} bg-clip-text text-transparent`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  {config.emoji} {config.title}
                </h3>
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              </div>
              <p className="text-xs text-gray-400">{config.tagline}</p>
            </div>
          </div>
          
          {/* Confidence badge */}
          <div className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${config.bgColor} ${config.borderColor} border
          `}>
            {profile.confidence}% match
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-300 mb-6 leading-relaxed">
          {config.description}
        </p>

        {/* Archetype scores visualization */}
        <div className="space-y-3 mb-6">
          {Object.entries(profile.scores).map(([type, score]) => {
            const archetypeConfig = ARCHETYPE_CONFIG[type.toUpperCase() as BuilderArchetype]
            const isPrimary = type.toUpperCase() === profile.primaryArchetype
            
            return (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium ${isPrimary ? 'text-white' : 'text-gray-400'}`}>
                    {archetypeConfig.emoji} {archetypeConfig.title}
                  </span>
                  <span className={`text-xs ${isPrimary ? 'text-white' : 'text-gray-500'}`}>
                    {score}%
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${archetypeConfig.color} transition-all duration-1000 ease-out`}
                    style={{ 
                      width: isEvolved ? `${score}%` : '0%',
                      transitionDelay: `${Object.keys(profile.scores).indexOf(type) * 100}ms`
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Strengths */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Your Superpowers
          </h4>
          <ul className="space-y-2">
            {profile.strengths.slice(0, 3).map((strength, i) => (
              <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Evolution path */}
        <div className={`
          p-4 rounded-xl
          bg-gradient-to-br from-purple-500/5 to-pink-500/5
          border border-purple-500/20
        `}>
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">
                Your Evolution Path
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                {profile.evolutionPath}
              </p>
              <button className="mt-3 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                View growth roadmap
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Hybrid indicator */}
        {secondaryArchetype && secondaryArchetype[1] > 40 && (
          <div className="mt-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
            <p className="text-xs text-gray-400">
              <span className="text-purple-400 font-medium">Hybrid Builder Detected:</span> You blend{' '}
              <span className="text-white font-medium">{config.title}</span> with{' '}
              <span className="text-white font-medium">
                {ARCHETYPE_CONFIG[secondaryArchetype[0].toUpperCase() as BuilderArchetype].title}
              </span>{' '}
              traits ({secondaryArchetype[1]}%) — a rare combination.
            </p>
          </div>
        )}

        {/* Last updated */}
        <p className="text-xs text-gray-600 mt-4 text-center">
          Profile last updated {new Date(profile.lastUpdated).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
