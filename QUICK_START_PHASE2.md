# 🚀 QUICK START: LISTENMODE PHASE 2

## **5-Minute Setup Guide**

### **Step 1: Install Dependencies**
```powershell
npm install sonner
```

### **Step 2: Run Database Migration**
```powershell
npx prisma migrate deploy
npx prisma generate
```

### **Step 3: Add Toaster to Layout**

Edit `src/app/layout.tsx`:

```typescript
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
```

### **Step 4: Test Everything**

1. **Open a book chapter**
2. **Click "Dynasty Listen Mode"**
3. **Start listening**

You should see:
- ✅ Progress auto-saves every 10 seconds
- ✅ Streak badge appears (if new streak)
- ✅ Mobile gesture hints show up
- ✅ Achievement toasts when unlocked

### **Step 5: Test Multi-Device Sync**

1. Start listening on desktop
2. Open same chapter on mobile
3. Should resume at exact position

### **Step 6: Unlock Achievements**

Try these to test:
- Listen at 10 PM → **Night Owl** (25 pts)
- Listen before 6 AM → **Early Bird** (25 pts)
- Listen at 2x speed for 30 min → **Speed Demon** (50 pts)
- Highlight 10 sentences → **Highlighter** (30 pts)
- Listen for 60+ minutes → **Marathon** (100 pts)

---

## **Troubleshooting**

### **Achievements not showing?**
Check browser console for API errors. Verify Prisma migration ran successfully.

### **Cloud sync not working?**
1. Check if user is logged in
2. Verify `isPremiumUser` is true
3. Check Network tab for API calls

### **Mobile gestures not working?**
Enable DeviceMotionEvent permissions in mobile browser settings.

### **Streak not updating?**
Check that `listening_streaks` table exists in database.

---

## **API Endpoints**

All working and ready to use:

- `POST /api/listening/progress` - Save progress
- `GET /api/listening/progress` - Load progress
- `GET /api/listening/streaks` - Get streak data
- `GET /api/achievements` - List achievements
- `POST /api/achievements` - Unlock achievement
- `POST /api/listening/highlights` - Save highlight
- `GET /api/listening/highlights` - Load highlights
- `DELETE /api/listening/highlights` - Remove highlight
- `POST /api/listening/analytics` - Track session
- `GET /api/listening/analytics/dashboard` - Get insights
- `GET /api/listening/leaderboards` - Get rankings

---

## **Features Checklist**

After setup, verify these work:

- [ ] Audio plays smoothly
- [ ] Progress saves automatically
- [ ] Resume works on device refresh
- [ ] Streak counter shows in header
- [ ] Achievement toasts appear
- [ ] Mobile swipe gestures work
- [ ] Highlights sync across devices
- [ ] Analytics dashboard shows data
- [ ] Leaderboards display rankings

---

## **Next Steps**

1. **Customize Achievement Icons**
   Edit `prisma/migrations/add_listenmode_features/migration.sql`

2. **Add Analytics Dashboard Page**
   Create `/dashboard/analytics` route

3. **Build Leaderboards UI**
   Create `/leaderboards` page

4. **Enable Social Features**
   Add friend system to compete on leaderboards

---

**That's it! You're ready to revolutionize audio listening!** 🎧✨
