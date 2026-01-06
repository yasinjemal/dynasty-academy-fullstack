import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDailyChallenges() {
  console.log("🌱 Seeding Daily Challenges...");

  const challenges = [
    {
      key: "morning_reader",
      name: "Morning Reader",
      description: "Read 30 minutes before noon",
      type: "reading_time",
      target: 30,
      difficulty: "easy",
      xpReward: 50,
      coinReward: 10,
      icon: "☕",
    },
    {
      key: "speed_reader",
      name: "Speed Reader",
      description: "Complete 3 chapters today",
      type: "chapters",
      target: 3,
      difficulty: "medium",
      xpReward: 100,
      coinReward: 25,
      icon: "⚡",
    },
    {
      key: "keep_the_flame",
      name: "Keep the Flame",
      description: "Maintain your reading streak",
      type: "streak",
      target: 1,
      difficulty: "easy",
      xpReward: 25,
      coinReward: 5,
      icon: "🔥",
    },
    {
      key: "marathon_session",
      name: "Marathon Session",
      description: "Read for 2 hours straight",
      type: "reading_time",
      target: 120,
      difficulty: "insane",
      xpReward: 500,
      coinReward: 100,
      icon: "🏃",
    },
  ];

  for (const challenge of challenges) {
    await prisma.dailyChallenge.upsert({
      where: { key: challenge.key },
      update: challenge,
      create: challenge,
    });
    console.log(`  ✓ Created challenge: ${challenge.name}`);
  }

  console.log("✅ Daily Challenges seeded!\n");
}

async function seedPowerUps() {
  console.log("🌱 Seeding Power-Ups...");

  const powerUps = [
    {
      key: "xp_boost_2x",
      name: "Double XP",
      description: "Earn 2x Dynasty Score from all activities",
      type: "xp_multiplier",
      multiplier: 2.0,
      duration: 24, // hours
      coinCost: 500,
      rarity: "common",
      icon: "⚡",
    },
    {
      key: "xp_boost_5x",
      name: "Mega Boost",
      description: "Earn 5x XP from all activities",
      type: "xp_multiplier",
      multiplier: 5.0,
      duration: 1, // 1 hour
      coinCost: 1000,
      rarity: "legendary",
      icon: "👑",
    },
    {
      key: "streak_saver",
      name: "Streak Saver",
      description: "Protect your streak for one day",
      type: "streak_protection",
      multiplier: null,
      duration: 24,
      coinCost: 300,
      rarity: "rare",
      icon: "🔥",
    },
  ];

  for (const powerUp of powerUps) {
    await prisma.powerUp.upsert({
      where: { key: powerUp.key },
      update: powerUp,
      create: powerUp,
    });
    console.log(`  ✓ Created power-up: ${powerUp.name}`);
  }

  console.log("✅ Power-Ups seeded!\n");
}

async function main() {
  try {
    await seedDailyChallenges();
    await seedPowerUps();
    console.log("🎉 All seed data created successfully!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
