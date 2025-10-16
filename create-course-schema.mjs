import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

const prisma = new PrismaClient();

async function createCourseSchema() {
  try {
    console.log("🎓 Creating Dynasty Course System...\n");

    // Read SQL file
    const sql = readFileSync("create-course-schema.sql", "utf8");

    console.log("📖 Executing SQL migration...");
    await prisma.$executeRawUnsafe(sql);

    console.log("\n✅ COURSE SYSTEM CREATED SUCCESSFULLY!\n");

    // Verify tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'course%'
      OR table_name IN ('lesson_progress', 'quiz_attempts', 'quiz_questions')
      ORDER BY table_name
    `;

    console.log("📊 Created tables:");
    tables.forEach((table: any) => {
      console.log(`   ✓ ${table.table_name}`);
    });

    console.log("\n🎯 Course System Features:");
    console.log("   ✓ Multi-format lessons (video, PDF, articles)");
    console.log("   ✓ Section-based course structure");
    console.log("   ✓ Progress tracking per lesson");
    console.log("   ✓ Quiz system with multiple question types");
    console.log("   ✓ Course notes & bookmarks");
    console.log("   ✓ Certificate generation");
    console.log("   ✓ Downloadable resources");
    console.log("   ✓ Course reviews & ratings");
    console.log("   ✓ Intelligence OS ready 🚀");

    console.log("\n💡 Next Steps:");
    console.log("   1. Run: npx prisma db pull");
    console.log("   2. Run: npx prisma generate");
    console.log("   3. Create your first course!");
    console.log("   4. Test Intelligence predictions");
  } catch (error) {
    console.error("❌ Error creating course schema:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createCourseSchema();
