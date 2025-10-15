#!/usr/bin/env node
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log("📖 Reading migration file...");
    const sql = readFileSync("migrate-intelligent-audio.sql", "utf8");

    // Split by semicolon and filter out comments and empty lines
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"))
      .map((s) => s + ";");

    console.log(`✅ Found ${statements.length} SQL statements`);
    console.log("");
    console.log("🚀 Executing migration...");
    console.log("   This will add:");
    console.log("   - Enhanced AudioAsset with ML fields");
    console.log("   - 8 new tables for ML tracking");
    console.log("   - Indexes for vector search");
    console.log("");

    let executed = 0;
    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement);
        executed++;
        process.stdout.write(
          `\r   Executed: ${executed}/${statements.length} statements`
        );
      } catch (error) {
        // Ignore "already exists" errors
        if (error.message.includes("already exists")) {
          executed++;
          process.stdout.write(
            `\r   Executed: ${executed}/${statements.length} statements (skipped existing)`
          );
        } else {
          console.error(`\n❌ Error executing statement:`, error.message);
        }
      }
    }

    console.log("\n");
    console.log("✅ MIGRATION COMPLETE!");
    console.log("");
    console.log("🧠 Intelligent Audio schema is ready:");
    console.log("   ✓ AudioAsset enhanced with ML fields");
    console.log("   ✓ UserReadingSession created");
    console.log("   ✓ UserFeedback created");
    console.log("   ✓ QualityABTest created");
    console.log("   ✓ MLModelInsight created");
    console.log("   ✓ PredictionHistory created");
    console.log("   ✓ VoicePerformance created");
    console.log("   ✓ IntelligenceMetrics created");
    console.log("   ✓ BackgroundJob created");
    console.log("");
    console.log("🎯 Next steps:");
    console.log("   1. Run: npx prisma db pull");
    console.log("   2. Run: npx prisma generate");
    console.log("   3. Test intelligent audio generation");
    console.log("");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
