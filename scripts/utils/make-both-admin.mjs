import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function makeBothAdmin() {
  try {
    console.log("🔧 Making all users ADMIN...\n");

    // Update all users to ADMIN
    const result = await prisma.user.updateMany({
      data: { role: "ADMIN" },
    });

    console.log(`✅ Updated ${result.count} users to ADMIN\n`);

    // Show all users
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
      },
    });

    console.log("👥 All Users:");
    users.forEach((user, index) => {
      console.log(
        `  ${index + 1}. ${user.email} (${user.name || "No name"}) - ${
          user.role
        }`
      );
    });

    console.log("\n✨ Done! Both accounts are now ADMIN.");
    console.log("🔄 Sign out and sign back in to apply changes.\n");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

makeBothAdmin();
