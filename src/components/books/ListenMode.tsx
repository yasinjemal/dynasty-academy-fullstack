'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, Download } from 'lucide-react'

interface ListenModeProps {
  bookSlug: string
  chapterNumber: number
  pageContent: string
  isPremiumUser: boolean
}

interface Sentence {
  text: string
  startTime: number
  endTime: number
  wordCount: number
}

export default function ListenMode({
  bookSlug,
  chapterNumber,
  pageContent,
  isPremiumUser,
}: ListenModeProps) {
  // Audio state
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Voice selection
  const [selectedVoice, setSelectedVoice] = useState('EXAVITQu4vr4xnSDxMaL') // Josh (default)
  const [hasGenerated, setHasGenerated] = useState(false)

  // Sentence highlighting
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(-1)
  const [followText, setFollowText] = useState(true)

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const sentenceRefs = useRef<(HTMLSpanElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Available voices
  const voices = [
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Josh', description: 'Deep, authoritative male voice' },
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Warm, professional female voice' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', description: 'Confident, clear female voice' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Friendly, engaging male voice' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Energetic, youthful female voice' },
  ]

  // Split text into sentences
  const sentences: Sentence[] = useMemo(() => {
    if (!pageContent) return []

    // Clean HTML and extract text
    const cleanText = pageContent
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    // Split into sentences (simple regex - can be improved)
    const sentenceTexts = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText]

    // Calculate word count for each sentence
    const sentencesWithWords = sentenceTexts.map(text => ({
      text: text.trim(),
      wordCount: text.trim().split(/\s+/).length,
    }))

    // Calculate total words
    const totalWords = sentencesWithWords.reduce((sum, s) => sum + s.wordCount, 0)

    // Estimate timestamps based on word count ratio
    // Assuming audio duration is known, we distribute time proportionally
    let cumulativeTime = 0
    return sentencesWithWords.map((sentence, index) => {
      const ratio = sentence.wordCount / totalWords
      const sentenceDuration = duration * ratio
      const startTime = cumulativeTime
      const endTime = cumulativeTime + sentenceDuration

      cumulativeTime = endTime

      return {
        text: sentence.text,
        startTime,
        endTime,
        wordCount: sentence.wordCount,
      }
    })
  }, [pageContent, duration])

  // Update active sentence based on current time
  useEffect(() => {
    if (!isPlaying || sentences.length === 0) return

    const activeIndex = sentences.findIndex(
      (sentence) => currentTime >= sentence.startTime && currentTime < sentence.endTime
    )

    if (activeIndex !== -1 && activeIndex !== activeSentenceIndex) {
      setActiveSentenceIndex(activeIndex)

      // Auto-scroll to active sentence
      if (followText && sentenceRefs.current[activeIndex] && containerRef.current) {
        sentenceRefs.current[activeIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }
  }, [currentTime, isPlaying, sentences, activeSentenceIndex, followText])

  // Generate audio
  const generateAudio = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/books/${bookSlug}/audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterNumber,
          content: pageContent,
          voiceId: selectedVoice,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate audio')
      }

      const data = await response.json()
      setAudioUrl(data.audioUrl)
      setDuration(data.duration || 0)
      setHasGenerated(true)

      // Load progress if exists
      const savedProgress = localStorage.getItem(`audio-${bookSlug}-${chapterNumber}`)
      if (savedProgress) {
        const progress = JSON.parse(savedProgress)
        if (audioRef.current) {
          audioRef.current.currentTime = progress.currentTime || 0
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate audio')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch existing audio
  const fetchAudio = async () => {
    try {
      const response = await fetch(
        `/api/books/${bookSlug}/audio?chapter=${chapterNumber}`
      )

      if (response.ok) {
        const data = await response.json()
        setAudioUrl(data.audioUrl)
        setDuration(data.duration || 0)
        setHasGenerated(true)
      }
    } catch (err) {
      console.log('No cached audio found')
    }
  }

  // Load existing audio on mount
  useEffect(() => {
    fetchAudio()
  }, [bookSlug, chapterNumber])

  // Audio event handlers
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
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)

      // Save progress every 5 seconds
      if (Math.floor(audioRef.current.currentTime) % 5 === 0) {
        localStorage.setItem(
          `audio-${bookSlug}-${chapterNumber}`,
          JSON.stringify({
            currentTime: audioRef.current.currentTime,
            updatedAt: new Date().toISOString(),
          })
        )
      }
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
    }
    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 10,
        duration
      )
    }
  }

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0)
    }
  }

  const downloadAudio = () => {
    if (!audioUrl || !isPremiumUser) return

    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `${bookSlug}-chapter-${chapterNumber}.mp3`
    link.click()
  }

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId)
  }

  const regenerateWithNewVoice = async () => {
    setAudioUrl(null)
    setHasGenerated(false)
    await generateAudio()
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Waveform animation bars
  const waveformBars = Array.from({ length: 12 }, (_, i) => (
    <div
      key={i}
      className={`w-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full transition-all duration-300 ${
        isPlaying ? 'animate-pulse' : 'h-4'
      }`}
      style={{
        height: isPlaying ? `${20 + Math.random() * 40}px` : '16px',
        animationDelay: `${i * 0.1}s`,
      }}
    />
  ))

  return (
    <div className="w-full space-y-6">
      {/* Audio Player Card */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <Volume2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white">Listen Mode</h3>
              <p className="text-purple-200 text-sm">AI Voice Narration by ElevenLabs</p>
            </div>
          </div>

          {/* Waveform Animation */}
          <div className="flex items-end justify-center gap-1 h-16">
            {waveformBars}
          </div>

          {!audioUrl ? (
            <>
              {/* Voice Selection BEFORE Generation */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white">
                  Select AI Voice:
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  disabled={isLoading}
                >
                  {voices.map((voice) => (
                    <option key={voice.id} value={voice.id} className="bg-gray-900">
                      {voice.name} - {voice.description}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-purple-200 italic">
                  Select a voice above, then click "Generate" to hear this page with a different narrator.
                </p>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateAudio}
                disabled={isLoading}
                className="w-full py-4 bg-white text-purple-700 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-purple-700 border-t-transparent rounded-full animate-spin" />
                    Generating Audio...
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" />
                    Generate Audio with {voices.find((v) => v.id === selectedVoice)?.name}
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Audio Element */}
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              {/* Play/Pause Button */}
              <button
                onClick={togglePlay}
                className="w-full py-4 bg-white text-purple-700 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all flex items-center justify-center gap-3"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-6 h-6" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" />
                    Play
                  </>
                )}
              </button>

              {/* Skip Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={skipBackward}
                  className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-all"
                  title="Skip back 10s"
                >
                  <SkipBack className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={skipForward}
                  className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-all"
                  title="Skip forward 10s"
                >
                  <SkipForward className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-sm text-purple-200">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <span className="text-white text-sm font-medium w-12 text-right">
                  {volume}%
                </span>
              </div>

              {/* Change Voice Section */}
              <div className="pt-4 border-t border-white/20 space-y-3">
                <label className="block text-sm font-medium text-white">
                  Change Voice:
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-white/50"
                >
                  {voices.map((voice) => (
                    <option key={voice.id} value={voice.id} className="bg-gray-900">
                      {voice.name} - {voice.description}
                    </option>
                  ))}
                </select>
                <button
                  onClick={regenerateWithNewVoice}
                  disabled={isLoading}
                  className="w-full py-2 bg-white/10 backdrop-blur text-white text-sm rounded-lg hover:bg-white/20 transition-all disabled:opacity-50"
                >
                  Regenerate with new voice
                </button>
              </div>

              {/* Download Button (Premium Only) */}
              {isPremiumUser && (
                <button
                  onClick={downloadAudio}
                  className="w-full py-3 bg-white/10 backdrop-blur text-white rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Audio
                </button>
              )}
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-100 text-sm">
              {error}
            </div>
          )}

          {/* Dynasty Branding */}
          <div className="pt-4 border-t border-white/20 text-center">
            <p className="text-purple-200 text-xs">
              Powered by <span className="font-bold">DynastyBuilt Academy AI</span> — Turning
              knowledge into ritual.
            </p>
          </div>
        </div>
      </div>

      {/* Text with Sentence Highlighting */}
      {audioUrl && sentences.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Follow Along
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={followText}
                onChange={(e) => setFollowText(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Auto-scroll (Beta)
              </span>
            </label>
          </div>

          <div
            ref={containerRef}
            className="p-8 prose prose-lg dark:prose-invert max-w-none overflow-y-auto max-h-[600px]"
            style={{
              lineHeight: '2',
              fontSize: '1.125rem',
            }}
          >
            {sentences.map((sentence, index) => (
              <span
                key={index}
                ref={(el) => {
                  sentenceRefs.current[index] = el
                }}
                className={`transition-all duration-300 ${
                  index === activeSentenceIndex
                    ? 'bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-900/50 dark:to-blue-900/50 border-l-4 border-purple-500 pl-3 py-1 rounded'
                    : ''
                }`}
                style={{
                  display: 'inline',
                }}
              >
                {sentence.text}{' '}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
