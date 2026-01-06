# 🚀 QUICK START - Spotify Integration

## ✅ Credentials Added!

Your `.env.local` file is configured with:

- ✅ Client ID: `cac311314c2e4267b168d336a1e3eb67`
- ✅ Client Secret: `62e66c9ae54f4e5e8a90de2b74e322cd`
- ✅ App URL: `http://localhost:3003` (dev server running on port 3003)

---

## ⚠️ IMPORTANT: Update Redirect URI

Your dev server is running on **port 3003**, so you need to update the Spotify Developer Dashboard:

1. Go to: https://developer.spotify.com/dashboard/cac311314c2e4267b168d336a1e3eb67/settings
2. Find **"Redirect URIs"** section
3. Add this URI: `http://localhost:3003/api/spotify/callback`
4. Click **"Save"**

---

## 🧪 Test Spotify Integration

1. Open: http://localhost:3003
2. Navigate to any book
3. Click **"Listen Mode"**
4. In the atmosphere controls, find **"🎵 Spotify Integration"**
5. Click **"Connect"** button
6. Authorize Dynasty Academy in the popup
7. Browse your playlists
8. Select a playlist → Music plays!
9. Play narrator → Music ducks to 15%
10. Pause narrator → Music rises to 30%

---

## 🎯 What to Test

### Feature #10: Spotify Integration

- [ ] OAuth popup opens
- [ ] Successfully authorize
- [ ] Popup closes automatically
- [ ] Playlists load with cover images
- [ ] Click playlist → Music starts
- [ ] Play narrator → Spotify volume drops
- [ ] Pause narrator → Spotify volume rises
- [ ] Disconnect works
- [ ] Reconnect works

---

## 🔥 All 10 Pandora Features Ready!

With Spotify credentials configured, you can now test:

1. 🧠 **Emotional Intelligence AI** - Dynamic gradients
2. 💡 **Smart Bookmarks** - AI insights
3. 🤖 **AI Study Buddy** - Context chat
4. 🎙️ **Voice Cloning** - YOUR voice
5. 🎭 **Multi-Voice** - Character dialogues
6. 🎧 **3D Spatial Audio** - HRTF positioning
7. 🎮 **Learning Mode** - Gamified quizzes
8. 🎵 **Spotify Integration** - YOUR music ⬅️ NEW!
9. 👥 **Social Rooms** - Listen together
10. 👁️ **Focus Detection** - Auto-rewind

---

## 🚨 Troubleshooting

### "Redirect URI mismatch"

- Make sure you added `http://localhost:3003/api/spotify/callback` exactly
- Check for typos (it's port 3003, not 3000)
- Save the settings in Spotify Dashboard

### "Popup blocked"

- Allow popups for localhost:3003
- Check browser popup blocker settings

### "No playlists showing"

- Make sure you have a Spotify Premium account
- Check browser console for errors
- Verify access token was received

---

## 🎉 Next Steps

After testing Spotify:

1. Test all 10 features end-to-end
2. Record demo video
3. Launch to first users
4. Go viral! 🚀

**Server running at: http://localhost:3003**
