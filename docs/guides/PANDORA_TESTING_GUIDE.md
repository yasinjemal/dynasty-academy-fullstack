# 🧪 PANDORA'S BOX - COMPLETE TESTING GUIDE

## 🎯 TESTING CHECKLIST (All 10 Features)

### ✅ **1. Emotional Intelligence AI**

- [ ] Open Listen Mode on any book
- [ ] Enable "Emotional Intelligence AI" toggle
- [ ] Start playback and watch for:
  - ✨ Background gradient changes (red=tension, yellow=joy, blue=wisdom, purple=suspense)
  - 🎵 Music volume auto-adjusts
  - ⚡ Reading speed changes with emotion
  - 📊 Emotion badge shows current mood + intensity (0-100%)
- **Expected**: Every sentence triggers emotion analysis, UI adapts in real-time

### ✅ **2. Smart Bookmarks with AI**

- [ ] Right-click any sentence while listening
- [ ] Click "💡 Smart Bookmark" in context menu
- [ ] Verify optimistic UI (bookmark appears instantly)
- [ ] Wait 2-3 seconds for AI analysis
- [ ] Right-click same sentence again
- [ ] Verify AI insights appear:
  - 📝 Summary (what it means)
  - 💡 Insight (why it matters)
  - 🎯 Action (how to apply)
- **Expected**: AI analysis completes in < 5 seconds, insights are relevant

### ✅ **3. AI Study Buddy (Context-Aware Chat)**

- [ ] Click "Show" button on AI Study Buddy toggle
- [ ] Sidebar slides in from right
- [ ] Type question: "Explain that concept simply"
- [ ] Click "Ask" button
- [ ] Verify AI response knows current sentence context
- [ ] Try follow-up question
- [ ] Verify chat history maintained
- **Expected**: AI responds in < 3 seconds with context-aware answers

### ✅ **4. Voice Cloning (YOUR Voice!)**

- [ ] Before generating audio, click "Clone YOUR Voice" button
- [ ] Modal opens with recording UI
- [ ] Click "Start Recording"
- [ ] Read text for 30 seconds (countdown shows progress)
- [ ] Click "Stop Recording" or wait for auto-stop
- [ ] Verify "Recording Complete!" message
- [ ] Click "Clone Voice" button
- [ ] Wait for ElevenLabs processing (15-30 seconds)
- [ ] Verify success message + auto-selection
- [ ] Generate audio with cloned voice
- **Expected**: Voice cloning succeeds, audio uses YOUR voice

### ✅ **5. Multi-Voice Character Dialogues**

- [ ] Find book chapter with dialogue (quoted text)
- [ ] Enable "Multi-Voice Dialogues" toggle
- [ ] Start playback
- [ ] Listen for voice changes:
  - 📖 Narrator = Rachel (Professional Female)
  - 👨 Male dialogue = Adam (Deep Male)
  - 👩 Female dialogue = Bella (Warm Female)
- **Expected**: Voices switch automatically based on detected speaker

### ✅ **6. 3D Spatial Audio (Headphone Magic!)**

- [ ] Put on **HEADPHONES** (critical!)
- [ ] Enable "🎧 3D Spatial Audio" toggle
- [ ] Start playback
- [ ] Verify spatial positioning:
  - 🎙️ Narrator voice = Front (straight ahead)
  - 🎵 Background music = Behind you
  - ✨ Effects = Sides (L/R)
- [ ] Turn head while listening (sound stays positioned)
- **Expected**: Sound feels 3D, like being inside the book

### ✅ **7. Learning Mode with Quizzes**

- [ ] Enable "🎮 Learning Mode" toggle
- [ ] Start playback
- [ ] Listen for 5 minutes (or fast-forward currentTime + 300 in console)
- [ ] Quiz modal auto-appears, pausing playback
- [ ] Read question and 4 options (A/B/C/D)
- [ ] Select an answer
- [ ] Verify result:
  - ✅ Correct = "+10 XP" message + explanation
  - ❌ Wrong = "+5 XP" message + explanation
