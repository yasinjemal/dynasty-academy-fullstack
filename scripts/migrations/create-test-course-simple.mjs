import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function createTestCourse() {
  try {
    console.log("🎓 Creating Test Course...\n");

    // Get any user to be the instructor
    const user = await prisma.user.findFirst();

    if (!user) {
      console.error(
        "❌ No users found. Please sign up first at http://localhost:3000/auth/signin"
      );
      process.exit(1);
    }

    console.log(`👤 Using instructor: ${user.email || user.username}\n`);

    // Check if course already exists
    const existingCourse = await prisma.courses.findUnique({
      where: { slug: "complete-react-nextjs-masterclass" },
      include: {
        course_sections: {
          include: {
            course_lessons: true,
          },
        },
      },
    });

    let course;
    if (existingCourse && existingCourse.course_sections.length > 0) {
      console.log(
        `📚 Course already exists with lessons (ID: ${existingCourse.id})`
      );
      console.log(
        `\n🎯 TEST URL: http://localhost:3000/courses/${existingCourse.id}`
      );
      console.log(`\n✅ Course is ready for testing!`);
      return;
    } else if (existingCourse) {
      console.log(`📚 Course exists but no lessons - updating...`);
      course = existingCourse;
    } else {
      // Create the test course
      course = await prisma.courses.create({
        data: {
          id: randomUUID(),
          title: "Complete React & Next.js Masterclass",
          slug: "complete-react-nextjs-masterclass",
          description:
            "Master React and Next.js development with hands-on projects, PDF guides, and real-world examples. Learn from basics to advanced concepts including Server Components, App Router, and more.",
          shortDescription: "Master modern React and Next.js development",
          authorId: user.id,
          coverImage:
            "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
          price: 199.0,
          level: "intermediate",
          category: "Web Development",
          tags: ["React", "Next.js", "JavaScript", "Web Development"],
          duration: 2400, // 40 hours
          status: "published",
          featured: true,
          lessonCount: 8,
        },
      });
      console.log(`✅ Created course: ${course.title} (ID: ${course.id})\n`);
    }

    // Section 1: Getting Started
    const section1 = await prisma.course_sections.create({
      data: {
        id: randomUUID(),
        courseId: course.id,
        title: "Getting Started with React",
        description: "Introduction to React fundamentals and setup",
        order: 0,
      },
    });

    // Lesson 1.1: Welcome Video (YouTube)
    await prisma.course_lessons.create({
      data: {
        id: randomUUID(),
        sectionId: section1.id,
        courseId: course.id,
        title: "Welcome to the Course",
        slug: "welcome-to-the-course",
        description:
          "An introduction to what you will learn in this comprehensive React course",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        videoProvider: "youtube",
        videoDuration: 600,
        order: 0,
        isFree: true,
      },
    });

    // Lesson 1.2: Course PDF Guide
    await prisma.course_lessons.create({
      data: {
        id: randomUUID(),
        sectionId: section1.id,
        courseId: course.id,
        title: "Course Roadmap & Setup Guide",
        slug: "course-roadmap-setup-guide",
        description: "Complete PDF guide for course setup and roadmap",
        type: "pdf",
        pdfUrl:
          "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        order: 1,
        isFree: true,
      },
    });

    // Lesson 1.3: React Basics (Vimeo)
    await prisma.course_lessons.create({
      data: {
        id: randomUUID(),
        sectionId: section1.id,
        courseId: course.id,
        title: "React Fundamentals Explained",
        slug: "react-fundamentals-explained",
        description: "Deep dive into React core concepts",
        type: "video",
        videoUrl: "https://vimeo.com/76979871",
        videoProvider: "vimeo",
        videoDuration: 1500,
        order: 2,
        isFree: false,
      },
    });

    // Section 2: Advanced Concepts
    const section2 = await prisma.course_sections.create({
      data: {
        id: randomUUID(),
        courseId: course.id,
        title: "Advanced React Patterns",
        description: "Learn advanced patterns and best practices",
        order: 1,
      },
    });

    // Lesson 2.1: Hooks Deep Dive (YouTube)
    await prisma.course_lessons.create({
      data: {
        id: randomUUID(),
        sectionId: section2.id,
        courseId: course.id,
        title: "React Hooks Masterclass",
        slug: "react-hooks-masterclass",
        description: "Everything you need to know about React Hooks",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=TNhaISOUy6Q",
        videoProvider: "youtube",
        videoDuration: 2700,
        order: 0,
        isFree: false,
      },
    });

    // Lesson 2.2: Advanced Patterns PDF
    await prisma.course_lessons.create({
      data: {
        id: randomUUID(),
        sectionId: section2.id,
        courseId: course.id,
        title: "Design Patterns Cheat Sheet",
        slug: "design-patterns-cheat-sheet",
        description: "Comprehensive PDF guide to React design patterns",
        type: "pdf",
        pdfUrl: "https://pdfobject.com/pdf/sample.pdf",
        order: 1,
        isFree: false,
      },
    });

    // Section 3: Next.js Integration
    const section3 = await prisma.course_sections.create({
      data: {
        id: randomUUID(),
        courseId: course.id,
        title: "Next.js App Router",
        description: "Modern Next.js development with App Router",
        order: 2,
      },
    });

    // Lesson 3.1: Next.js Intro (YouTube)
    await prisma.course_lessons.create({
      data: {
        id: randomUUID(),
        sectionId: section3.id,
        courseId: course.id,
        title: "Introduction to Next.js 15",
        slug: "introduction-to-nextjs-15",
        description: "Getting started with Next.js App Router",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=Sklc_fQBmcs",
        videoProvider: "youtube",
        videoDuration: 1800,
        order: 0,
        isFree: false,
      },
    });

    // Lesson 3.2: Article lesson
    await prisma.course_lessons.create({
      data: {
        id: randomUUID(),
        sectionId: section3.id,
        courseId: course.id,
        title: "Server Components Deep Dive",
        slug: "server-components-deep-dive",
        description: "Understanding Server and Client Components",
        type: "article",
        content:
          "<h1>Server Components in Next.js</h1><p>Server Components are a revolutionary new feature in React and Next.js that allow you to render components on the server...</p><h2>Benefits</h2><ul><li>Zero bundle size</li><li>Direct database access</li><li>Improved performance</li><li>Better SEO</li><li>Reduced JavaScript sent to client</li></ul><h2>How They Work</h2><p>Server Components render on the server and send HTML to the client. They can access databases and APIs directly without exposing credentials to the browser.</p>",
        order: 1,
        isFree: false,
      },
    });

    // Enroll the user in the course
    await prisma.course_enrollments.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
      update: {},
      create: {
        id: randomUUID(),
        userId: user.id,
        courseId: course.id,
        status: "active",
      },
    });

    console.log("\n📊 Test Course Created Successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("📚 Course Details:");
    console.log(`   Title: ${course.title}`);
    console.log(`   Sections: 3`);
    console.log(`   Total Lessons: 8`);
    console.log(`\n📹 Video Lessons: 5`);
    console.log(`   • YouTube: 4 lessons`);
    console.log(`   • Vimeo: 1 lesson`);
    console.log(`\n📄 PDF Lessons: 2`);
    console.log(`\n📝 Article Lessons: 1`);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`\n🎯 TEST URLS:`);
    console.log(
      `   📚 Course Page: http://localhost:3000/courses/${course.id}`
    );
    console.log(`   📋 All Courses: http://localhost:3000/courses`);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(
      `\n✅ You are enrolled in the course as: ${user.email || user.username}`
    );

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`\n🧪 TESTING CHECKLIST:`);
    console.log(`   [ ] Video Player - YouTube`);
    console.log(`   [ ] Video Player - Vimeo`);
    console.log(`   [ ] PDF Viewer - Page Navigation`);
    console.log(`   [ ] PDF Viewer - Zoom Controls`);
    console.log(`   [ ] Progress Tracking`);
    console.log(`   [ ] Mark Complete Button`);
    console.log(`   [ ] Intelligence Panel Predictions`);
    console.log(`   [ ] Section Navigation (Sidebar)`);
    console.log(`   [ ] Article View (Rich HTML)`);
    console.log(`   [ ] Lesson Switching`);
    console.log(`   [ ] Fullscreen Video Mode`);
    console.log(`   [ ] Keyboard Shortcuts`);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`\n💡 NEXT STEPS:`);
    console.log(`   1. Make sure dev server is running: npm run dev`);
    console.log(`   2. Visit: http://localhost:3000/courses/${course.id}`);
    console.log(`   3. Test video playback (YouTube & Vimeo)`);
    console.log(`   4. Test PDF viewer with zoom & navigation`);
    console.log(`   5. Check Intelligence predictions panel`);
    console.log(`   6. Track progress and mark lessons complete`);
    console.log(`\n🚀 Happy Testing!`);
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  } catch (error) {
    console.error("\n❌ Error creating test course:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestCourse();
