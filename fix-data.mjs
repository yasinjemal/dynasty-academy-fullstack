import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixData() {
  try {
    console.log("🔧 Starting data fix...\n");

    // 1. Fix unpublished books
    const unpublishedBooks = await prisma.book.findMany({
      where: { publishedAt: null },
      select: { id: true, title: true },
    });

    console.log(`📚 Found ${unpublishedBooks.length} unpublished books`);

    if (unpublishedBooks.length > 0) {
      console.log("📝 Publishing all books...");
      const publishResult = await prisma.book.updateMany({
        where: { publishedAt: null },
        data: { publishedAt: new Date() },
      });
      console.log(`✅ Published ${publishResult.count} books\n`);
    }

    // 2. Check and fix admin users
    console.log("👤 Checking users...");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log(`\nFound ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(
        `  ${index + 1}. ${user.email} - ${user.name} (${user.role})`
      );
    });

    // Prompt to make first user admin
    if (users.length > 0 && users[0].role !== "ADMIN") {
      console.log(`\n🔧 Making ${users[0].email} an ADMIN...`);
      await prisma.user.update({
        where: { id: users[0].id },
        data: { role: "ADMIN" },
      });
      console.log("✅ Updated to ADMIN");
    }

    // 3. Show final stats
    const bookCount = await prisma.book.count();
    const publishedCount = await prisma.book.count({
      where: { publishedAt: { not: null } },
    });

    console.log("\n📊 Final Stats:");
    console.log(`  Total Books: ${bookCount}`);
    console.log(`  Published Books: ${publishedCount}`);
    console.log(`  Total Users: ${users.length}`);
    console.log("\n✨ Done! Refresh your browser.");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixData();
