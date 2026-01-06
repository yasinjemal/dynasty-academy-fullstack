import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';

async function testComplete() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 === DYNASTY ACADEMY - SYSTEM TEST ===\n');
    
    // Test 1: Database Connection
    console.log('1️⃣ Testing Database Connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('   ✅ Database connected successfully\n');
    
    // Test 2: Achievements
    const achievements = await prisma.achievement.findMany();
    console.log('2️⃣ Achievements System:');
    console.log(`   ✅ ${achievements.length} achievements loaded`);
    achievements.slice(0, 3).forEach(a => {
      console.log(`      • ${a.name}`);
    });
    console.log('');
    
    // Test 3: Users & Books
    const userCount = await prisma.user.count();
    const bookCount = await prisma.book.count();
    console.log('3️⃣ Content Status:');
    console.log(`   👥 Users: ${userCount}`);
    console.log(`   📚 Books: ${bookCount}`);
    
    // Test 4: Book Details
    if (bookCount > 0) {
      const books = await prisma.book.findMany({
        take: 3,
        select: {
          id: true,
          title: true,
          slug: true,
          totalPages: true,
          previewPages: true,
          contentType: true,
          filePath: true
        }
      });
      
      console.log('\n4️⃣ Sample Books:');
      books.forEach((book, i) => {
        console.log(`   ${i + 1}. ${book.title}`);
        console.log(`      Slug: ${book.slug}`);
        console.log(`      Pages: ${book.totalPages || 'N/A'} (Preview: ${book.previewPages || 0})`);
        console.log(`      Type: ${book.contentType}`);
        
        // Check if file exists
        if (book.filePath && existsSync(book.filePath)) {
          console.log(`      File: ✅ Exists at ${book.filePath}`);
        } else {
          console.log(`      File: ❌ Missing (${book.filePath || 'No path'})`);
        }
        console.log('');
      });
    }
    
    // Test 5: Sample Book Content Files
    console.log('5️⃣ Checking Uploaded Files:');
    const contentFiles = [
      'public/uploads/books/cmgihbpp9000zuymo0bw08rox-1760170484239.md',
      'public/uploads/books/cmglh65wz0001uy7kl2399fhu-1760171948014.md'
    ];
    
    contentFiles.forEach(file => {
      if (existsSync(file)) {
        const stats = readFileSync(file, 'utf-8');
        const lines = stats.split('\n').length;
        console.log(`   ✅ ${file.split('/').pop()} (${lines} lines)`);
      } else {
        console.log(`   ❌ ${file.split('/').pop()} - Not found`);
      }
    });
    
    console.log('\n✅ === SYSTEM TEST COMPLETE ===');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testComplete();