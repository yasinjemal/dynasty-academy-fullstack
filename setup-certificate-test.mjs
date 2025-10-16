import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setupCertificateTest() {
  try {
    console.log("\n🎯 SETTING UP CERTIFICATE TEST ENVIRONMENT\n");

    // Step 1: Check for existing users
    console.log("Step 1: Checking for users...");
    const users = await prisma.user.findMany({ take: 5 });

    if (users.length === 0) {
      console.log("❌ No users found. Creating test user...");
      const testUser = await prisma.user.create({
        data: {
          email: "test@dynastyacademy.com",
          name: "Test Student",
          role: "USER",
        },
      });
      console.log(
        `✅ Created test user: ${testUser.email} (ID: ${testUser.id})\n`
      );
      users.push(testUser);
    } else {
      console.log(`✅ Found ${users.length} user(s):`);
      users.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.name || u.email} (ID: ${u.id})`);
      });
      console.log("");
    }

    const testUser = users[0];

    // Step 2: Check for existing courses
    console.log("Step 2: Checking for courses...");
    const courses = await prisma.courses.findMany({
      take: 5,
      include: {
        course_sections: {
          include: {
            course_lessons: true,
          },
        },
      },
    });

    if (courses.length === 0) {
      console.log("❌ No courses found. You need to create a course first.\n");
      console.log("📝 TO CREATE A TEST COURSE:");
      console.log("   1. Visit: http://localhost:3000/courses");
      console.log("   2. Or run the create-test-course script\n");
      await prisma.$disconnect();
      return;
    }

    console.log(`✅ Found ${courses.length} course(s):`);
    courses.forEach((c, i) => {
      const lessonsCount = c.course_sections.reduce(
        (sum, section) => sum + section.course_lessons.length,
        0
      );
      console.log(`   ${i + 1}. ${c.title}`);
      console.log(`      - ID: ${c.id}`);
      console.log(`      - Sections: ${c.course_sections.length}`);
      console.log(`      - Lessons: ${lessonsCount}`);
      console.log(
        `      - Certificate Enabled: ${c.certificateEnabled ? "✅" : "❌"}`
      );
    });
    console.log("");

    const testCourse = courses[0];

    // Enable certificates on the test course if not already enabled
    if (!testCourse.certificateEnabled) {
      console.log("Step 3: Enabling certificates on test course...");
      await prisma.courses.update({
        where: { id: testCourse.id },
        data: { certificateEnabled: true },
      });
      console.log("✅ Certificates enabled!\n");
    } else {
      console.log("Step 3: ✅ Certificates already enabled\n");
    }

    // Step 4: Check for enrollment
    console.log("Step 4: Checking enrollment status...");
    let enrollment = await prisma.course_enrollments.findFirst({
      where: {
        userId: testUser.id,
        courseId: testCourse.id,
      },
    });

    if (!enrollment) {
      console.log("Creating test enrollment...");

      const totalLessons =
        testCourse.course_sections?.reduce(
          (sum, s) => sum + (s.course_lessons?.length || 0),
          0
        ) || 0;

      enrollment = await prisma.course_enrollments.create({
        data: {
          id: `enr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: testUser.id,
          courseId: testCourse.id,
          status: "in_progress",
          progress: 0,
          completedLessons: 0,
          totalLessons: totalLessons,
          totalWatchTime: 0,
          enrolledAt: new Date(),
        },
      });
      console.log("✅ Enrollment created!\n");
    } else {
      console.log("✅ Already enrolled!\n");
    }

    // Step 5: Set to 100% complete
    console.log("Step 5: Setting course to 100% complete...");
    const totalLessons =
      testCourse.course_sections?.reduce(
        (sum, s) => sum + (s.course_lessons?.length || 0),
        0
      ) || 0;

    await prisma.course_enrollments.update({
      where: { id: enrollment.id },
      data: {
        progress: 100,
        completedLessons: totalLessons,
        totalLessons: totalLessons,
        status: "completed",
        completedAt: new Date(),
      },
    });
    console.log("✅ Course marked as 100% complete!\n");

    // Step 6: Summary
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 TEST ENVIRONMENT READY!\n");
    console.log("📋 Test Details:");
    console.log(`   User: ${testUser.name || testUser.email}`);
    console.log(`   User ID: ${testUser.id}`);
    console.log(`   Course: ${testCourse.title}`);
    console.log(`   Course ID: ${testCourse.id}`);
    console.log(`   Progress: 100%`);
    console.log(`   Status: completed`);
    console.log(`   Certificates Enabled: ✅`);
    console.log("");
    console.log("🧪 NEXT STEPS TO TEST CERTIFICATES:");
    console.log("");
    console.log("1️⃣  Start dev server:");
    console.log("   npm run dev");
    console.log("");
    console.log("2️⃣  Login as test user:");
    console.log(`   Email: ${testUser.email}`);
    console.log("   (or use your existing account)");
    console.log("");
    console.log("3️⃣  Visit course page:");
    console.log(`   http://localhost:3000/courses/${testCourse.id}`);
    console.log("");
    console.log('4️⃣  Click "Generate Certificate" button');
    console.log("");
    console.log("5️⃣  Test verification page:");
    console.log("   After generating, visit:");
    console.log("   http://localhost:3000/certificates/[VERIFICATION-CODE]");
    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

setupCertificateTest();
