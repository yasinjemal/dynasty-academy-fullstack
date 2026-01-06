// Check premium status of all users
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkPremiumUsers() {
  console.log("\n===== PREMIUM USERS STATUS =====\n");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isPremium: true,
      premiumUntil: true,
      role: true,
    },
  });

  console.log(`Total users: ${users.length}\n`);

  const premiumUsers = users.filter((u) => u.isPremium);
  const freeUsers = users.filter((u) => !u.isPremium);

  console.log(`👑 PREMIUM USERS: ${premiumUsers.length}`);
  premiumUsers.forEach((u, i) => {
    const until = u.premiumUntil
      ? u.premiumUntil.toLocaleDateString()
      : "No expiry";
    console.log(`   ${i + 1}. ${u.name} (${u.email}) - Until: ${until}`);
  });

  console.log(`\n🆓 FREE USERS: ${freeUsers.length}`);
  freeUsers.forEach((u, i) => {
    console.log(`   ${i + 1}. ${u.name} (${u.email})`);
  });

  console.log("\n");
  await prisma.$disconnect();
}

checkPremiumUsers().catch(console.error);
