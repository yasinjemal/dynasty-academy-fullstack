import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const achievements = [
  // 📚 READING CATEGORY - Common to Legendary
  {
    key: "first_book",
    name: "First Steps",
    description: "Complete your first book",
    icon: "📖",
    category: "books",
    rarity: "COMMON",
    requirement: 1,
    dynastyPoints: 100,
  },
  {
    key: "bookworm",
    name: "Bookworm",
    description: "Complete 5 books",
    icon: "📚",
    category: "books",
    rarity: "COMMON",
    requirement: 5,
    dynastyPoints: 250,
  },
  {
    key: "avid_reader",
    name: "Avid Reader",
    description: "Complete 10 books",
    icon: "📕",
    category: "books",
    rarity: "RARE",
    requirement: 10,
    dynastyPoints: 500,
  },
  {
    key: "library_master",
    name: "Library Master",
    description: "Complete 25 books",
    icon: "🏛️",
    category: "books",
    rarity: "EPIC",
    requirement: 25,
    dynastyPoints: 1500,
  },
  {
    key: "legendary_scholar",
    name: "Legendary Scholar",
    description: "Complete 50 books",
    icon: "�",
    category: "books",
    rarity: "LEGENDARY",
    requirement: 50,
    dynastyPoints: 5000,
  },

  // 🔥 STREAK CATEGORY - Building consistent habits
  {
    key: "getting_started",
    name: "Getting Started",
    description: "Read for 3 days in a row",
    icon: "🔥",
    category: "streak",
    rarity: "COMMON",
    requirement: 3,
    dynastyPoints: 150,
  },
  {
    key: "week_warrior",
    name: "Week Warrior",
    description: "Maintain a 7-day reading streak",
    icon: "⚡",
    category: "streak",
    rarity: "UNCOMMON",
    requirement: 7,
    dynastyPoints: 300,
  },
  {
    key: "consistency_king",
    name: "Consistency King",
    description: "Maintain a 30-day reading streak",
    icon: "💪",
    category: "streak",
    rarity: "RARE",
    requirement: 30,
    dynastyPoints: 1000,
  },
  {
    key: "unstoppable",
    name: "Unstoppable Force",
    description: "Maintain a 100-day reading streak",
    icon: "🌟",
    category: "streak",
    rarity: "EPIC",
    requirement: 100,
    dynastyPoints: 3000,
  },
  {
    key: "eternal_flame",
    name: "Eternal Flame",
    description: "Maintain a 365-day reading streak",
    icon: "🏆",
    category: "streak",
    rarity: "LEGENDARY",
    requirement: 365,
    dynastyPoints: 10000,
  },

  // ⏱️ READING TIME CATEGORY - Total minutes read
  {
    key: "quick_session",
    name: "Quick Session",
    description: "Read for 30 minutes total",
    icon: "⏰",
    category: "minutes",
    rarity: "COMMON",
    requirement: 30,
    dynastyPoints: 50,
  },
  {
    key: "dedicated_reader",
    name: "Dedicated Reader",
    description: "Read for 10 hours total",
    icon: "�",
    category: "minutes",
    rarity: "UNCOMMON",
    requirement: 600,
    dynastyPoints: 400,
  },
  {
    key: "time_investor",
    name: "Time Investor",
    description: "Read for 50 hours total",
    icon: "⌛",
    category: "minutes",
    rarity: "RARE",
    requirement: 3000,
    dynastyPoints: 1200,
  },
  {
    key: "marathon_reader",
    name: "Marathon Reader",
    description: "Read for 100 hours total",
    icon: "🏃",
    category: "minutes",
    rarity: "EPIC",
    requirement: 6000,
    dynastyPoints: 2500,
  },
  {
    key: "time_master",
    name: "Master of Time",
    description: "Read for 500 hours total",
    icon: "⏳",
    category: "minutes",
    rarity: "LEGENDARY",
    requirement: 30000,
    dynastyPoints: 8000,
  },

  // 👥 SOCIAL CATEGORY - Followers and community
  {
    key: "first_follower",
    name: "First Fan",
    description: "Get your first follower",
    icon: "👋",
    category: "followers",
    rarity: "COMMON",
    requirement: 1,
    dynastyPoints: 100,
  },
  {
    key: "growing_influence",
    name: "Growing Influence",
    description: "Reach 10 followers",
    icon: "📈",
    category: "followers",
    rarity: "UNCOMMON",
    requirement: 10,
    dynastyPoints: 300,
  },
  {
    key: "community_builder",
    name: "Community Builder",
    description: "Reach 50 followers",
    icon: "🌐",
    category: "followers",
    rarity: "RARE",
    requirement: 50,
    dynastyPoints: 800,
  },
  {
    key: "influencer",
    name: "Influencer",
    description: "Reach 100 followers",
    icon: "🎯",
    category: "followers",
    rarity: "EPIC",
    requirement: 100,
    dynastyPoints: 2000,
  },
  {
    key: "celebrity",
    name: "Celebrity",
    description: "Reach 500 followers",
    icon: "⭐",
    category: "followers",
    rarity: "LEGENDARY",
    requirement: 500,
    dynastyPoints: 7000,
  },

  // 💎 DYNASTY SCORE CATEGORY - Overall achievement
  {
    key: "rising_star",
    name: "Rising Star",
    description: "Reach 1,000 Dynasty Score",
    icon: "🌠",
    category: "dynastyScore",
    rarity: "UNCOMMON",
    requirement: 1000,
    dynastyPoints: 200,
  },
  {
    key: "dynasty_champion",
    name: "Dynasty Champion",
    description: "Reach 5,000 Dynasty Score",
    icon: "🏅",
    category: "dynastyScore",
    rarity: "RARE",
    requirement: 5000,
    dynastyPoints: 750,
  },
  {
    key: "dynasty_elite",
    name: "Dynasty Elite",
    description: "Reach 10,000 Dynasty Score",
    icon: "💫",
    category: "dynastyScore",
    rarity: "EPIC",
    requirement: 10000,
    dynastyPoints: 2000,
  },
  {
    key: "dynasty_legend",
    name: "Dynasty Legend",
    description: "Reach 25,000 Dynasty Score",
    icon: "�",
    category: "dynastyScore",
    rarity: "LEGENDARY",
    requirement: 25000,
    dynastyPoints: 6000,
  },

  // 🎯 SPECIAL ACHIEVEMENTS - Unique milestones
  {
    key: "early_bird",
    name: "Early Bird",
    description: "Read before 8 AM",
    icon: "🌅",
    category: "special",
    rarity: "UNCOMMON",
    requirement: 1,
    dynastyPoints: 200,
  },
  {
    key: "night_owl",
    name: "Night Owl",
    description: "Read after 10 PM",
    icon: "🦉",
    category: "special",
    rarity: "UNCOMMON",
    requirement: 1,
    dynastyPoints: 200,
  },
  {
    key: "speed_demon",
    name: "Speed Demon",
    description: "Complete a book in under 3 hours",
    icon: "⚡",
    category: "special",
    rarity: "RARE",
    requirement: 1,
    dynastyPoints: 600,
  },
  {
    key: "perfectionist",
    name: "Perfectionist",
    description: "Complete 5 daily challenges in a row",
    icon: "✨",
    category: "special",
    rarity: "EPIC",
    requirement: 5,
    dynastyPoints: 1500,
  },
  {
    key: "power_user",
    name: "Power User",
    description: "Use 10 power-ups",
    icon: "🚀",
    category: "special",
    rarity: "RARE",
    requirement: 10,
    dynastyPoints: 800,
  },
  {
    key: "completionist",
    name: "Completionist",
    description: "Unlock all other achievements",
    icon: "💯",
    category: "special",
    rarity: "LEGENDARY",
    requirement: 29,
    dynastyPoints: 15000,
  },
];

async function main() {
  console.log("� Seeding Achievements...\n");

  // Use transaction to ensure all-or-nothing
  await prisma.$transaction(
    achievements.map((achievement) =>
      prisma.achievement.upsert({
        where: { key: achievement.key },
        update: achievement,
        create: achievement,
      })
    )
  );

  console.log("✅ Achievements seeded!\n");
  console.log(`📊 Total achievements: ${achievements.length}`);
  console.log(
    `   - COMMON: ${achievements.filter((a) => a.rarity === "COMMON").length}`
  );
  console.log(
    `   - UNCOMMON: ${
      achievements.filter((a) => a.rarity === "UNCOMMON").length
    }`
  );
  console.log(
    `   - RARE: ${achievements.filter((a) => a.rarity === "RARE").length}`
  );
  console.log(
    `   - EPIC: ${achievements.filter((a) => a.rarity === "EPIC").length}`
  );
  console.log(
    `   - LEGENDARY: ${
      achievements.filter((a) => a.rarity === "LEGENDARY").length
    }`
  );
  console.log("\n🎉 All achievements ready for your users!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding achievements:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
