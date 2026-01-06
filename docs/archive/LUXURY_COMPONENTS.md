# 🎨 Dynasty Luxury React Component Patterns

## Extracted from ListenModeLuxury.tsx

---

## 1. ANIMATED PARTICLE BACKGROUND

```tsx
{
  /* Animated background particles */
}
{
  showParticles && (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
}
```

---

## 2. PREMIUM BADGE COMPONENT

```tsx
const PremiumBadge = () => (
  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full px-6 py-3">
    <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-semibold">
      Dynasty Listen Mode™
    </span>
    <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
  </div>
);
```

---

## 3. VOICE SELECTION GRID

```tsx
const VoiceSelector = ({ voices, selectedVoice, onSelect }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
    {voices.map((voice) => (
      <button
        key={voice.id}
        onClick={() => onSelect(voice.id)}
        className={`relative group p-6 rounded-2xl transition-all duration-300 ${
          selectedVoice === voice.id
            ? `bg-gradient-to-br ${voice.gradient} shadow-lg shadow-purple-500/30 scale-105`
            : "bg-slate-800/50 hover:bg-slate-800/80 hover:scale-102"
        }`}
      >
        {voice.premium && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">
            <Star className="w-3 h-3 inline mr-1" />
            PREMIUM
          </div>
        )}
        <div className="text-4xl mb-3">{voice.icon}</div>
        <h3 className="text-white font-bold mb-1">{voice.name}</h3>
        <p className="text-xs text-purple-300/70 mb-2">{voice.personality}</p>
        <p className="text-xs text-purple-300/50">{voice.description}</p>
      </button>
    ))}
  </div>
);
```

---

## 4. LUXURY PLAY/PAUSE BUTTON

```tsx
<button
  onClick={togglePlayPause}
  className={`w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 active:from-purple-700 active:to-violet-700 text-white font-bold py-6 px-8 min-h-[56px] rounded-2xl transition-all duration-300 shadow-lg hover:scale-102 group relative overflow-hidden touch-manipulation ${
    isPlaying
      ? "shadow-purple-500/60 animate-glow"
      : "shadow-purple-500/30 hover:shadow-purple-500/50"
  }`}
  aria-label={isPlaying ? "Pause audio" : "Play audio"}
>
  {isPlaying && (
    <span className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-violet-400/20 animate-pulse-slow" />
  )}
  <span className="relative flex items-center justify-center gap-3 text-xl">
    {isPlaying ? (
      <>
        <Pause className="w-7 h-7" />
        Pause
      </>
    ) : (
      <>
        <Play className="w-7 h-7" />
        Play
      </>
    )}
  </span>
</button>
```

---

## 5. MULTI-RING SCROLL INDICATOR

```tsx
<span className="inline-flex items-center gap-1 ml-2 animate-bounce-gentle">
  <span className="relative inline-flex">
    {/* Outer glow ring */}
    <span className="absolute inline-flex h-full w-full rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-violet-400 opacity-75 animate-ping-slow"></span>
    {/* Inner glow ring */}
    <span className="absolute inline-flex h-full w-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 opacity-50 animate-pulse"></span>
    {/* Core icon */}
    <span className="relative inline-flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 shadow-2xl shadow-purple-500/50">
      <svg
        className="w-3 h-3 text-white animate-scroll-bounce"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
        />
      </svg>
    </span>
  </span>
  {/* Sparkle trail */}
  <span className="text-purple-400 text-xs animate-sparkle">✨</span>
</span>
```

---

## 6. PROGRESS BAR WITH DYNAMIC GRADIENT

```tsx
<div className="space-y-3">
  <div className="relative">
    <input
      type="range"
      min="0"
      max={duration || 0}
      value={currentTime}
      onChange={handleProgressChange}
      className="w-full h-3 bg-slate-800/50 rounded-full appearance-none cursor-pointer luxury-slider touch-manipulation"
      style={{
        background: `linear-gradient(to right, 
          rgb(147 51 234) 0%, 
          rgb(139 92 246) ${(currentTime / duration) * 100}%, 
          rgb(30 41 59 / 0.5) ${(currentTime / duration) * 100}%, 
          rgb(30 41 59 / 0.5) 100%)`,
        minHeight: "44px",
      }}
      aria-label="Audio progress"
    />
  </div>
  <div className="flex justify-between text-sm">
    <span className="text-purple-300 font-medium">
      {formatTime(currentTime)}
    </span>
    <span className="text-purple-300/50">{formatTime(duration)}</span>
  </div>
</div>
```

---

## 7. VOLUME & SPEED CONTROLS (2-COLUMN GRID)

