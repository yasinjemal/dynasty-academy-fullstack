import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log("🔍 Checking Database...\n");

    // Check books
    const bookCount = await prisma.book.count();
    console.log(`📚 Total Books: ${bookCount}`);

    if (bookCount > 0) {
      const books = await prisma.book.findMany({
        take: 5,
        select: {
          id: true,
          title: true,
          publishedAt: true,
        },
      });
      console.log("\n📖 Sample Books:");
      books.forEach((book) => {
        console.log(
          `  - ${book.title} (Published: ${book.publishedAt ? "Yes" : "No"})`
        );
      });
    }

    // Check users
    const userCount = await prisma.user.count();
    console.log(`\n👥 Total Users: ${userCount}`);

    // Check your user
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    console.log("\n👤 Users:");
    users.forEach((user) => {
      console.log(`  - ${user.email} (${user.name}) - Role: ${user.role}`);
    });

    // Check unpublished books
    const unpublishedCount = await prisma.book.count({
      where: { publishedAt: null },
    });
    console.log(`\n⚠️  Unpublished Books: ${unpublishedCount}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
