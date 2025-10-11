# Quick Start: Reflection Feature

## 🚀 Setup (One-time)

1. **Run the database migration:**
   ```bash
   node setup-reflections.mjs
   ```

2. **Verify the setup:**
   ```bash
   npx prisma studio
   ```
   Check that the `reflections` table exists.

## 📖 Usage

### As a Reader

1. **Open any book** in the reader
2. Click the **"💭 Reflect"** button in the header
3. Write your reflection about the current chapter
4. Choose your sharing preference:
   - Leave unchecked: **Private** (only you can see it)
   - Check "Make reflection public": **Public** (others can see it)
   - Check "Share to community forum": Creates a **forum topic** automatically
5. Click **"Save Reflection"**

### Example Use Cases

#### Personal Learning Journal
- Keep reflections private
- Track your insights chapter by chapter
- Review your learning journey later

#### Community Engagement
- Make reflections public to share insights
- Share to forum to start discussions
- Learn from others' reflections

## 🎯 Key Features

✅ **Private by default** - Your reflections are personal  
✅ **Optional sharing** - Share when you want to  
✅ **Auto-categorization** - Forum topics go to the right category  
✅ **Chapter tracking** - Each reflection tied to specific chapter  
✅ **Rich content** - Up to 5000 characters per reflection  

## 📂 Files Modified

- `prisma/schema.prisma` - Added Reflection model
- `src/app/api/books/reflections/route.ts` - API endpoints
- `src/components/books/ReflectionModal.tsx` - UI component
- `src/components/books/BookReader.tsx` - Integration
- `src/lib/validations/schemas.ts` - Validation schema

## 🔗 Related Features

- **Community Forum** - Reflections can be shared as topics
- **Book Reader** - Reflections created while reading
- **User Profile** - View your reflection history (TODO)

## 📚 Full Documentation

See `REFLECTION_FEATURE.md` for complete documentation including:
- API reference
- Database schema details
- Advanced usage examples
- Troubleshooting guide

---

**Need Help?** Check the full documentation or contact support.
