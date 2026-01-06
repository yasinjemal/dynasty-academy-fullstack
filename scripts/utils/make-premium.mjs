// Make a user PREMIUM (for testing ListenMode Phase 2)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function makePremium() {
  try {
    const email = "yasinyutbr@gmail.com"; // Change this to your email

    console.log(`🔍 Looking for user: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("❌ User not found. Please register first.");
      return;
    }

    console.log(`✅ Found user: ${user.name}`);
    console.log(
      `   Current status: ${user.isPremium ? "👑 PREMIUM" : "🆓 FREE"}`
    );

    if (user.isPremium) {
      console.log("✅ User is already PREMIUM!");
      return;
    }

    console.log("📝 Updating user to PREMIUM...");

    // Set premium until 1 year from now
    const premiumUntil = new Date();
    premiumUntil.setFullYear(premiumUntil.getFullYear() + 1);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        isPremium: true,
        premiumUntil: premiumUntil,
      },
    });

    console.log("🎉 Success! User is now PREMIUM!");
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Premium: ${updatedUser.isPremium}`);
    console.log(
      `   Premium Until: ${updatedUser.premiumUntil?.toLocaleDateString()}`
    );
    console.log("");
    console.log("✨ You can now test all Phase 2 features:");
    console.log("   ✅ Cloud Sync (multi-device resume)");
    console.log("   ✅ Streak System (daily gamification)");
    console.log("   ✅ Achievements (auto-unlock)");
    console.log("   ✅ Highlights (cross-device)");
    console.log("   ✅ Analytics (insights dashboard)");
    console.log("   ✅ Mobile Gestures (swipe/pinch)");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

makePremium();
