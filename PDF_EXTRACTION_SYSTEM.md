# 📚 PDF Text Extraction System

## Overview

Complete PDF text extraction system built with PDF.js that extracts, stores, and displays actual PDF content in the 3D reading experience.

## Features

✅ **Full PDF Text Extraction** - Extracts all text from uploaded PDFs  
✅ **Page-by-Page Storage** - Stores content in database for fast retrieval  
✅ **Metadata Extraction** - Automatically extracts title, author, and subject  
✅ **Word Count Tracking** - Tracks words per page and total  
✅ **Real Content Display** - Shows actual PDF text in 3D reader  
✅ **Fallback Support** - Gracefully handles extraction failures

## How It Works

### 1. Upload Flow

When a user uploads a PDF:

1. **File Validation** - Checks file type and size
2. **File Storage** - Saves PDF to `/public/uploads/user-books/`
3. **Text Extraction** - Uses PDF.js to extract text from each page
4. **Metadata Extraction** - Extracts title, author, subject from PDF metadata
5. **Database Storage** - Stores:
   - Book record with metadata
   - Individual pages in `book_contents` table
   - Automatic purchase for uploader

### 2. Reading Flow

When a user reads a book:

1. **Authentication Check** - Verifies user has access
2. **Book Fetch** - Loads book with extracted content
3. **Content Display** - Shows actual PDF text in 3D reader
4. **Progress Tracking** - Tracks reading progress

## Database Schema

### Book Model

```prisma
model Book {
  id          String
  title       String  // From PDF metadata or filename
  totalPages  Int     // Actual page count from PDF
  fileUrl     String  // Path to PDF file
  bookContents BookContent[] // Extracted text pages
  // ... other fields
}
```

### BookContent Model

```prisma
model BookContent {
  id         String
  bookId     String
  pageNumber Int     // Page number (1-indexed)
  content    String  // Extracted text
  wordCount  Int     // Words on this page
  charCount  Int     // Characters on this page
  book       Book    // Relation to book
}
```

## API Endpoints

### POST /api/books/upload

Uploads and processes a PDF file.

**Request:**

- `FormData` with `file` field

**Response:**

```json
{
  "success": true,
  "book": {
    "id": "...",
    "title": "Extracted Title",
    "author": "Extracted Author",
    "totalPages": 150,
    "extracted": true,
    "wordCount": 45000
  }
}
```

### GET /api/books/read/[id]

Fetches book with extracted content.

**Response:**

```json
{
  "book": {
    "id": "...",
    "title": "...",
    "hasContent": true,
    "content": "Full extracted text...",
    "totalPages": 150
  },
  "progress": {
    "currentPage": 5,
    "progress": 3.3
  }
}
```

## PDF.js Integration

### Configuration

```typescript
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
```

### Text Extraction

```typescript
const extraction = await extractPDFText(buffer);
// Returns: {
//   success: true,
//   totalPages: 150,
//   pages: [{pageNumber: 1, text: "...", wordCount: 250}, ...],
//   fullText: "...",
//   totalWords: 45000,
//   title: "Book Title",
//   author: "Author Name"
// }
```

## Usage Example

### Upload a PDF

```typescript
const formData = new FormData();
formData.append("file", pdfFile);

const response = await fetch("/api/books/upload", {
  method: "POST",
  body: formData,
});

const result = await response.json();
console.log("Uploaded:", result.book.title);
console.log("Pages extracted:", result.book.totalPages);
console.log("Words:", result.book.wordCount);
```

### Read Extracted Content

```typescript
const response = await fetch(`/api/books/read/${bookId}`);
const data = await response.json();

if (data.book.hasContent) {
  // Display actual PDF text
  displayContent(data.book.content);
} else {
  // Show placeholder or extract button
  showPlaceholder();
}
```

## Error Handling

The system gracefully handles extraction failures:

1. **Extraction Fails** - Book still saves without content
2. **No Content** - Displays placeholder text
3. **Partial Extraction** - Uses whatever was extracted
4. **Large Files** - Processes in chunks to avoid memory issues

## Performance Optimizations

1. **Async Processing** - Text extraction runs asynchronously
2. **Page-by-Page Storage** - Enables progressive loading
3. **Database Indexing** - Fast lookups by `bookId` and `pageNumber`
4. **Content Caching** - Extracted content cached in database
5. **Lazy Loading** - Loads pages on-demand if needed

## Future Enhancements

- [ ] **Background Processing** - Queue large PDF extractions
- [ ] **Cover Extraction** - Generate covers from PDF first page
- [ ] **Table of Contents** - Extract PDF bookmarks/TOC
- [ ] **Image Extraction** - Extract and display PDF images
- [ ] **Search** - Full-text search across book content
- [ ] **Highlights** - Store user highlights by page/position
- [ ] **Epub Support** - Add EPUB text extraction
- [ ] **OCR** - Extract text from scanned PDFs

## Testing

### Test PDF Upload

1. Go to `/upload`
2. Upload a PDF file
3. Check console for extraction logs
4. Navigate to `/library`
5. Click "Read Now" on uploaded book
6. Verify actual PDF text displays

### Verify Extraction

```sql
-- Check book record
SELECT id, title, totalPages FROM books WHERE source = 'user-upload';

-- Check extracted content
SELECT pageNumber, wordCount, LENGTH(content) as charCount
FROM book_contents
WHERE bookId = 'YOUR_BOOK_ID'
ORDER BY pageNumber;
```

## Dependencies

- `pdfjs-dist` - PDF parsing and text extraction
- `@prisma/client` - Database ORM
- `uuid` - Unique file naming
- Node.js `fs/promises` - File system operations

## Troubleshooting

### "PDF extraction failed"

- Check PDF is not encrypted/password-protected
- Verify PDF is not scanned (needs OCR)
- Check file size under 50MB limit

### "No content displayed"

- Check `hasContent` flag in API response
- Verify database has `book_contents` entries
- Check console for extraction errors

### "Worker script error"

- Verify PDF.js worker CDN is accessible
- Check browser console for worker errors
- Try different CDN URL

## Security

- ✅ Authentication required for upload
- ✅ File type validation
- ✅ File size limits (50MB)
- ✅ User-scoped access control
- ✅ Sanitized file names
- ✅ Private upload directory

---

Built with ❤️ for Dynasty Academy - The World's First 3D Reading Platform
