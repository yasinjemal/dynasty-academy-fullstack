# 🧪 DYNASTY AI COACH - TESTING GUIDE

## 🎯 **OBJECTIVE:**

Verify that the AI Coach system works perfectly before building additional features.

---

## ✅ **PRE-TESTING CHECKLIST:**

- [x] Dev server running on http://localhost:3000
- [x] OpenAI API key configured in `.env`
- [x] Database synced with AiConversation & AiInsight models
- [x] All TypeScript errors fixed
- [x] Dependencies installed (react-markdown, react-syntax-highlighter)

---

## 🧪 **TEST SUITE - 6 CRITICAL TESTS:**

### **TEST 1: Login & Widget Visibility** 🟢

**Steps:**

1. Open browser → http://localhost:3000
2. Log in with your account
3. Look at bottom-right corner

**Expected Results:**

- ✅ Floating chat bubble visible
- ✅ Purple-pink gradient background
- ✅ Sparkle (⚡) indicator in top-right of bubble
- ✅ Glow effect on hover
- ✅ Scale animation on hover
- ✅ Tooltip appears: "Ask Dynasty AI Coach"

**If Failed:**

- Check browser console for errors
- Verify `AiChatWidget` is imported in `layout.tsx`
- Verify session exists (user is logged in)

---

### **TEST 2: Open Chat Window** 🟢

**Steps:**

1. Click the floating bubble
2. Wait for animation

**Expected Results:**

- ✅ Chat window expands (w-96, h-600px)
- ✅ Header shows "Dynasty AI Coach" with sparkle icon
- ✅ Online status indicator (green dot)
- ✅ Welcome message appears:
  - Robot emoji 🤖
  - "Hi! I'm your AI Coach 👋"
  - Description text
- ✅ 4 Quick action buttons visible:
  - 📚 "Help me understand this lesson"
  - ✍️ "Quiz me on this topic"
  - 💡 "Explain this concept simply"
  - 🎯 "Give me study tips"
- ✅ Input field at bottom
- ✅ Send button (purple gradient)

**If Failed:**

- Check console for React errors
- Verify Framer Motion animations
- Check z-index conflicts with other elements

---

### **TEST 3: Send Message & Streaming Response** 🟢

**Steps:**

1. Type in input field: "Hello! Can you help me learn Python?"
2. Press Enter (or click Send)
3. Watch the response

**Expected Results:**

- ✅ Your message appears immediately (right side, purple bubble)
- ✅ "Thinking..." indicator appears briefly
- ✅ AI response streams in character-by-character (left side, gray bubble)
- ✅ Typing cursor visible during streaming (blinking purple line)
- ✅ Response is friendly and encouraging
- ✅ Response uses markdown formatting
- ✅ Auto-scroll to bottom
- ✅ Send button disabled during streaming
- ✅ Full response completes in 2-5 seconds

**Expected Response Style:**

```
Sure, I'd love to help you learn Python! 🚀

Python is a fantastic programming language for beginners because...
[friendly, encouraging tone with examples]

What specific aspect of Python would you like to start with?
```

**If Failed:**

- Check browser Network tab for `/api/ai/chat` request
- Verify OpenAI API key is valid
- Check server console for API errors
- Verify streaming is working (should see `text/event-stream`)

---

### **TEST 4: Context Awareness** 🟢

**Steps:**

1. Navigate to any course page (e.g., `/courses/[course-id]`)
2. Open AI Chat
3. Ask: "What am I learning right now?"
4. Wait for response

**Expected Results:**

