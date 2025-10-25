import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log("📚 Reading SQL file...");
    const sql = readFileSync("./add-ai-course-generator-tables.sql", "utf-8");

    // Split SQL into individual statements
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`🚀 Running ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          console.log(
            `   [${i + 1}/${statements.length}] ${statement.substring(
              0,
              50
            )}...`
          );
          await prisma.$executeRawUnsafe(statement);
        } catch (err) {
          // Ignore "already exists" errors
          if (!err.message.includes("already exists")) {
            throw err;
          }
          console.log(`   ⚠️  Skipped (already exists)`);
        }
      }
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("✨ Tables created:");
    console.log("   - ai_generated_content");
    console.log("   - ai_generation_jobs");
    console.log("   - ai_course_templates");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