```tsx
<div className="grid grid-cols-2 gap-4">
  {/* Volume Control */}
  <div className="bg-slate-800/30 rounded-xl p-4">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-purple-300">Volume</span>
      <button
        onClick={toggleMute}
        className="text-purple-400 hover:text-purple-300 transition-colors p-2 min-w-[44px] min-h-[44px]"
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>
    </div>
    <input
      type="range"
      min="0"
      max="100"
      value={volume}
      onChange={handleVolumeChange}
      className="w-full h-2 bg-slate-700/50 rounded-full appearance-none cursor-pointer"
      style={{ minHeight: "44px" }}
    />
    <div className="text-xs text-purple-300/50 mt-2 text-center">{volume}%</div>
  </div>

  {/* Speed Control */}
  <div className="bg-slate-800/30 rounded-xl p-4">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-purple-300">Speed</span>
      <span className="text-xl">{currentSpeed.icon}</span>
    </div>
    <select
      value={playbackRate}
      onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
      className="w-full bg-slate-700/50 text-purple-300 rounded-lg p-2 text-sm border border-purple-500/20 min-h-[44px]"
    >
      {speeds.map((speed) => (
        <option key={speed.value} value={speed.value}>
          {speed.icon} {speed.label} ({speed.value}x)
        </option>
      ))}
    </select>
  </div>
</div>
```

---

## 8. TOGGLE BUTTON PATTERN

```tsx
<button
  onClick={() => setFollowText(!followText)}
  className={`flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-lg transition-all duration-200 touch-manipulation ${
    followText
      ? "bg-purple-600/30 text-purple-300 border border-purple-500/50"
      : "bg-slate-800/30 text-slate-400 border border-slate-700/50"
  }`}
  aria-pressed={followText}
>
  <BookOpen className="w-4 h-4" />
  <span className="text-sm font-medium">Auto-Scroll</span>
</button>
```

---

## 9. AUDIO WAVE VISUALIZER

```tsx
<div className="h-32 flex items-center justify-center gap-2">
  {[...Array(24)].map((_, i) => (
    <div
      key={i}
      className={`w-1.5 rounded-full transition-all duration-300 ${
        isPlaying
          ? "bg-gradient-to-t from-purple-600 via-violet-500 to-blue-500"
          : "bg-slate-700"
      }`}
      style={{
        height: isPlaying
          ? `${30 + Math.sin((currentTime * 3 + i) * 0.5) * 50}px`
          : "20px",
        animationDelay: `${i * 0.05}s`,
      }}
    />
  ))}
</div>
```

---

## 10. SENTENCE HIGHLIGHTING (TEXT SYNC)

```tsx
{
  sentences.map((sentence, index) => (
    <span
      key={index}
      ref={(el) => {
        sentenceRefs.current[index] = el;
      }}
      onClick={() => isPremiumUser && seekToSentence(index)}
      className={`inline transition-all duration-500 ${
        index === activeSentenceIndex
          ? "relative bg-gradient-to-r from-purple-500/40 via-violet-500/40 to-blue-500/40 text-white font-semibold border-l-4 border-purple-400 pl-4 pr-2 py-2 rounded-r-lg shadow-lg shadow-purple-500/30 scale-105 animate-glow-text"
          : index < activeSentenceIndex
          ? "text-purple-300/40 line-through decoration-purple-500/30"
          : "text-purple-200/80 hover:text-purple-200 hover:bg-purple-500/10 rounded px-1"
      } ${isPremiumUser ? "cursor-pointer" : ""}`}
      style={{
        textShadow:
          index === activeSentenceIndex
            ? "0 0 20px rgba(168, 85, 247, 0.5)"
            : "none",
      }}
    >
      {sentence.text}{" "}
    </span>
  ));
}
```

---

## 11. PREMIUM BLUR OVERLAY

```tsx
{
  !isPremiumUser && (
    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm rounded-3xl z-10 flex items-center justify-center">
      <div className="text-center p-8">
        <Star className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-pulse" />
        <h3 className="text-2xl font-bold text-white mb-2">Premium Feature</h3>
        <p className="text-purple-300 mb-4">
          Unlock sentence-by-sentence highlighting & auto-scroll
        </p>
        <button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105">
          Upgrade to Premium
        </button>
      </div>
    </div>
  );
}
```

---

## 12. PAYWALL GATE MODAL (3-MINUTE GATE)

