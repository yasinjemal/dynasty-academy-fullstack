import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixDecimalPrecision() {
  try {
    console.log("🔧 Fixing DECIMAL precision overflow...\n");

    console.log("   [1/2] Updating ai_generated_content columns...");
    await prisma.$executeRaw`
      ALTER TABLE ai_generated_content 
        ALTER COLUMN quality_score TYPE DECIMAL(5, 2),
        ALTER COLUMN confidence_score TYPE DECIMAL(5, 2)
    `;
    console.log("   ✅ ai_generated_content updated");

    console.log("   [2/2] Updating ai_course_templates columns...");
    await prisma.$executeRaw`
      ALTER TABLE ai_course_templates 
        ALTER COLUMN success_rate TYPE DECIMAL(5, 2),
        ALTER COLUMN avg_quality_score TYPE DECIMAL(5, 2)
    `;
    console.log("   ✅ ai_course_templates updated");

    console.log("\n✅ Migration completed successfully!");
    console.log("✨ All DECIMAL columns now support values 0-100");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixDecimalPrecision();
