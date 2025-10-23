import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedEngagementData() {
  console.log("🌱 Seeding engagement test data...\n");

  try {
    // Get existing users (or create test users if none exist)
    let users = await prisma.user.findMany({
      where: { role: "USER" }, // Students are role USER
      take: 20,
    });

    // If no students exist, create some test students
    if (users.length === 0) {
      console.log("📝 No students found. Creating test students...");

      const testStudents = [
        { name: "Alex Johnson", email: "alex.johnson@test.com", xp: 450 },
        { name: "Maria Garcia", email: "maria.garcia@test.com", xp: 1200 },
        { name: "James Wilson", email: "james.wilson@test.com", xp: 150 },
        { name: "Sarah Chen", email: "sarah.chen@test.com", xp: 2500 },
        { name: "Michael Brown", email: "michael.brown@test.com", xp: 50 },
        { name: "Emma Davis", email: "emma.davis@test.com", xp: 3200 },
        { name: "David Lee", email: "david.lee@test.com", xp: 800 },
        { name: "Lisa Anderson", email: "lisa.anderson@test.com", xp: 25 },
        { name: "Robert Taylor", email: "robert.taylor@test.com", xp: 1800 },
        { name: "Jennifer Martin", email: "jennifer.martin@test.com", xp: 600 },
      ];

      for (const student of testStudents) {
        await prisma.user.create({
          data: {
            name: student.name,
            email: student.email,
            xp: student.xp,
            role: "USER", // USER role for students
            password: "$2b$10$dummyhashforseeddataonly", // Not a real bcrypt hash
          },
        });
      }

      users = await prisma.user.findMany({
        where: { role: "USER" }, // Students are role USER
        take: 20,
      });

      console.log(`✅ Created ${users.length} test students\n`);
    }

    console.log(
      `👥 Found ${users.length} students. Creating engagement data...\n`
    );

    // Create engagement scores with different risk levels
    const now = new Date();
    const riskProfiles = [
      {
        dropOffRisk: 85,
        weeklyRisk: 90,
        monthlyRisk: 80,
        signals: {
          loginFrequency: 0.2,
          daysSinceLastLogin: 15,
          avgSessionMinutes: 5,
          lessonsCompletedPerWeek: 0.5,
          quizScoreAvg: 45,
          streakDays: 0,
          progressVelocity: 0.1,
        },
        recommendedInterventions: [
          "human_outreach",
          "discount_offer",
          "streak_warning",
        ],
        confidence: 92,
      },
      {
        dropOffRisk: 65,
        weeklyRisk: 70,
        monthlyRisk: 60,
        signals: {
          loginFrequency: 2,
          daysSinceLastLogin: 5,
          avgSessionMinutes: 15,
          lessonsCompletedPerWeek: 2,
          quizScoreAvg: 65,
          streakDays: 3,
          progressVelocity: 0.3,
        },
        recommendedInterventions: [
          "personalized_content",
          "achievement_notification",
        ],
        confidence: 78,
      },
      {
        dropOffRisk: 45,
        weeklyRisk: 50,
        monthlyRisk: 40,
        signals: {
          loginFrequency: 4,
          daysSinceLastLogin: 2,
          avgSessionMinutes: 25,
          lessonsCompletedPerWeek: 4,
          quizScoreAvg: 75,
          streakDays: 7,
          progressVelocity: 0.5,
        },
        recommendedInterventions: ["milestone_celebration", "peer_comparison"],
        confidence: 85,
      },
      {
        dropOffRisk: 20,
        weeklyRisk: 25,
        monthlyRisk: 15,
        signals: {
          loginFrequency: 6,
          daysSinceLastLogin: 0,
          avgSessionMinutes: 45,
          lessonsCompletedPerWeek: 8,
          quizScoreAvg: 90,
          streakDays: 15,
          progressVelocity: 0.8,
        },
        recommendedInterventions: ["gentle_reminder"],
        confidence: 95,
      },
    ];

    // Assign risk profiles to users
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const profileIndex = i % riskProfiles.length;
      const profile = riskProfiles[profileIndex];

      // Create engagement score
      await prisma.engagementScore.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          dropOffRisk: profile.dropOffRisk,
          weeklyRisk: profile.weeklyRisk,
          monthlyRisk: profile.monthlyRisk,
          signals: profile.signals,
          interventions: {
            recommended: profile.recommendedInterventions,
            history: [],
          }, // Required field
          lastCalculated: now,
        },
        update: {
          dropOffRisk: profile.dropOffRisk,
          weeklyRisk: profile.weeklyRisk,
          monthlyRisk: profile.monthlyRisk,
          signals: profile.signals,
          interventions: {
            recommended: profile.recommendedInterventions,
            history: [],
          },
          lastCalculated: now,
        },
      });

      console.log(
        `📊 ${user.name}: ${profile.dropOffRisk}% risk (${
          profile.dropOffRisk >= 80
            ? "🔴 CRITICAL"
            : profile.dropOffRisk >= 60
            ? "🟠 HIGH"
            : profile.dropOffRisk >= 40
            ? "🟡 MEDIUM"
            : "🟢 LOW"
        })`
      );
    }

    console.log("\n✅ Engagement scores created!\n");

    // Create streaks
    console.log("🔥 Creating streaks...\n");

    const streakProfiles = [
      { current: 0, longest: 3, freezes: 0, milestones: [] },
      { current: 3, longest: 7, freezes: 0, milestones: [] },
      { current: 7, longest: 10, freezes: 1, milestones: [7] },
      { current: 15, longest: 15, freezes: 1, milestones: [7, 14] },
      { current: 30, longest: 30, freezes: 2, milestones: [7, 14, 30] },
    ];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const streakIndex = i % streakProfiles.length;
      const streakProfile = streakProfiles[streakIndex];

      const lastActiveDate = new Date();
      lastActiveDate.setDate(
        lastActiveDate.getDate() - (streakProfile.current === 0 ? 3 : 0)
      );

      await prisma.streak.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          currentStreak: streakProfile.current,
          longestStreak: streakProfile.longest,
          lastActivityDate: lastActiveDate, // Fixed field name
          freezesAvailable: streakProfile.freezes,
          milestones: streakProfile.milestones,
        },
        update: {
          currentStreak: streakProfile.current,
          longestStreak: streakProfile.longest,
          lastActivityDate: lastActiveDate, // Fixed field name
          freezesAvailable: streakProfile.freezes,
          milestones: streakProfile.milestones,
        },
      });

      console.log(
        `🔥 ${user.name}: ${streakProfile.current} day streak (longest: ${streakProfile.longest})`
      );
    }

    console.log("\n✅ Streaks created!\n");

    // Create behavior events
    console.log("📈 Creating behavior events...\n");

    const eventTypes = [
      "page_view",
      "lesson_start",
      "lesson_complete",
      "quiz_attempt",
      "quiz_complete",
      "video_watch",
      "note_taken",
      "login",
    ];

    let totalEvents = 0;

    for (const user of users) {
      // Create 5-20 random events per user
      const eventCount = Math.floor(Math.random() * 15) + 5;

      for (let i = 0; i < eventCount; i++) {
        const eventType =
          eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const daysAgo = Math.floor(Math.random() * 30);
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - daysAgo);

        await prisma.behaviorEvent.create({
          data: {
            userId: user.id,
            eventType,
            timestamp,
            eventData: {
              duration: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
              completed: Math.random() > 0.3,
              deviceType: ["desktop", "mobile", "tablet"][
                Math.floor(Math.random() * 3)
              ], // Store in eventData
            },
            sessionId: `session-${user.id}-${i}`,
            platform: ["web", "ios", "android"][Math.floor(Math.random() * 3)],
          },
        });

        totalEvents++;
      }
    }

    console.log(`✅ Created ${totalEvents} behavior events\n`);

    // Create personalization profiles
    console.log("🎯 Creating personalization profiles...\n");

    const learningStyles = [
      "VISUAL",
      "AUDITORY",
      "KINESTHETIC",
      "READING_WRITING",
    ];
    const paces = ["SLOW", "MEDIUM", "FAST"];
    const difficulties = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

    for (const user of users) {
      await prisma.personalizationProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          learningStyle:
            learningStyles[Math.floor(Math.random() * learningStyles.length)],
          preferredPace: paces[Math.floor(Math.random() * paces.length)],
          preferredDifficulty:
            difficulties[Math.floor(Math.random() * difficulties.length)],
          optimalStudyTime: `${Math.floor(Math.random() * 12) + 8}:00`, // 8am-8pm
          preferredFormat: ["video", "text", "interactive", "audio"][
            Math.floor(Math.random() * 4)
          ],
          motivators: {
            competition: Math.random() > 0.5,
            achievement: Math.random() > 0.5,
            social: Math.random() > 0.5,
            progress: Math.random() > 0.5,
          },
        },
        update: {},
      });
    }

    console.log(`✅ Created ${users.length} personalization profiles\n`);

    // Summary
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 ENGAGEMENT DATA SEEDED SUCCESSFULLY! 🎉");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    const criticalCount = await prisma.engagementScore.count({
      where: { dropOffRisk: { gte: 80 } },
    });

    const highCount = await prisma.engagementScore.count({
      where: { dropOffRisk: { gte: 60, lt: 80 } },
    });

    const mediumCount = await prisma.engagementScore.count({
      where: { dropOffRisk: { gte: 40, lt: 60 } },
    });

    console.log("📊 SUMMARY:");
    console.log(`   👥 Students: ${users.length}`);
    console.log(`   🔴 Critical Risk: ${criticalCount}`);
    console.log(`   🟠 High Risk: ${highCount}`);
    console.log(`   🟡 Medium Risk: ${mediumCount}`);
    console.log(`   📈 Total Events: ${totalEvents}`);
    console.log(`   🔥 Streaks Created: ${users.length}`);
    console.log(`   🎯 Profiles Created: ${users.length}\n`);

    console.log("🚀 NEXT STEPS:");
    console.log("   1. Visit: http://localhost:3000/admin/engagement");
    console.log("   2. See the at-risk students in real-time!");
    console.log('   3. Click "Recalculate All" to refresh predictions\n');
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedEngagementData().catch((e) => {
  console.error(e);
  process.exit(1);
});
