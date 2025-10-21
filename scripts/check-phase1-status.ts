/**
 * Check Phase 1 Status
 *
 * Verifies:
 * 1. Admin access configured
 * 2. Books in database
 * 3. Embeddings created
 * 4. AI conversations exist
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkPhase1Status() {
  console.log("🔍 Checking Phase 1 Status...\n");

  try {
    // 1. Check for admin users
    console.log("👤 Admin Users:");
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, email: true, name: true, role: true },
    });

    if (admins.length === 0) {
      console.log("❌ No admin users found!");
      console.log(
        "   Run: UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';"
      );
    } else {
      console.log(`✅ ${admins.length} admin(s) found:`);
      admins.forEach((admin) => {
        console.log(`   - ${admin.email} (${admin.name || "No name"})`);
      });
    }
    console.log("");

    // 2. Check for books
    console.log("📚 Books:");
    const books = await prisma.book.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        totalPages: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    if (books.length === 0) {
      console.log("❌ No books found!");
      console.log("   Add production books before running embeddings");
    } else {
      console.log(`✅ ${books.length} book(s) found (showing 5 most recent):`);
      books.forEach((book) => {
        console.log(`   - "${book.title}" (${book.totalPages || "?"} pages)`);
      });
    }
    console.log("");

    // 3. Check for embeddings
    console.log("🧠 Embeddings:");
    const embeddingsResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count 
      FROM content_embeddings
    `;
    const embeddingsCount = Number(embeddingsResult[0]?.count || 0);

    if (embeddingsCount === 0) {
      console.log("❌ No embeddings found!");
      console.log("   Steps:");
      console.log("   1. Run fix-embeddings-permissions.sql in Supabase");
      console.log("   2. Run: npx tsx scripts/embed-books.ts");
    } else {
      console.log(`✅ ${embeddingsCount} embedding(s) created`);

      // Get breakdown by content type
      const breakdown = await prisma.$queryRaw<
        { content_type: string; count: bigint }[]
      >`
        SELECT content_type, COUNT(*) as count
        FROM content_embeddings
        GROUP BY content_type
      `;

      breakdown.forEach((row) => {
        console.log(`   - ${row.content_type}: ${row.count}`);
      });
    }
    console.log("");

    // 4. Check for AI conversations
    console.log("💬 AI Conversations:");

    let conversations = 0;
    try {
      const conversationsResult = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM ai_conversations
      `;
      conversations = Number(conversationsResult[0]?.count || 0);

      if (conversations === 0) {
        console.log("❌ No AI conversations yet");
        console.log("   Use the AI Chat widget to test");
      } else {
        // Get total messages
        const messagesResult = await prisma.$queryRaw<
          { total_messages: bigint }[]
        >`
          SELECT SUM(message_count) as total_messages FROM ai_conversations
        `;
        const totalMessages = Number(messagesResult[0]?.total_messages || 0);

        console.log(
          `✅ ${conversations} conversation(s) with ${totalMessages} message(s)`
        );
      }
    } catch (error) {
      console.log("⚠️  Unable to check AI conversations (table may not exist)");
    }
    console.log("");

    // Summary
    console.log("📊 Phase 1 Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const hasAdmin = admins.length > 0;
    const hasBooks = books.length > 0;
    const hasEmbeddings = embeddingsCount > 0;
    const hasConversations = conversations > 0;

    console.log(`Admin Access:     ${hasAdmin ? "✅ Ready" : "❌ Not Set"}`);
    console.log(`Books:            ${hasBooks ? "✅ Ready" : "❌ Not Added"}`);
    console.log(
      `RAG Embeddings:   ${hasEmbeddings ? "✅ Ready" : "❌ Not Created"}`
    );
    console.log(
      `AI Usage:         ${hasConversations ? "✅ Active" : "⏳ Waiting"}`
    );
    console.log("");

    // Recommendations
    console.log("💡 Next Steps:");
    if (!hasAdmin) {
      console.log("1. ⚠️  Set admin role in Supabase SQL Editor");
    }
    if (!hasBooks) {
      console.log("2. ⚠️  Add production books to database");
    } else if (!hasEmbeddings) {
      console.log("2. ⚠️  Run fix-embeddings-permissions.sql");
      console.log(
        "3. ⚠️  Run embedding script: npx tsx scripts/embed-books.ts"
      );
    }
    if (hasAdmin && hasBooks && hasEmbeddings) {
      console.log("✅ Phase 1 COMPLETE! Ready for Phase 2");
    }
  } catch (error) {
    console.error("❌ Error checking status:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPhase1Status();
