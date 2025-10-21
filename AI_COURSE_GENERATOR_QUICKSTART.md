# 🚀 AI Course Generator - Quick Start Guide

## ⚡ Get Started in 3 Minutes

### Step 1: Run Database Migration (30 seconds)

1. Go to your **Supabase Dashboard**
2. Click **SQL Editor** in sidebar
3. Click **New Query**
4. Copy and paste the contents of `add-ai-course-generator-tables.sql`
5. Click **Run** (bottom right)
6. ✅ You should see: "Success. No rows returned"

### Step 2: Access the Dashboard (10 seconds)

1. Go to `http://localhost:3002/admin`
2. Look for the **"✨ AI Course Generator"** button at the top of Quick Actions
3. It has a purple/pink/rose gradient with a **NEW** badge
4. Click it!

### Step 3: Generate Your First Course (5 minutes)

1. **Select a Book**:

   - Browse the list on the left
   - Click any book (it will get a purple border)
   - Preview appears on the right

2. **Configure Settings**:

   - **Mode**: Keep "Balanced" selected (best quality/speed) ⭐
   - **Audience**: Choose "Intermediate" (most versatile)
   - **RAG**: Keep it ON (better results)

3. **Click "Generate Course with AI"**:

   - Watch the magic happen! ✨
   - Progress shows:
     - 🔍 Analyzing book content...
     - ✨ Creating course structure...
     - ✅ Complete!
   - Takes about 4-5 minutes

4. **Review Results**:
   - See modules and lessons generated
   - Check confidence score (aim for 85%+)
   - View cost (usually $0.15-0.25)
   - Click "View Full Course" for details

### Step 4: Celebrate! 🎉

You just generated a complete course that would normally take 10-20 hours and cost $500-1000!

---

## 💡 Pro Tips

### For Best Results:

1. ✅ Use books with 50+ pages (more content = better generation)
2. ✅ Start with "Balanced" mode (best quality/speed)
3. ✅ Keep RAG enabled (if you've run embeddings)
4. ✅ Choose appropriate audience level for the book
5. ✅ Review and edit generated content before publishing

### If Generation Fails:

1. Check book has content in `book_contents` table
2. Verify OpenAI API key is set in `.env`
3. Ensure you have OpenAI credits
4. Try "Fast" mode first to test
5. Check browser console for errors

### Cost Management:

- **Fast Mode**: ~$0.10 per course
- **Balanced Mode**: ~$0.20 per course ⭐
- **Comprehensive Mode**: ~$0.35 per course
- Monthly budget: $20 = ~100 courses (Balanced mode)

---

## 🎯 What's Next?

### After Your First Course:

1. **View History Tab**: See all generations
2. **Check Analytics Tab**: Track costs and success rate
3. **Generate More**: Try different books and settings
4. **Optimize**: Find your perfect configuration

### Coming Soon:

- **Lesson Content Generator**: Generate full lesson text
- **Quiz Generator**: Auto-create quizzes
- **Publishing**: One-click publish to live courses
- **Batch Processing**: Generate multiple courses overnight

---

## 📞 Need Help?

### Common Questions:

**Q: Where do I get books?**  
A: Upload via `/admin/books` or use the book import system

**Q: Do I need embeddings?**  
A: No, but they improve quality. Run `npx tsx scripts/embed-books.ts` when ready

**Q: Can I edit generated courses?**  
A: Yes! Click edit, modify content, save changes

**Q: What if confidence score is low?**  
A: Try "Comprehensive" mode or regenerate with different settings

**Q: How many courses can I generate?**  
A: Unlimited! Only limit is your OpenAI API budget

---

## 🎉 You're Ready!

The AI Course Generator is a **game-changer**. In the time it takes to write a course outline manually, you can generate 10 complete courses with AI.

**Go create something amazing!** ✨

---

**Dashboard**: http://localhost:3002/admin/course-generator  
**Documentation**: AI_COURSE_GENERATOR_COMPLETE.md  
**Status**: 🟢 READY TO USE
