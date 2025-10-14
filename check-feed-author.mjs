import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkFeedAuthor() {
  try {
    console.log("\n🔍 Checking Feed Item Author Data...\n");

    // Get feed items with author data
    const feedItems = await prisma.feedItem.findMany({
      take: 5,
      orderBy: { hotScore: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            image: true,
            level: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    console.log(`Found ${feedItems.length} feed items:\n`);

    for (const item of feedItems) {
      console.log("─".repeat(60));
      console.log(`📄 ${item.type}: ${item.post?.title || "N/A"}`);
      console.log(`   Author Data:`);
      console.log(`   - ID: ${item.author.id}`);
      console.log(`   - Name: ${item.author.name || "❌ NULL"}`);
      console.log(`   - Username: ${item.author.username || "❌ NULL"}`);
      console.log(`   - Email: ${item.author.email || "❌ NULL"}`);
      console.log(
        `   - Image: ${item.author.image ? "✅ Has image" : "❌ No image"}`
      );
      console.log(`   - Level: ${item.author.level}`);
      console.log("");
    }

    console.log("─".repeat(60));
    console.log("\n✅ Check complete!\n");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFeedAuthor();
