import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkCertificateStatus() {
  try {
    console.log("\n📚 CHECKING COURSE ENROLLMENTS FOR CERTIFICATE TESTING\n");

    // Get all enrollments with user and course info
    const enrollments = await prisma.course_enrollments.findMany({
      include: {
        courses: {
          select: {
            id: true,
            title: true,
            certificateEnabled: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
      take: 10,
    });

    if (enrollments.length === 0) {
      console.log(
        "❌ No enrollments found. You need to enroll in a course first.\n"
      );
      return;
    }

    console.log(`Found ${enrollments.length} enrollment(s):\n`);

    enrollments.forEach((enrollment, index) => {
      console.log(
        `${index + 1}. USER: ${enrollment.users.name || enrollment.users.email}`
      );
      console.log(`   Course: ${enrollment.courses.title}`);
      console.log(`   Progress: ${enrollment.progress}%`);
      console.log(`   Status: ${enrollment.status}`);
      console.log(
        `   Completed At: ${enrollment.completedAt || "Not completed"}`
      );
      console.log(
        `   Certificate Enabled: ${
          enrollment.courses.certificateEnabled ? "✅" : "❌"
        }`
      );
      console.log(`   Course ID: ${enrollment.courses.id}`);
      console.log(`   User ID: ${enrollment.users.id}`);

      if (enrollment.progress === 100 && enrollment.completedAt) {
        console.log(`   🎓 READY FOR CERTIFICATE!`);
      } else if (enrollment.progress >= 95) {
        console.log(`   ⚠️  Almost ready (${enrollment.progress}% complete)`);
      } else {
        console.log(
          `   ⏳ In progress (${100 - enrollment.progress}% remaining)`
        );
      }
      console.log("");
    });

    // Check for existing certificates
    const certificates = await prisma.certificates.findMany({
      include: {
        users: {
          select: {
            name: true,
            email: true,
          },
        },
        courses: {
          select: {
            title: true,
          },
        },
      },
    });

    if (certificates.length > 0) {
      console.log("\n🎓 EXISTING CERTIFICATES:\n");
      certificates.forEach((cert, index) => {
        console.log(`${index + 1}. ${cert.users.name || cert.users.email}`);
        console.log(`   Course: ${cert.courses.title}`);
        console.log(`   Verification Code: ${cert.verificationCode}`);
        console.log(`   Issued: ${cert.issuedAt}`);
        console.log(`   Verify at: /certificates/${cert.verificationCode}`);
        console.log("");
      });
    } else {
      console.log("\n✨ No certificates generated yet.\n");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCertificateStatus();