- [ ] Quiz auto-closes after 3 seconds, playback resumes
- [ ] Verify XP counter increases in toggle UI
- **Expected**: Quiz appears every 5 min, XP accumulates

### ✅ **8. Social Listening Rooms**

- [ ] Click "Create Room" button on Social Listening toggle
- [ ] Verify room created successfully
- [ ] Alert shows room link (auto-copied to clipboard)
- [ ] Button changes to "In Room"
- [ ] Open room link in new tab/browser (test sync)
- [ ] Verify both instances show same playback position
- **Expected**: Room link shareable, ready for WebSocket sync

### ✅ **9. Biometric Focus Detection**

- [ ] Enable "👁️ Focus Detection" toggle
- [ ] Grant camera permission when prompted
- [ ] Start playback
- [ ] Switch to another tab for 6+ seconds
- [ ] Switch back to Dynasty tab
- [ ] Verify:
  - ⚠️ "Focus lost! Rewinding in 5s..." alert appeared
  - 🔄 Audio auto-rewound 30 seconds
- **Expected**: Focus loss detected, auto-rewind triggers

---

## 🐛 KNOWN ISSUES TO FIX

1. **TypeScript Error** (Line 228):

   - `useMobileGestures` type mismatch with `containerRef`
   - **Fix**: Cast ref type or adjust hook signature
   - **Impact**: None (runtime works, just TypeScript warning)

2. **API Dependencies**:
   - Voice Cloning requires `ELEVENLABS_API_KEY`
   - Smart Bookmarks + Study Buddy + Quizzes require `OPENAI_API_KEY`
   - **Check**: `.env` file has both keys set

---

## ✅ COMPLETION CRITERIA

**READY TO LAUNCH when:**

- [ ] All 9 features tested successfully
- [ ] No runtime errors in console
- [ ] Mobile responsive (test on phone browser)
- [ ] All API endpoints respond < 5 seconds
- [ ] UI feels smooth (no lag/jank)

---

## 🎬 DEMO VIDEO SCRIPT (60 seconds)

**0-5s**: "We built the world's first AI-powered audiobook player..."
**5-15s**: Show Emotional Intelligence (colors changing with mood)
**15-25s**: Show Voice Cloning (record → hear in your voice)
**25-35s**: Show Multi-Voice Dialogues + 3D Spatial Audio
**35-45s**: Show Learning Mode (quiz appears → earn XP)
**45-55s**: Show AI Study Buddy (ask question → instant answer)
**55-60s**: "Dynasty Academy. The future of reading. $9.99/month."

### ✅ **10. Spotify Integration**

- [ ] Click "🎵 Spotify Integration" in atmosphere controls
- [ ] Click "Connect" button
- [ ] Authorize Dynasty Academy in popup
- [ ] Verify popup closes and playlists load
- [ ] See grid of playlists with cover images
- [ ] Click a playlist to select
- [ ] Verify music starts playing
- [ ] Play narrator audio
- [ ] Verify Spotify volume drops to 15%
- [ ] Pause narrator
- [ ] Verify Spotify volume rises to 30%
- [ ] Click "Browse" to switch playlists
- [ ] Click "Disconnect" to test logout
- **Expected**: Seamless Spotify playback with intelligent auto-ducking

---

## 🚀 LAUNCH CHECKLIST

- [ ] All features tested ✅
- [ ] API keys configured ✅
- [ ] Database migrations run ✅
- [ ] Spotify credentials added ✅
- [ ] Error tracking setup (Sentry/LogRocket)
- [ ] Analytics configured (Mixpanel/Amplitude)
- [ ] Demo video recorded
- [ ] Landing page updated with features
- [ ] Social media posts scheduled
- [ ] Early access invite list ready

**LET'S GO VIRAL! 🔥**
