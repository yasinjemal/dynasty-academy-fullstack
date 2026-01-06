import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function enrollUser() {
  try {
    console.log("\n🎓 ENROLLING USER IN COURSE\n");

    // Your user ID (from the session - "yasin")
    const userId = "cmgp9zsiv0000uy1s6h9jrj1x"; // This is the "yasin" user ID
    const courseId = "4a244b5f-e694-413b-b6f3-1921ece7cb77";

    // Check if already enrolled
    const existing = await prisma.course_enrollments.findFirst({
      where: {
        userId: userId,
        courseId: courseId,
      },
    });

    if (existing) {
      console.log("✅ Already enrolled! Updating to 100% complete...\n");

      // Update to 100% complete
      await prisma.course_enrollments.update({
        where: { id: existing.id },
        data: {
          progress: 100,
          status: "completed",
          completedLessons: 8,
          totalLessons: 8,
          completedAt: new Date(),
        },
      });

      console.log("✅ Enrollment updated to 100% complete!");
    } else {
      console.log("Creating new enrollment...\n");

      // Create enrollment
      await prisma.course_enrollments.create({
        data: {
          id: `enr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: userId,
          courseId: courseId,
          status: "completed",
          progress: 100,
          completedLessons: 8,
          totalLessons: 8,
          totalWatchTime: 0,
          enrolledAt: new Date(),
          completedAt: new Date(),
        },
      });

      console.log("✅ Enrolled and set to 100% complete!");
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 SUCCESS!");
    console.log("");
    console.log('Now refresh your browser and click "Generate Certificate"!');
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

enrollUser();
