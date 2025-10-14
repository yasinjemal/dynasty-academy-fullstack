import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUsers() {
  console.log("\n===== CHECKING USERS IN DATABASE =====\n");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  console.log(`Total users: ${users.length}\n`);

  if (users.length === 0) {
    console.log("❌ NO USERS FOUND IN DATABASE!");
    console.log("\nThis is the problem! NextAuth is creating JWT sessions");
    console.log("but not creating user records in the database.");
  } else {
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.name} (${u.email}) [ID: ${u.id}]`);
    });
  }

  console.log("\n");
  await prisma.$disconnect();
}

checkUsers().catch(console.error);
