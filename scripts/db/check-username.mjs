import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUsername() {
  try {
    const user = await prisma.user.findUnique({
      where: { username: "testyjaaw" },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        usernameChangedAt: true,
        isBanned: true,
        isSuspended: true,
        isPrivate: true,
      },
    });

    console.log("User found:", JSON.stringify(user, null, 2));

    if (!user) {
      console.log('\n❌ Username "testyjaaw" does NOT exist in database');
    } else {
      console.log('\n✅ Username "testyjaaw" EXISTS in database');
      console.log("Status checks:");
      console.log("  - Banned:", user.isBanned);
      console.log("  - Suspended:", user.isSuspended);
      console.log("  - Private:", user.isPrivate);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsername();