```tsx
{
  showPaywallGate && !isPremiumUser && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 p-8 sm:p-12 rounded-3xl border border-purple-500/30 max-w-md w-full shadow-2xl shadow-purple-500/20">
        <Star className="w-16 h-16 text-amber-400 mx-auto mb-6 animate-pulse" />

        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 text-center">
          Transform Reading Into Ritual
        </h3>

        <p className="text-purple-200/80 mb-2 text-center text-sm sm:text-base">
          You've experienced Dynasty Listen Mode for 3 minutes.
        </p>

        <p className="text-purple-300/90 mb-6 text-center font-medium">
          Unlock synced highlighting & full-length audio.
          <br />
          <span className="text-amber-400">
            {Math.floor((duration - 180) / 60)} more minutes await.
          </span>
        </p>

        {/* Benefits List */}
        <div className="bg-slate-800/50 rounded-2xl p-4 mb-6 border border-purple-500/20">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-white font-bold text-sm mb-1">
                Premium Features
              </h4>
              <ul className="text-purple-200/70 text-xs space-y-1">
                <li>• Full-length audio (no limits)</li>
                <li>• Sentence-by-sentence highlighting</li>
                <li>• Click-to-seek any sentence</li>
                <li>• Download for offline listening</li>
                <li>• 5 luxury AI voices</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={() => (window.location.href = "/checkout")}
          className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:via-orange-500 hover:to-amber-500 text-white font-bold py-4 px-8 min-h-[56px] rounded-2xl transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-102 touch-manipulation mb-3"
        >
          <span className="flex items-center justify-center gap-2">
            <Crown className="w-5 h-5" />
            Unlock Dynasty Listen Mode
          </span>
        </button>

        <button
          onClick={() => setShowPaywallGate(false)}
          className="w-full text-purple-300/70 hover:text-purple-200 transition-colors text-sm py-2 min-h-[44px]"
        >
          Not Now
        </button>
      </div>
    </div>
  );
}
```

---

## 13. LOADING STATE WITH PERSONALITY

```tsx
{
  isLoading ? (
    <button
      disabled
      className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold py-6 px-8 rounded-2xl opacity-50"
    >
      <span className="flex items-center justify-center gap-3">
        <Wind className="w-6 h-6 animate-spin" />
        Crafting Your Experience...
      </span>
    </button>
  ) : (
    <button className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold py-6 px-8 rounded-2xl">
      <span className="flex items-center justify-center gap-3">
        <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />
        Generate Audio
        <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </span>
    </button>
  );
}
```

---

## 14. STATS & METADATA PILLS

```tsx
<div className="flex items-center justify-between">
  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
    <Waves className="w-6 h-6 text-purple-400 animate-pulse" />
    Follow Along
    {isPlaying && (
      <span className="text-sm font-normal text-purple-400 animate-pulse">
        ● Live
      </span>
    )}
  </h2>
  <div className="flex items-center gap-4">
    <div className="flex items-center gap-2 text-sm text-purple-300/70">
      <Clock className="w-4 h-4" />
      <span>{sentences.length} sentences</span>
    </div>
    {activeSentenceIndex >= 0 && (
      <div className="text-sm text-purple-400 font-medium">
        {activeSentenceIndex + 1} / {sentences.length}
      </div>
    )}
  </div>
</div>
```

---

## 15. PREMIUM LOCK MESSAGE

```tsx
{
  !isPremiumUser && duration > 180 && (
    <div className="mt-3 text-center">
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg px-4 py-2 text-sm">
        <Star className="w-4 h-4 text-amber-400" />
        <span className="text-amber-300">
          🔒 Unlock full-length audio & premium voices —
          <button className="ml-1 underline font-semibold hover:text-amber-200 transition-colors">
            Go Premium
          </button>
        </span>
      </div>
    </div>
  );
}
```

---

## 16. FOOTER BRANDING

```tsx
<div className="mt-12 text-center">
  <div className="inline-flex items-center gap-2 text-sm text-purple-400/60">
    <Sparkles className="w-4 h-4" />
    <span>Powered by DynastyBuilt AI — Turning knowledge into ritual.</span>
    <Sparkles className="w-4 h-4" />
  </div>
</div>
```

---

## 🎯 APPLICATION CHECKLIST

When building new components, ensure they have:

- [ ] **Touch-friendly buttons** (min-h-[44px])
- [ ] **Hover states** with scale (1.02x - 1.1x)
- [ ] **Active states** with visual feedback
- [ ] **Loading states** with personality ("Crafting...", "Loading epic content...")
- [ ] **Empty states** with illustrations + CTAs
- [ ] **Smooth transitions** (duration-300)
- [ ] **Gradient backgrounds** (purple/violet/blue palette)
- [ ] **Glass morphism** (backdrop-blur, semi-transparent backgrounds)
- [ ] **Glow effects** on interactive elements
- [ ] **Premium indicators** (badges, locks, upgrade CTAs)
- [ ] **Mobile responsiveness** (grid-cols-1 sm:grid-cols-2 lg:grid-cols-X)
- [ ] **Accessibility** (aria-labels, aria-pressed, keyboard navigation)
- [ ] **Analytics tracking** (trackEvent calls for key actions)

---

**Every component should feel like Dynasty. Premium. Powerful. Personal.** ✨
