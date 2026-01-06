import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkLessonContent() {
  try {
    const lessons = await prisma.course_lessons.findMany({
      where: { courseId: "course-1760650591599" },
      select: {
        id: true,
        title: true,
        type: true,
        content: true,
        videoUrl: true,
        pdfUrl: true,
        order: true,
      },
      orderBy: { order: "asc" },
    });

    console.log(`📚 Found ${lessons.length} lessons:\n`);

    lessons.forEach((lesson, index) => {
      console.log(`${index + 1}. ${lesson.title}`);
      console.log(`   - ID: ${lesson.id}`);
      console.log(`   - Type: ${lesson.type}`);
      console.log(
        `   - Content Length: ${lesson.content?.length || 0} characters`
      );
      console.log(`   - Video URL: ${lesson.videoUrl || "none"}`);
      console.log(`   - PDF URL: ${lesson.pdfUrl || "none"}`);
      if (lesson.content) {
        console.log(
          `   - Content Preview: ${lesson.content.substring(0, 100)}...`
        );
      }
      console.log("");
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkLessonContent();
