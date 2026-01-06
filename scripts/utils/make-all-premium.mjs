// Make ALL users PREMIUM (for testing revolutionary features!)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function makeAllPremium() {
  console.log("\n===== MAKING ALL USERS PREMIUM =====\n");

  // Set premium until 1 year from now
  const premiumUntil = new Date();
  premiumUntil.setFullYear(premiumUntil.getFullYear() + 1);

  const result = await prisma.user.updateMany({
    data: {
      isPremium: true,
      premiumUntil: premiumUntil,
    },
  });

  console.log(`✅ Updated ${result.count} users to PREMIUM!`);
  console.log(`   Premium until: ${premiumUntil.toLocaleDateString()}`);

  // Show all users
  const users = await prisma.user.findMany({
    select: {
      name: true,
      email: true,
      isPremium: true,
      premiumUntil: true,
    },
  });

  console.log("\n👑 ALL PREMIUM USERS:\n");
  users.forEach((u, i) => {
    const until = u.premiumUntil
      ? u.premiumUntil.toLocaleDateString()
      : "No expiry";
    console.log(
      `   ${i + 1}. ${u.name || "No name"} (${u.email}) - Until: ${until}`
    );
  });

  console.log("\n🔥 ALL USERS CAN NOW ACCESS:");
  console.log("   ✅ 6 Listening Atmosphere Presets");
  console.log("   ✅ Audio Layering (Music + Narration)");
  console.log("   ✅ Voice Mood Sync");
  console.log("   ✅ Time-Based Listening Rituals");
  console.log("   ✅ Audio-Reactive Visuals");
  console.log("   ✅ 6 Atmosphere Presets in Reader");
  console.log("   ✅ Immersive Backgrounds");
  console.log("   ✅ Audio Atmosphere Sync");
  console.log("   ✅ Parallax Effects");
  console.log("   ✅ AI Time-Based Switching");
  console.log("\n💎 COMPLETE SENSORY IMMERSION UNLOCKED!\n");

  await prisma.$disconnect();
}

makeAllPremium().catch(console.error);
