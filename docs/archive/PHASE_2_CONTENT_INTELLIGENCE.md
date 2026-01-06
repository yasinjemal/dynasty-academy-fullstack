# 🧠 Phase 2: Content Intelligence Engine

**Status**: 🚀 Starting
**Goal**: Use AI to automatically generate educational content from books

---

## 📋 Overview

Transform Dynasty Academy from a content delivery platform to an **intelligent content creation platform** that uses AI to automatically generate courses, lessons, and quizzes from your book library.

---

## 🎯 Features to Build

### 1. **AI Course Generator** 📚➡️🎓

**What**: Automatically create complete course structures from books
**How**:

- Analyze book content (using RAG when available)
- Generate course outline with modules & lessons
- Map book chapters to course structure
- Create learning objectives for each lesson

**Example**:

```
Book: "Financial Management" (100 pages)
↓
Generated Course:
  Module 1: Introduction to Finance (Lessons 1-3)
  Module 2: Financial Statements (Lessons 4-7)
  Module 3: Investment Analysis (Lessons 8-12)
  Module 4: Risk Management (Lessons 13-15)
```

---

### 2. **AI Lesson Content Generator** 📝

**What**: Create rich lesson content from book chapters
**How**:

- Extract key concepts from book pages
- Generate explanations, examples, analogies
- Create summaries and key takeaways
- Add discussion questions

**Example**:

```
Book Chapter 3: "Balance Sheets"
↓
Generated Lesson:
  - Introduction (200 words)
  - Key Concepts (5 points with explanations)
  - Real-world Examples (3 scenarios)
  - Practice Exercise
  - Summary & Next Steps
```

---

### 3. **AI Quiz Generator** ❓

**What**: Auto-generate quizzes from lessons/books
**How**:

- Multiple choice questions (4 options)
- True/False questions
- Short answer questions
- Essay prompts
- Difficulty levels (Easy/Medium/Hard)

**Example**:

```
Book: "Banking in Roman World", Chapter 2
↓
Generated Quiz (10 questions):
  1. MC: What was the primary currency in Rome? (Medium)
  2. TF: Roman banks charged interest on loans. (Easy)
  3. SA: Explain the role of argentarii. (Hard)
  ...
```

---

### 4. **Learning Path Recommender** 🗺️

**What**: AI suggests personalized learning paths
**How**:

- Analyze user's completed courses
- Identify knowledge gaps
- Recommend next courses/books
- Create custom study plans

**Example**:

```
User completed: "Financial Management"
AI analyzes: Strong in basics, weak in advanced topics
Recommends:
  1. "Investment Analysis" (fills gap)
  2. "Risk Management" (natural progression)
  3. "The Moorad Choudhry Anthology" (advanced)
```

---

## 🏗️ Technical Implementation

### Architecture

```
Book Content → RAG System → GPT-4 → Generated Content → Review → Publish
```

### API Endpoints to Build

1. **POST /api/admin/ai/generate-course**

   - Input: `{ bookId: string }`
   - Output: Course outline with modules & lessons
   - Cost: ~$0.10 per book

2. **POST /api/admin/ai/generate-lesson**

   - Input: `{ bookId: string, chapterNumber: number }`
   - Output: Full lesson content
   - Cost: ~$0.05 per lesson

3. **POST /api/admin/ai/generate-quiz**

   - Input: `{ lessonId: string, questionCount: number, difficulty: string }`
   - Output: Quiz with questions & answers
   - Cost: ~$0.02 per 10 questions

4. **POST /api/ai/recommend-path**
   - Input: `{ userId: string }`
   - Output: Recommended courses/books
   - Cost: ~$0.01 per recommendation

### Database Schema

