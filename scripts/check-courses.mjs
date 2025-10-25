import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkCourses() {
  console.log("📚 Checking courses and lessons...\n");

  const courses = await prisma.courses.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  console.log(`Found ${courses.length} courses:`);
  courses.forEach((course) => {
    console.log(`  - ${course.id}: ${course.title}`);
  });

  console.log("\n📝 Checking lessons...\n");

  const lessons = await prisma.course_lessons.findMany({
    select: {
      id: true,
      title: true,
      courseId: true,
    },
  });

  console.log(`Found ${lessons.length} lessons:`);
  lessons.forEach((lesson) => {
    console.log(
      `  - ${lesson.id}: ${lesson.title} (course: ${lesson.courseId})`
    );
  });

  console.log("\n📋 Checking ai_generated_content...\n");

  const aiContent = await prisma.$queryRawUnsafe(`
    SELECT 
      content_type,
      source_type,
      source_id,
      created_at
    FROM ai_generated_content
    WHERE content_type IN ('course', 'lesson', 'quiz')
    ORDER BY created_at DESC
    LIMIT 20
  `);

  console.log(`Found ${aiContent.length} AI-generated items:`);
  aiContent.forEach((item) => {
    console.log(
      `  - ${item.content_type} from ${item.source_type} ${item.source_id}`
    );
  });

  await prisma.$disconnect();
}

checkCourses();
