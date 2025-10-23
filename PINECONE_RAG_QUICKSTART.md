# 🚀 PINECONE RAG - QUICK START GUIDE

## ⚡ 3-MINUTE SETUP

### 1️⃣ **Add API Key** (30 seconds)

Create `.env.local` in root:

```bash
PINECONE_API_KEY=pcsk_2bEfDD_6MFHVBXm258jo9RGBW1HDfjTjLr7YqXaEgKPr1RXuQeFcQivj2UbSHE7kDLuqJE
```

### 2️⃣ **Setup Pinecone** (1 minute)

```bash
node scripts/setup-pinecone.js
```

### 3️⃣ **Start Dev Server** (30 seconds)

```bash
npm run dev
```

### 4️⃣ **Index Content** (1 minute)

1. Go to: `http://localhost:3000/admin/ai-indexing`
2. Click: **"Index Everything"**
3. Wait ~2 minutes

### 5️⃣ **Test It!** (10 seconds)

1. Open AI chat widget
2. Ask: "Tell me about [your course topic]"
3. Watch magic happen! ✨

---

## 📁 FILE STRUCTURE

```
src/
├── lib/ai/
│   ├── pinecone.ts      ← Vector database
│   ├── embeddings.ts    ← OpenAI embeddings
│   └── rag.ts           ← RAG system
│
└── app/
    ├── api/ai/
    │   ├── chat/route.ts        ← Enhanced with RAG
    │   └── index-content/route.ts  ← Indexing API
    │
    └── admin/ai-indexing/
        ├── page.tsx             ← Admin page
        └── AiIndexingClient.tsx ← UI component

scripts/
└── setup-pinecone.js    ← Setup tool
```

---

## 🎯 KEY ENDPOINTS

| Endpoint                | Method | Purpose                   |
| ----------------------- | ------ | ------------------------- |
| `/api/ai/chat`          | POST   | Chat with RAG-powered AI  |
| `/api/ai/index-content` | POST   | Index content to Pinecone |
| `/admin/ai-indexing`    | GET    | Admin dashboard           |

---

## 💡 USAGE EXAMPLES

### **JavaScript (Client-side)**

```javascript
// Chat with AI
const response = await fetch("/api/ai/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "Explain async/await",
    context: {
      page: "/courses/javascript",
      courseId: "course_123",
    },
  }),
});
```

### **Index Content**

```javascript
// Index all courses
await fetch("/api/ai/index-content", {
  method: "POST",
  body: JSON.stringify({ type: "courses" }),
});
```

### **TypeScript (RAG System)**

```typescript
import { searchRelevantContext } from "@/lib/ai/rag";

const contexts = await searchRelevantContext("JavaScript promises", {
  topK: 3,
  namespace: "courses",
});
```

---

## 📊 MONITORING

### **Check Index Stats**

```bash
node scripts/setup-pinecone.js
```

### **View in Pinecone Console**

https://app.pinecone.io → dynasty-academy index

---

## 🐛 TROUBLESHOOTING

| Issue                 | Solution                                  |
| --------------------- | ----------------------------------------- |
| "Index not found"     | Run `node scripts/setup-pinecone.js`      |
| "No relevant context" | Index content via `/admin/ai-indexing`    |
| "API key error"       | Check `.env.local` has `PINECONE_API_KEY` |
| "Build fails"         | Pinecone uses lazy init - should work!    |

---

## 🎉 SUCCESS METRICS

**You'll know it's working when:**

- ✅ AI references specific lessons
- ✅ AI cites page numbers
- ✅ AI knows course structure
- ✅ Responses are more accurate
- ✅ Students get instant help

---

## 🚀 WHAT'S NEXT?

1. **Test with real students** - Gather feedback
2. **Add analytics** - Track most searched topics
3. **Optimize prompts** - Improve response quality
4. **Multi-language** - Translate embeddings
5. **Voice support** - Speech-to-text integration

---

## 💎 THE POWER

**Traditional AI:**

```
Q: "How do I center a div?"
A: "Use flexbox or grid..." (generic)
```

**Dynasty Nexus RAG:**

```
Q: "How do I center a div?"
A: "In your CSS Fundamentals course, Lesson 5 covers this!

[Shows YOUR lesson content]

This uses the flexbox method from Lesson 4.
Try the CodePen example from page 12!"
```

**10x better!** 🔥

---

## 📞 SUPPORT

- **Full docs**: `PINECONE_RAG_COMPLETE.md`
- **Summary**: `PINECONE_RAG_SUMMARY.md`
- **This guide**: `PINECONE_RAG_QUICKSTART.md`

---

**Time to complete setup**: ~3 minutes
**Time to see results**: Instant
**Student satisfaction**: 📈 Through the roof!

**Let's go!** 🚀⚔️💎
