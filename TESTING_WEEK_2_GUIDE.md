# 🧪 Testing Week 2: Concept Extraction System

**Live Testing Guide - October 23, 2025**

---

## 🎯 What We're Testing Today

1. ✅ **Admin Dashboard Access** - `/admin/concepts`
2. ✅ **Concept Extraction** - GPT-4 powered extraction from courses
3. ✅ **Similarity Testing** - 5 accuracy test suites
4. ✅ **Performance Validation** - <50ms search target

---

## 📋 Pre-Test Checklist

### Environment Setup ✅

- [x] Dev server running: http://localhost:3000
- [x] OPENAI_API_KEY configured in .env
- [x] Database connected (Supabase PostgreSQL)
- [x] pgvector extension enabled
- [x] HNSW indexes created

### Files Ready ✅

- [x] `src/lib/ai/concept-extractor.ts` (550 lines)
- [x] `src/lib/ai/similarity-tester.ts` (650 lines)
- [x] `src/app/(admin)/admin/concepts/page.tsx` (850 lines)
- [x] `/api/ai/concepts/extract` endpoint
- [x] `/api/ai/concepts/test` endpoint

---

## 🚀 Test Procedure

### Step 1: Access Dashboard

```
URL: http://localhost:3000/admin/concepts
Login: Use your admin account
```

**What you should see:**

- 📊 Statistics cards (Concepts, Relationships, Categories, Avg Difficulty)
- 🎨 Purple gradient background
- 🧠 Brain icon header
- 💜 Extract button (purple gradient)
- 🟢 Test button (green gradient)

### Step 2: Check Current State

**Before extraction:**

- Total Concepts: 0 (if first run)
- Total Relationships: 0
- Categories: 0
- Avg Difficulty: 0

### Step 3: Extract Concepts

1. Click **"Extract Concepts from All Courses"** button
2. Button shows: "Extracting Concepts..." with spinner
3. Wait 6-8 minutes for GPT-4 processing
4. Watch for completion message with cost

**Expected Results:**

```
✅ Extraction Complete
- Total courses processed: 10-50 (depends on your data)
- Total concepts extracted: 50-500 (5-15 per course)
- Total relationships mapped: 150-1500 (3x concepts)
- Total cost: $0.50-$7.50 (~$0.05-0.15/course)
- Duration: 360-480 seconds (6-8 minutes)
```

### Step 4: View Updated Statistics

After extraction, you should see:

- **Total Concepts**: 50-500+ (updated)
- **Relationships**: 150-1500+ (updated)
- **Categories**: 5-15 categories
- **Avg Difficulty**: 4-6 (1-10 scale)

**Category Breakdown:**

- Programming Fundamentals
- Web Development
- Data Science
- Business & Management
- Design & UX
- etc.

### Step 5: Run Accuracy Tests

1. Click **"Run Accuracy Tests"** button
2. Button shows: "Running Tests..." with spinner
3. Wait ~30 seconds for all 5 tests
4. View detailed test results

**Expected Test Results:**

```
Test 1: Prerequisite Relationship Accuracy
✅ Target: 85%+ | Expected: 89%+
- Precision: 87%+
- Recall: 85%+
- F1 Score: 86%+
- Avg Search Time: <30ms

Test 2: Category Clustering Accuracy
✅ Target: 85%+ | Expected: 87%+
- Category match: 87%+
- Avg Search Time: <30ms

Test 3: Difficulty Level Similarity
✅ Target: 85%+ | Expected: 85%+
- Difficulty range accuracy: 85%+
- Avg Search Time: <30ms

Test 4: Semantic Search Quality
✅ Target: 85%+ | Expected: 91%+
- Relevance: 91%+
- Avg Search Time: <30ms

Test 5: Search Performance (<50ms)
✅ Target: 100% <50ms | Expected: 100%
- Avg Search Time: 15-30ms
- All searches <50ms: 100%

Overall Average: 90.4%+ ✅
Status: ✅ PASSED (all tests ≥85%)
```

---

## 📊 Example: What Gets Extracted

### Sample Course: "React Fundamentals"

**Extracted Concepts (5-15):**

1. **JSX Syntax**

   - Difficulty: 3
   - Prerequisites: ["JavaScript Basics", "HTML"]
   - Category: "Web Development"

2. **React Components**

   - Difficulty: 4
   - Prerequisites: ["JSX Syntax", "JavaScript Functions"]
   - Category: "Web Development"

3. **State Management**

   - Difficulty: 6
   - Prerequisites: ["React Components", "JavaScript Objects"]
   - Category: "Web Development"

4. **React Hooks**

   - Difficulty: 6
   - Prerequisites: ["State Management", "React Components"]
   - Category: "Web Development"

5. **Component Lifecycle**
   - Difficulty: 7
   - Prerequisites: ["React Components", "State Management"]
   - Category: "Web Development"

**Relationships Created:**

- "JSX Syntax" → prerequisite → "React Components"
- "React Components" → prerequisite → "State Management"
- "State Management" → prerequisite → "React Hooks"
- "React Hooks" ↔ related ↔ "Component Lifecycle"

---

## 🔍 Verification Checklist

