/**
 * 🎮 DYNASTY DUELS - TEST DATA GENERATOR
 * 
 * This script creates demo data for testing the duels system:
 * - Creates sample user stats
 * - Generates test duels
 * - Populates leaderboard
 * 
 * Run with: node generate-test-duels.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎮 Generating Dynasty Duels test data...\n');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
      }
    });

    if (users.length < 2) {
      console.log('❌ Need at least 2 users in database to create test duels!');
      console.log('Please register some users first.');
      return;
    }

    console.log(`✅ Found ${users.length} users\n`);

    // Create DuelStats for each user
    for (const user of users) {
      const existingStats = await prisma.duelStats.findUnique({
        where: { userId: user.id }
      });

      if (!existingStats) {
        const randomWins = Math.floor(Math.random() * 20);
        const randomLosses = Math.floor(Math.random() * 15);
        const randomDraws = Math.floor(Math.random() * 5);
        const totalDuels = randomWins + randomLosses + randomDraws;
        const xp = randomWins * 150 + randomDraws * 50;
        
        let tier = 'BRONZE';
        if (xp >= 50000) tier = 'LEGEND';
        else if (xp >= 20000) tier = 'MASTER';
        else if (xp >= 10000) tier = 'DIAMOND';
        else if (xp >= 6000) tier = 'PLATINUM';
        else if (xp >= 3000) tier = 'GOLD';
        else if (xp >= 1000) tier = 'SILVER';

        await prisma.duelStats.create({
          data: {
            userId: user.id,
            totalDuels,
            wins: randomWins,
            losses: randomLosses,
            draws: randomDraws,
            currentStreak: Math.floor(Math.random() * 5),
            longestStreak: Math.floor(Math.random() * 10),
            tier,
            xp,
            coins: xp / 10,
            perfectGames: Math.floor(randomWins / 5),
            highestScore: 500 + Math.floor(Math.random() * 500),
            totalXpEarned: xp + Math.floor(Math.random() * 500),
            totalXpLost: randomLosses * 50,
          }
        });

        console.log(`✅ Created stats for ${user.name}: ${tier} tier with ${xp} XP`);
      } else {
        console.log(`⏭️  Stats already exist for ${user.name}`);
      }
    }

    // Get a book for duels
    const books = await prisma.book.findMany({
      take: 5,
      where: {
        publishedAt: { not: null }
      }
    });

    if (books.length === 0) {
      console.log('\n⚠️  No published books found. Cannot create duels.');
      console.log('Please publish some books first.');
      return;
    }

    console.log(`\n✅ Found ${books.length} books for duels\n`);

    // Create some completed duels
    const duelsToCreate = Math.min(10, users.length * 2);
    
    for (let i = 0; i < duelsToCreate; i++) {
      const challenger = users[Math.floor(Math.random() * users.length)];
      let opponent = users[Math.floor(Math.random() * users.length)];
      
      // Ensure different users
      while (opponent.id === challenger.id) {
        opponent = users[Math.floor(Math.random() * users.length)];
      }

      const book = books[Math.floor(Math.random() * books.length)];
      
      const challengerScore = 300 + Math.floor(Math.random() * 400);
      const opponentScore = 300 + Math.floor(Math.random() * 400);
      const winnerId = challengerScore > opponentScore ? challenger.id : opponent.id;

      const existingDuel = await prisma.duel.findFirst({
        where: {
          challengerId: challenger.id,
          opponentId: opponent.id,
          bookId: book.id,
        }
      });

      if (!existingDuel) {
        await prisma.duel.create({
          data: {
            challengerId: challenger.id,
            opponentId: opponent.id,
            bookId: book.id,
            xpBet: 100,
            coinBet: 10,
            status: 'COMPLETED',
            challengerScore,
            opponentScore,
            winnerId,
            completedAt: new Date(),
          }
        });

        console.log(`✅ Created duel: ${challenger.name} vs ${opponent.name} (Winner: ${winnerId === challenger.id ? challenger.name : opponent.name})`);
      }
    }

    // Update global ranks
    const allStats = await prisma.duelStats.findMany({
      orderBy: { xp: 'desc' },
      select: { userId: true }
    });

    for (let i = 0; i < allStats.length; i++) {
      await prisma.duelStats.update({
        where: { userId: allStats[i].userId },
        data: { rank: i + 1 }
      });
    }

    console.log('\n✅ Updated global rankings\n');

    // Final stats
    const totalStats = await prisma.duelStats.count();
    const totalDuels = await prisma.duel.count();
    
    console.log('📊 FINAL STATS:');
    console.log(`   - Total Players: ${totalStats}`);
    console.log(`   - Total Duels: ${totalDuels}`);
    console.log(`   - Books Available: ${books.length}`);
    
    console.log('\n🎉 Test data generated successfully!');
    console.log('🚀 Visit http://localhost:3001/duels/leaderboard to see results!\n');

  } catch (error) {
    console.error('❌ Error generating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