- ✅ AI mentions it knows you're on a course page
- ✅ AI references the context (even if it doesn't know the exact course name yet - RAG not implemented)
- ✅ Response shows awareness of Dynasty Academy platform
- ✅ Conversation context saved in database with `courseId`

**Example Response:**

```
I can see you're currently on a course page! 📚

While I don't have the specific course details yet, I'm here to help you with any questions about what you're learning...
```

**Then try:**

1. Navigate to `/books/[book-id]` page
2. Ask: "What book am I reading?"
3. Verify AI knows you're on a book page

**If Failed:**

- Check `getContext()` function in `AiChatWidget.tsx`
- Verify pathname detection works
- Check that context is sent to API
- Verify API receives context in request body

---

### **TEST 5: Rate Limiting** 🟡

**Steps:**

1. Open chat
2. Send 10 messages rapidly (spam "test 1", "test 2", etc.)
3. Try to send 11th message within 1 minute

**Expected Results:**

- ✅ First 10 messages go through successfully
- ✅ 11th message gets error response
- ✅ Error message displayed: "Rate limit exceeded. Please wait a moment..."
- ✅ `retryAfter: 60` in response
- ✅ Can send again after 60 seconds

**If Failed:**

- Check rate limiting logic in `/api/ai/chat/route.ts`
- Verify `updatedAt` timestamp check
- Check if `oneMinuteAgo` calculation is correct

---

### **TEST 6: Database Persistence** 🟢

**Steps:**

1. After sending 2-3 test messages
2. Open new terminal
3. Run: `npx prisma studio`
4. Browser will open to http://localhost:5555
5. Click on "AiConversation" model

**Expected Results:**

- ✅ At least 1 conversation record exists
- ✅ `userId` matches your user ID
- ✅ `messages` field contains JSON array with your messages
- ✅ Each message has: `role`, `content`, `timestamp`
- ✅ `context` field shows page information
- ✅ `messageCount` is correct (2x messages sent, since user + assistant)
- ✅ `tokensUsed` > 0
- ✅ `cost` > 0 (in USD)
- ✅ `sentiment` is a number between -1 and 1
- ✅ `createdAt` and `updatedAt` timestamps

**Sample Data:**

```json
{
  "id": "clxxx...",
  "userId": "user-id",
  "messages": [
    {
      "role": "user",
      "content": "Hello! Can you help me learn?",
      "timestamp": "2025-10-20T10:30:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Of course! I'd be happy to help you learn...",
      "timestamp": "2025-10-20T10:30:03.000Z"
    }
  ],
  "messageCount": 2,
  "context": {
    "page": "/dashboard",
    "courseId": null,
    "lessonId": null,
    "bookId": null
  },
  "status": "ACTIVE",
  "resolved": false,
  "sentiment": 0.3,
  "tokensUsed": 120,
  "cost": 0.0036,
  "responseTime": 2.4
}
```

**If Failed:**

- Check Prisma Client is up to date
- Verify database connection
- Check API logs for save errors
- Verify Prisma schema matches database

---

## 🎨 **BONUS TESTS - UI/UX Polish:**

### **TEST 7: Markdown Rendering** 📝

**Steps:**

1. Ask AI: "Show me a Python code example"
2. Wait for response

**Expected:**

- ✅ Code blocks render with syntax highlighting
- ✅ Inline code has `monospace` font
- ✅ Bold, italic, lists render correctly
- ✅ Links are clickable (if AI includes any)

---

### **TEST 8: Long Conversation** 💬

**Steps:**

1. Send 5-6 messages back and forth
2. Scroll through conversation

**Expected:**

- ✅ All messages visible
- ✅ Scroll works smoothly
- ✅ Auto-scrolls to latest message
- ✅ Old messages don't overflow
- ✅ Chat window doesn't break layout

---

### **TEST 9: Close & Reopen** 🔄

**Steps:**

1. Have a conversation (3 messages)
2. Click X to close chat
3. Reopen chat bubble

**Expected:**

- ✅ Previous conversation still visible (from state)
- ✅ Can continue conversation
- ✅ Conversation ID persists
- ✅ No duplicate messages

**Note:** Full history across sessions requires GET endpoint test (future feature)

---

### **TEST 10: Mobile Responsive** 📱

**Steps:**

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone 12 Pro or similar
4. Test chat widget

**Expected:**

- ✅ Chat bubble visible on mobile
- ✅ Chat window adjusts to screen width
- ✅ Text is readable
- ✅ Buttons are touch-friendly
- ✅ No horizontal scroll
- ✅ Keyboard doesn't cover input

---

## 📊 **PERFORMANCE BENCHMARKS:**

After testing, verify these metrics:

| Metric                       | Target        | Status |
| ---------------------------- | ------------- | ------ |
| **First Response Time**      | < 3 seconds   | ⏱️     |
| **Streaming Start**          | < 1 second    | ⏱️     |
| **Character Stream Rate**    | ~50 chars/sec | ⏱️     |
| **API Response (no stream)** | < 2 seconds   | ⏱️     |
| **Database Save Time**       | < 100ms       | ⏱️     |
| **Cost Per Message**         | ~$0.003-0.01  | ⏱️     |
| **Tokens Per Exchange**      | 100-300       | ⏱️     |
| **UI Animation FPS**         | 60 fps        | ⏱️     |

---

## 🐛 **COMMON ISSUES & FIXES:**

### **Issue 1: Chat bubble not appearing**

**Cause:** Session not loaded or AiChatWidget not rendered  
**Fix:**

- Verify user is logged in
- Check `Providers` wraps `AiChatWidget` in layout.tsx
- Look for console errors

### **Issue 2: Streaming doesn't work**

**Cause:** OpenAI API key invalid or network issues  
**Fix:**

- Verify `.env` has correct `OPENAI_API_KEY`
- Check browser Network tab for errors
- Test API key with: `curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_KEY"`

### **Issue 3: Rate limit not working**

**Cause:** Time calculation bug  
**Fix:**

- Check server timezone
- Verify `Date.now() - 60 * 1000` calculation
- Add console.log to see message count

### **Issue 4: Context not detected**

**Cause:** Pathname parsing error  
**Fix:**

- Check `usePathname()` returns correct value
- Verify URL structure matches split logic
- Test with: `console.log('pathname:', pathname)`

### **Issue 5: Database not saving**

**Cause:** Prisma Client not updated or connection error  
**Fix:**

- Run `npx prisma generate`
- Check DATABASE_URL in .env
- Verify Supabase connection
- Check server logs for Prisma errors

---

## ✅ **SUCCESS CRITERIA:**

Before moving to next phase, ALL must pass:

- [x] Chat widget visible and beautiful ✅
- [ ] Can send messages successfully ⏳
- [ ] Streaming responses work ⏳
- [ ] Context awareness functional ⏳
- [ ] Rate limiting prevents spam ⏳
- [ ] Database saves conversations ⏳
- [ ] Markdown renders correctly ⏳
- [ ] Mobile responsive ⏳
- [ ] No console errors ⏳
- [ ] Performance meets benchmarks ⏳

---

## 🎬 **NEXT STEPS AFTER TESTING:**

Once all tests pass:

1. ✅ **Document Issues:** Note any bugs found
2. ✅ **Measure Metrics:** Record actual performance numbers
3. ✅ **Gather Feedback:** Share with 2-3 test users
4. ✅ **Optimize Prompt:** Adjust system prompt based on responses
5. ✅ **Move to Phase 1b:** Build RAG system for smarter answers
6. ✅ **Or Phase 2:** Start Content Intelligence Engine

---

## 📝 **TEST RESULTS LOG:**

Use this template to record your results:

```markdown
## Test Session: [Date/Time]

### TEST 1: Login & Widget Visibility

- Status: ✅ PASS / ❌ FAIL
- Notes:

### TEST 2: Open Chat Window

- Status: ✅ PASS / ❌ FAIL
- Notes:

### TEST 3: Send Message & Streaming

- Status: ✅ PASS / ❌ FAIL
- Response Time: \_\_\_ seconds
- Notes:

### TEST 4: Context Awareness

- Status: ✅ PASS / ❌ FAIL
- Notes:

### TEST 5: Rate Limiting

- Status: ✅ PASS / ❌ FAIL
- Notes:

### TEST 6: Database Persistence

- Status: ✅ PASS / ❌ FAIL
- Records Created: \_\_\_
- Notes:

### Performance Metrics:

- Avg Response Time: \_\_\_s
- Avg Cost Per Message: $\_\_\_
- Avg Tokens: \_\_\_

### Issues Found:

1.
2.
3.

### Overall Assessment:

- Ready for Production: YES / NO
- Next Steps:
```

---

## 🚀 **LET'S START TESTING!**

**Open your browser → http://localhost:3000 → Log in → Let's test! 🎯**

Report back with results and we'll iterate! 💎⚔️