### After Extraction ✅

- [ ] Statistics updated (concepts > 0)
- [ ] Cost displayed ($0.50-$7.50 range)
- [ ] No error messages
- [ ] Category breakdown shows 5+ categories
- [ ] Duration was 6-8 minutes

### After Testing ✅

- [ ] Overall accuracy ≥85% (target: 90.4%)
- [ ] All 5 tests show results
- [ ] Test 1: Prerequisite accuracy ≥85%
- [ ] Test 2: Category clustering ≥85%
- [ ] Test 3: Difficulty similarity ≥85%
- [ ] Test 4: Semantic search ≥85%
- [ ] Test 5: Performance 100% (<50ms)
- [ ] Pass/fail indicators show ✅ green

---

## 🐛 Troubleshooting

### Issue 1: "No courses found"

**Solution:**

```sql
-- Check published courses
SELECT COUNT(*) FROM "Course" WHERE published = true;

-- If 0, publish some courses or create test data
UPDATE "Course" SET published = true WHERE id IN (
  SELECT id FROM "Course" LIMIT 10
);
```

### Issue 2: "Failed to extract concepts"

**Possible causes:**

- OPENAI_API_KEY invalid or expired
- Network connectivity issues
- Course content too short (need 100+ words)

**Solution:**

```bash
# Check API key
echo $env:OPENAI_API_KEY

# Test API connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $env:OPENAI_API_KEY"
```

### Issue 3: "Low accuracy (<85%)"

**Possible causes:**

- Insufficient concepts (<10)
- Need more diverse content
- HNSW index not created

**Solution:**

```sql
-- Check concept count
SELECT COUNT(*) FROM concepts;

-- Verify HNSW index exists
SELECT indexname FROM pg_indexes
WHERE tablename = 'concepts'
AND indexname LIKE '%embedding%';
```

### Issue 4: "Search too slow (>50ms)"

**Possible causes:**

- HNSW index not used
- Too many concepts without index
- Database connection issues

**Solution:**

```sql
-- Force index rebuild
REINDEX INDEX concepts_embedding_idx;

-- Check index size
SELECT pg_size_pretty(pg_relation_size('concepts_embedding_idx'));
```

---

## 📈 Success Criteria

### ✅ Minimum Requirements

- At least 10 concepts extracted
- Overall accuracy ≥85%
- All 5 tests pass (≥85%)
- Search performance <50ms
- No fatal errors

### 🌟 Optimal Performance (Expected)

- 50-500 concepts extracted
- Overall accuracy ≥90%
- Search performance <30ms
- Category distribution balanced
- All prerequisite relationships found

---

## 🎯 Next Steps After Testing

### If All Tests Pass ✅

1. **Week 2 Status**: COMPLETE ✅
2. **Production Ready**: YES ✅
3. **Next**: Week 3 Gap Detection System

### Action Items:

- [ ] Review extracted concepts in dashboard
- [ ] Test similarity search manually
- [ ] Plan Week 3: Gap Detection & Personalization
- [ ] Document any issues or optimizations needed

### If Some Tests Fail ❌

1. **Review failure details** in test results
2. **Check logs** for error messages
3. **Verify data quality** (course content)
4. **Re-run extraction** if needed
5. **Adjust parameters** based on results

---

## 💡 Testing Tips

1. **First Run**: Start with 10-20 courses to test quickly
2. **Check Logs**: Monitor terminal for GPT-4 responses
3. **Cost Control**: ~$0.10 per course max
4. **Performance**: HNSW index makes huge difference
5. **Accuracy**: Improves with more diverse content

---

## 📞 Support Commands

### Check Database

```bash
# Open Prisma Studio
npx prisma studio

# Check concepts table
# Navigate to: http://localhost:5555
```

### Check Logs

```bash
# View terminal output
# Watch for "Concepts extracted from course" messages
# Check for any error stack traces
```

### Manual API Test

```bash
# Get statistics
curl http://localhost:3000/api/ai/concepts/extract

# Trigger extraction (requires auth)
curl -X POST http://localhost:3000/api/ai/concepts/extract \
  -H "Content-Type: application/json" \
  -d '{"mode": "all"}'
```

---

## 🎉 Expected Final State

After successful testing, you should have:

✅ **Knowledge Graph Built**

- 50-500 concepts with embeddings
- 150-1500 relationships mapped
- 5-15 categories identified
- Difficulty scores (1-10)

✅ **Accuracy Validated**

- 90.4% average accuracy
- All 5 tests passed
- <30ms search performance
- Production ready

✅ **Ready for Week 3**

- Gap detection system
- Personalized recommendations
- Adaptive learning paths

---

**Dynasty Nexus 2.0 - Week 2 Testing**  
**Date: October 23, 2025**  
**Status: Ready to Test**  
**Expected Duration: 15-20 minutes**  
**Expected Cost: $0.50-$7.50**

---

## 🚀 Begin Testing Now

1. Open: http://localhost:3000/admin/concepts
2. Login with admin account
3. Click "Extract Concepts from All Courses"
4. Wait for completion
5. Click "Run Accuracy Tests"
6. Verify results

**Good luck! 🎯**
