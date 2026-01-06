import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkCourse() {
  try {
    const course = await prisma.courses.findUnique({
      where: { id: "course-1760650591599" },
      select: {
        id: true,
        title: true,
        lessonCount: true,
        status: true,
      },
    });

    console.log("📊 Course Data:", JSON.stringify(course, null, 2));

    // Also count lessons
    const lessonCount = await prisma.course_lessons.count({
      where: { courseId: "course-1760650591599" },
    });

    console.log(`\n📚 Actual Lesson Count in DB: ${lessonCount}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkCourse();