```prisma
// AI-generated content tracking
model GeneratedContent {
  id          String   @id @default(cuid())
  type        String   // 'course' | 'lesson' | 'quiz'
  sourceType  String   // 'book' | 'manual'
  sourceId    String   // bookId

  content     Json     // The generated content
  prompt      String   @db.Text // Prompt used
  model       String   // 'gpt-4' etc
  tokensUsed  Int
  cost        Float

  status      String   // 'draft' | 'review' | 'published'
  reviewedBy  String?
  publishedAt DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 🎨 Admin Dashboard Features

### Content Intelligence Panel (`/admin/content-intelligence`)

**Tab 1: Generate Course**

- Select book from dropdown
- Click "Generate Course Outline"
- Preview generated outline
- Edit if needed
- Approve & Publish

**Tab 2: Generate Lessons**

- Select course
- Choose chapters to convert
- Batch generate lessons
- Review quality
- Publish approved lessons

**Tab 3: Generate Quizzes**

- Select lesson
- Configure: question count, difficulty, types
- Generate quiz
- Review questions
- Publish to course

**Tab 4: Analytics**

- Total content generated
- Cost tracking
- Quality metrics
- Approval rate
- Time saved estimate

---

## 💰 Cost Estimate

Assuming GPT-4 at $0.03/1K tokens (input) + $0.06/1K tokens (output):

| Task                | Tokens | Cost per Item  | 100 Items |
| ------------------- | ------ | -------------- | --------- |
| Course Outline      | ~5K    | $0.15          | $15       |
| Lesson Content      | ~3K    | $0.10          | $10       |
| Quiz (10 questions) | ~2K    | $0.08          | $8        |
| **Total**           | -      | **$0.33/book** | **$33**   |

**ROI**: Hiring a course creator: $500-1000/course → **95-97% cost reduction**

---

## 📊 Quality Assurance

### AI Prompts Strategy

1. **Structured Prompts**: Use JSON schemas for consistent output
2. **Context Injection**: Include book content via RAG
3. **Examples**: Few-shot learning for better results
4. **Temperature**: 0.7 for creative content, 0.3 for quizzes

### Review Process

1. AI generates content → **Draft**
2. Admin reviews → **In Review**
3. Admin approves → **Published**
4. Users see only published content

### Quality Metrics

- Relevance score (does it match book content?)
- Completeness (all sections filled?)
- Accuracy (fact-checked against source?)
- Engagement (user ratings after use)

---

## 🚀 Implementation Plan

### Phase 2a: Course Generator (Days 1-2)

- [ ] Create API endpoint
- [ ] Build GPT-4 prompt for course outlines
- [ ] Test with 2-3 sample books
- [ ] Create admin UI for generation
- [ ] Add review workflow

### Phase 2b: Lesson Generator (Days 3-4)

- [ ] Create API endpoint
- [ ] Build prompts for lesson content
- [ ] Integrate with RAG for context
- [ ] Create batch generation UI
- [ ] Add editing interface

### Phase 2c: Quiz Generator (Days 5-6)

- [ ] Create API endpoint
- [ ] Build prompts for different question types
- [ ] Create quiz preview UI
- [ ] Add question editing
- [ ] Integrate with course system

### Phase 2d: Recommendations (Day 7)

- [ ] Build user analysis logic
- [ ] Create recommendation algorithm
- [ ] Build API endpoint
- [ ] Add UI to student dashboard
- [ ] Track recommendation success

### Phase 2e: Analytics Dashboard (Day 8)

- [ ] Build content intelligence dashboard
- [ ] Add cost tracking
- [ ] Add quality metrics
- [ ] Create approval workflow UI
- [ ] Add export functionality

---

## 🎯 Success Metrics

- **Efficiency**: Generate 1 course in 5 minutes (vs 5 hours manual)
- **Cost**: <$0.50 per complete course
- **Quality**: >80% approval rate on first generation
- **Scale**: Support generating 100+ courses/month
- **Adoption**: 50% of new courses use AI generation

---

## 🔮 Future Enhancements

- **Audio Narration**: AI voice-over for lessons
- **Video Generation**: AI creates explainer videos
- **Interactive Simulations**: Generate practice scenarios
- **Adaptive Content**: Difficulty adjusts to user level
- **Multi-language**: Generate content in 10+ languages

---

## 🎬 Ready to Build?

**What would you like to start with?**

1. **AI Course Generator** - The foundation (most impactful)
2. **AI Quiz Generator** - Quick win (easiest to implement)
3. **Review the entire plan first** - Adjust strategy
4. **Something else** - You choose!

---

**Phase 1 Status**: ✅ Complete (embeddings pending)
**Phase 2 Status**: 🚀 Ready to start
**Current State**: 5 books ready, admin access set, RAG infrastructure ready
