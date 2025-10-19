// 🧪 Quick Test Script for Book Import System
// Run this to verify everything works!

import {
  GutenbergImporter,
  OpenLibraryImporter,
  GoogleBooksImporter,
} from "./src/lib/bookImporters";

async function testImporters() {
  console.log("\n🚀 TESTING BOOK IMPORT SYSTEM\n");
  console.log("=".repeat(50));

  // Test Open Library
  console.log("\n📚 Testing Open Library...");
  const openLibrary = new OpenLibraryImporter();
  try {
    const olBooks = await openLibrary.search({
      category: "Business",
      limit: 5,
    });
    console.log(`✅ Found ${olBooks.length} books from Open Library`);
    if (olBooks.length > 0) {
      console.log(`   Example: "${olBooks[0].title}" by ${olBooks[0].author}`);
    }
  } catch (error: any) {
    console.log(`❌ Open Library Error: ${error.message}`);
  }

  // Test Project Gutenberg
  console.log("\n📖 Testing Project Gutenberg...");
  const gutenberg = new GutenbergImporter();
  try {
    const gbBooks = await gutenberg.search({
      search: "philosophy",
      limit: 5,
    });
    console.log(`✅ Found ${gbBooks.length} books from Gutenberg`);
    if (gbBooks.length > 0) {
      console.log(`   Example: "${gbBooks[0].title}" by ${gbBooks[0].author}`);
    }
  } catch (error: any) {
    console.log(`❌ Gutenberg Error: ${error.message}`);
  }

  // Test Google Books
  console.log("\n🔍 Testing Google Books...");
  const googleBooks = new GoogleBooksImporter();
  try {
    const gBooks = await googleBooks.search({
      category: "Self-Improvement",
      limit: 5,
    });
    console.log(`✅ Found ${gBooks.length} books from Google Books`);
    if (gBooks.length > 0) {
      console.log(`   Example: "${gBooks[0].title}" by ${gBooks[0].author}`);
    }
  } catch (error: any) {
    console.log(`❌ Google Books Error: ${error.message}`);
  }

  console.log("\n" + "=".repeat(50));
  console.log("\n✨ TEST COMPLETE!\n");
  console.log("Next steps:");
  console.log("1. Run: npx prisma db push");
  console.log("2. Start dev server: npm run dev");
  console.log("3. Visit: http://localhost:3000/admin/books/import");
  console.log("4. Import your first books! 🎉\n");
}

// Run the tests
testImporters().catch(console.error);
