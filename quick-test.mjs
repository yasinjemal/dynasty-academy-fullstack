import { PrismaClient } from '@prisma/client';

async function testAchievements() {
  const prisma = new PrismaClient();
  
  try {
    const achievements = await prisma.achievement.findMany();
    console.log('🏆 Achievements in database:');
    achievements.forEach(achievement => {
      console.log(`  ✅ ${achievement.name} - ${achievement.description}`);
    });
    
    const userCount = await prisma.user.count();
    console.log(`\n👥 Users: ${userCount}`);
    
    const bookCount = await prisma.book.count();
    console.log(`📚 Books: ${bookCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAchievements();