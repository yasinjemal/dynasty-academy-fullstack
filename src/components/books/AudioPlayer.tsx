'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface AudioPlayerProps {
  bookSlug: string
  chapterNumber: number
  pageContent: string
  voiceId?: string
  isPremiumUser?: boolean
}

export default function AudioPlayer({
  bookSlug,
  chapterNumber,
  pageContent,
  voiceId: initialVoiceId = 'EXAVITQu4vr4xnSDxMaL', // Default: Josh (professional male)
  isPremiumUser = false
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [selectedVoice, setSelectedVoice] = useState(initialVoiceId)
  
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Check if audio already exists
    fetchAudio()
    
    // Load saved audio progress
    const savedProgress = localStorage.getItem(`audio-progress-${bookSlug}-${chapterNumber}`)
    if (savedProgress && audioRef.current) {
      audioRef.current.currentTime = parseFloat(savedProgress)
    }
  }, [chapterNumber])
  
  useEffect(() => {
    // Save audio progress periodically
    const interval = setInterval(() => {
      if (currentTime > 0) {
        localStorage.setItem(`audio-progress-${bookSlug}-${chapterNumber}`, currentTime.toString())
      }
    }, 5000) // Save every 5 seconds
    
    return () => clearInterval(interval)
  }, [currentTime, bookSlug, chapterNumber])

  const fetchAudio = async () => {
    try {
      const res = await fetch(`/api/books/${bookSlug}/audio?chapter=${chapterNumber}`)
      if (res.ok) {
        const data = await res.json()
        setAudioUrl(data.audioUrl)
      }
    } catch (error) {
      console.log('No cached audio found')
    }
  }

  const generateAudio = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/books/${bookSlug}/audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterNumber,
          content: pageContent,
          voiceId: selectedVoice,
        }),
      })

      if (!res.ok) throw new Error('Failed to generate audio')

      const data = await res.json()
      setAudioUrl(data.audioUrl)
      
      // Start playing after generation
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play()
          setIsPlaying(true)
        }
      }, 100)
    } catch (error) {
      console.error('Audio generation failed:', error)
      alert('Failed to generate audio. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    setCurrentTime(audioRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return
    setDuration(audioRef.current.duration)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    const time = parseFloat(e.target.value)
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    const vol = parseFloat(e.target.value)
    audioRef.current.volume = vol
    setVolume(vol)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  const downloadAudio = () => {
    if (!audioUrl) return
    
    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `dynasty-${bookSlug}-chapter-${chapterNumber}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  const handleVoiceChange = (newVoiceId: string) => {
    setSelectedVoice(newVoiceId)
    // Clear current audio to force regeneration with new voice
    setAudioUrl(null)
    setIsPlaying(false)
  }

  return (
    <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-xl p-6 shadow-2xl">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">Listen Mode</h3>
          <p className="text-purple-200 text-sm">AI Voice Narration by ElevenLabs</p>
        </div>
      </div>

      {!audioUrl ? (
        <div className="space-y-4">
          {/* Voice Selector - Show BEFORE generation */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium block">Select Narrator Voice:</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              disabled={isLoading}
              className="w-full bg-purple-700/50 text-white rounded-lg px-4 py-3 text-sm border border-purple-500/30 focus:border-purple-400 focus:outline-none disabled:opacity-50"
            >
              <option value="EXAVITQu4vr4xnSDxMaL">⚡ Dynamic (Josh) - Recommended</option>
              <option value="21m00Tcm4TlvDq8ikWAM">🎙️ Motivational (Rachel)</option>
              <option value="AZnzlk1XvdvUeBnXmlld">💼 Professional (Domi)</option>
              <option value="ErXwobaYiN019PkySvjV">🎯 Focused (Antoni)</option>
              <option value="MF3mGyEYCl7XYWbV9V6O">✨ Inspiring (Elli)</option>
            </select>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateAudio}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating Audio...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                🎧 Generate Audio for This Page
              </>
            )}
          </Button>

          {/* Premium hint */}
          <p className="text-purple-200/60 text-xs text-center italic">
            Try different voices to find your perfect narrator ✨
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Audio element */}
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          />

          {/* Waveform Animation (shows when playing) */}
          {isPlaying && (
            <div className="flex space-x-1 items-end h-8 justify-center mb-2">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-purple-400 to-blue-400 rounded-full animate-bounce"
                  style={{ 
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${0.5 + (i % 3) * 0.2}s`,
                    height: `${20 + (i % 4) * 8}px`
                  }}
                />
              ))}
            </div>
          )}

          {/* Play/Pause button */}
          <Button
            onClick={togglePlay}
            className="w-full bg-white text-purple-900 hover:bg-purple-100 font-bold py-4"
          >
            {isPlaying ? (
              <>
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Play
              </>
            )}
          </Button>

          {/* Progress bar */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-purple-300 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-white text-sm">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-purple-300 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-white text-sm w-12">{Math.round(volume * 100)}%</span>
          </div>

          {/* Change Voice Option - After generation */}
          <div className="bg-purple-800/30 rounded-lg p-3 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <label className="text-white text-sm font-medium">Change Voice:</label>
              <button
                onClick={() => handleVoiceChange(selectedVoice)}
                className="text-yellow-400 hover:text-yellow-300 text-xs font-medium underline"
              >
                Regenerate with new voice
              </button>
            </div>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full bg-purple-700/50 text-white rounded-lg px-3 py-2 text-sm border border-purple-500/30 focus:border-purple-400 focus:outline-none"
            >
              <option value="EXAVITQu4vr4xnSDxMaL">⚡ Dynamic (Josh)</option>
              <option value="21m00Tcm4TlvDq8ikWAM">🎙️ Motivational (Rachel)</option>
              <option value="AZnzlk1XvdvUeBnXmlld">💼 Professional (Domi)</option>
              <option value="ErXwobaYiN019PkySvjV">🎯 Focused (Antoni)</option>
              <option value="MF3mGyEYCl7XYWbV9V6O">✨ Inspiring (Elli)</option>
            </select>
            <p className="text-purple-200/50 text-xs mt-2 italic">
              Select a voice above, then click "Regenerate" to hear this page with a different narrator
            </p>
          </div>

          {/* Download Button (Premium Users) */}
          {isPremiumUser && (
            <button
              onClick={downloadAudio}
              className="w-full text-yellow-400 hover:text-yellow-300 text-sm font-medium underline py-2 flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download MP3 (Premium)
            </button>
          )}

          {/* Premium feature badge */}
          <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Premium Dynasty Feature
          </div>

          {/* Dynasty Branding */}
          <p className="text-[11px] text-purple-200/70 text-center italic leading-relaxed">
            Powered by DynastyBuilt Academy AI — Turning knowledge into ritual.
          </p>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}
