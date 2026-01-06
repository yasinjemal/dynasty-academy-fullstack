import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestCourse() {
  try {
    console.log("🎓 Creating Test Course...\n");

    // Get the first user to be the instructor
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ role: "ADMIN" }, { isMentor: true }],
      },
    });

    if (!user) {
      // Just get any user
      const anyUser = await prisma.user.findFirst();
      if (!anyUser) {
        console.error("❌ No users found. Please create a user first.");
        process.exit(1);
      }
      console.log(`👤 Using user: ${anyUser.email}\n`);
      return anyUser;
    }

    console.log(`👤 Using instructor: ${user.email}\n`);

    // Create the test course
    const course = await prisma.$queryRaw`
      INSERT INTO courses (
        id,
        title,
        slug,
        description,
        "authorId",
        "coverImage",
        price,
        level,
        category,
        duration,
        status,
        "createdAt",
        "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        'Complete React & Next.js Masterclass',
        'complete-react-nextjs-masterclass',
        'Master React and Next.js development with hands-on projects, PDF guides, and real-world examples. Learn from basics to advanced concepts including Server Components, App Router, and more.',
        ${user.id},
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        199.00,
        'intermediate',
        'Web Development',
        2400,
        'published',
        NOW(),
        NOW()
      )
      ON CONFLICT (slug) DO UPDATE 
      SET "updatedAt" = NOW()
      RETURNING id
    `;

    const courseId = course[0]?.id;

    if (!courseId) {
      console.error("❌ Failed to create course");
      process.exit(1);
    }

    console.log(`✅ Created course with ID: ${courseId}\n`);

    // Create Section 1: Introduction
    await prisma.$queryRaw`
      INSERT INTO course_sections (
        id,
        "courseId",
        title,
        description,
        "order",
        "createdAt",
        "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        ${courseId},
        'Getting Started with React',
        'Introduction to React fundamentals and setup',
        0,
        NOW(),
        NOW()
      )
    `;

    const section1 = await prisma.$queryRaw`
      SELECT id FROM course_sections 
      WHERE "courseId" = ${courseId} AND "order" = 0
      LIMIT 1
    `;

    const section1Id = section1[0]?.id;

    // Lesson 1.1: Welcome Video (YouTube)
    await prisma.$queryRaw`
      INSERT INTO course_lessons (
        id,
        "sectionId",
        "courseId",
        title,
        slug,
        description,
        type,
        "videoUrl",
        "videoProvider",
        "videoDuration",
        "order",
        "isFree",
        "createdAt",
        "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        ${section1Id},
        ${courseId},
        'Welcome to the Course',
        'welcome-to-the-course',
        'An introduction to what you will learn in this comprehensive React course',
        'video',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'youtube',
        600,
        0,
        true,
        NOW(),
        NOW()
      )
    `;

    // Lesson 1.2: Course PDF Guide
    await prisma.$queryRaw`
      INSERT INTO course_lessons (
        id,
        "sectionId",
        "courseId",
        title,
        slug,
        description,
        type,
        "pdfUrl",
        "order",
        "isFree",
        "createdAt",
        "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        ${section1Id},
        ${courseId},
        'Course Roadmap & Setup Guide',
        'course-roadmap-setup-guide',
        'Complete PDF guide for course setup and roadmap',
        'pdf',
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        1,
        true,
        NOW(),
        NOW()
      )
    `;

    // Lesson 1.3: React Basics (Vimeo)
    await prisma.$queryRaw`
      INSERT INTO course_lessons (
        id,
        "sectionId",
        "courseId",
        title,
        slug,
        description,
        type,
        "videoUrl",
        "videoProvider",
        "videoDuration",
        "order",
        "isFree",
        "createdAt",
        "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        ${section1Id},
        ${courseId},
        'React Fundamentals Explained',
        'react-fundamentals-explained',
        'Deep dive into React core concepts',
        'video',
        'https://vimeo.com/76979871',
        'vimeo',
        1500,
        2,
        false,
        NOW(),
        NOW()
      )
    `;

    // Create Section 2: Advanced Concepts
    await prisma.$queryRaw`
      INSERT INTO course_sections (
        course_id,
        title,
        description,
        order_index,
        created_at,
        updated_at
      ) VALUES (
        ${courseId},
        'Advanced React Patterns',
        'Learn advanced patterns and best practices',
        1,
        NOW(),
        NOW()
      )
    `;

    const section2 = await prisma.$queryRaw`
      SELECT id FROM course_sections 
      WHERE course_id = ${courseId} AND order_index = 1
      LIMIT 1
    `;

    const section2Id = section2[0]?.id;

    // Lesson 2.1: Hooks Deep Dive
    await prisma.$queryRaw`
      INSERT INTO course_lessons (
        section_id,
        title,
        description,
        lesson_type,
        content_url,
        duration_minutes,
        order_index,
        is_preview,
        created_at,
        updated_at
      ) VALUES (
        ${section2Id},
        'React Hooks Masterclass',
        'Everything you need to know about React Hooks',
        'video',
        'https://www.youtube.com/watch?v=TNhaISOUy6Q',
        45,
        0,
        false,
        NOW(),
        NOW()
      )
    `;

    // Lesson 2.2: Advanced Patterns PDF
    await prisma.$queryRaw`
      INSERT INTO course_lessons (
        section_id,
        title,
        description,
        lesson_type,
        content_url,
        duration_minutes,
        order_index,
        is_preview,
        created_at,
        updated_at
      ) VALUES (
        ${section2Id},
        'Design Patterns Cheat Sheet',
        'Comprehensive PDF guide to React design patterns',
        'pdf',
        'https://pdfobject.com/pdf/sample.pdf',
        20,
        1,
        false,
        NOW(),
        NOW()
      )
    `;

    // Create Section 3: Next.js Integration
    await prisma.$queryRaw`
      INSERT INTO course_sections (
        course_id,
        title,
        description,
        order_index,
        created_at,
        updated_at
      ) VALUES (
        ${courseId},
        'Next.js App Router',
        'Modern Next.js development with App Router',
        2,
        NOW(),
        NOW()
      )
    `;

    const section3 = await prisma.$queryRaw`
      SELECT id FROM course_sections 
      WHERE course_id = ${courseId} AND order_index = 2
      LIMIT 1
    `;

    const section3Id = section3[0]?.id;

    // Lesson 3.1: Next.js Intro
    await prisma.$queryRaw`
      INSERT INTO course_lessons (
        section_id,
        title,
        description,
        lesson_type,
        content_url,
        duration_minutes,
        order_index,
        is_preview,
        created_at,
        updated_at
      ) VALUES (
        ${section3Id},
        'Introduction to Next.js 15',
        'Getting started with Next.js App Router',
        'video',
        'https://www.youtube.com/watch?v=Sklc_fQBmcs',
        30,
        0,
        false,
        NOW(),
        NOW()
      )
    `;

    // Lesson 3.2: Article lesson
    await prisma.$queryRaw`
      INSERT INTO course_lessons (
        section_id,
        title,
        description,
        lesson_type,
        content,
        duration_minutes,
        order_index,
        is_preview,
        created_at,
        updated_at
      ) VALUES (
        ${section3Id},
        'Server Components Deep Dive',
        'Understanding Server and Client Components',
        'article',
        '<h1>Server Components in Next.js</h1><p>Server Components are a revolutionary new feature in React and Next.js that allow you to render components on the server...</p><h2>Benefits</h2><ul><li>Zero bundle size</li><li>Direct database access</li><li>Improved performance</li></ul>',
        15,
        1,
        false,
        NOW(),
        NOW()
      )
    `;

    // Add a quiz for Section 1
    await prisma.$queryRaw`
      INSERT INTO course_quizzes (
        section_id,
        title,
        description,
        passing_score,
        time_limit_minutes,
        created_at,
        updated_at
      ) VALUES (
        ${section1Id},
        'React Fundamentals Quiz',
        'Test your knowledge of React basics',
        70,
        30,
        NOW(),
        NOW()
      )
    `;

    const quiz = await prisma.$queryRaw`
      SELECT id FROM course_quizzes 
      WHERE section_id = ${section1Id}
      LIMIT 1
    `;

    const quizId = quiz[0]?.id;

    // Add quiz questions
    await prisma.$queryRaw`
      INSERT INTO quiz_questions (
        quiz_id,
        question_text,
        question_type,
        options,
        correct_answer,
        points,
        order_index,
        created_at,
        updated_at
      ) VALUES (
        ${quizId},
        'What is React primarily used for?',
        'multiple_choice',
        '["Building user interfaces", "Database management", "Server administration", "Network security"]',
        'Building user interfaces',
        10,
        0,
        NOW(),
        NOW()
      ),
      (
        ${quizId},
        'React uses a virtual DOM for performance optimization.',
        'true_false',
        '["True", "False"]',
        'True',
        10,
        1,
        NOW(),
        NOW()
      ),
      (
        ${quizId},
        'What are the benefits of using React Hooks?',
        'essay',
        '[]',
        '',
        20,
        2,
        NOW(),
        NOW()
      )
    `;

    // Enroll the admin user in the course
    await prisma.$queryRaw`
      INSERT INTO course_enrollments (
        user_id,
        course_id,
        enrolled_at,
        status
      ) VALUES (
        ${user.id},
        ${courseId},
        NOW(),
        'active'
      )
      ON CONFLICT (user_id, course_id) DO NOTHING
    `;

    console.log("📊 Test Course Created Successfully!\n");
    console.log("📚 Course Details:");
    console.log(`   Title: Complete React & Next.js Masterclass`);
    console.log(`   Sections: 3`);
    console.log(`   Lessons: 8`);
    console.log(`   - Video lessons: 5 (YouTube + Vimeo)`);
    console.log(`   - PDF lessons: 2`);
    console.log(`   - Article lessons: 1`);
    console.log(`   Quiz: 1 (3 questions)`);
    console.log(`\n🎯 Test URLs:`);
    console.log(`   Course page: http://localhost:3000/courses/${courseId}`);
    console.log(`   Courses list: http://localhost:3000/courses`);

    console.log(`\n✅ You are enrolled in the course!`);
    console.log(`\n🧪 Testing Checklist:`);
    console.log(`   [ ] Video Player - YouTube`);
    console.log(`   [ ] Video Player - Vimeo`);
    console.log(`   [ ] PDF Viewer - Navigation`);
    console.log(`   [ ] PDF Viewer - Zoom`);
    console.log(`   [ ] Progress Tracking`);
    console.log(`   [ ] Mark Complete`);
    console.log(`   [ ] Intelligence Panel`);
    console.log(`   [ ] Section Navigation`);
    console.log(`   [ ] Article View`);
    console.log(`   [ ] Quiz System`);
  } catch (error) {
    console.error("❌ Error creating test course:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestCourse();
