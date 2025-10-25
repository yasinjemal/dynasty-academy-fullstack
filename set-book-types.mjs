import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setBookTypes() {
  try {
    console.log('📚 Updating book types...\n');
    
    // Get all books
    const allBooks = await prisma.book.findMany({
      select: {
        id: true,
        title: true,
        source: true,
        bookType: true,
        price: true,
      }
    });

    console.log(`Total books: ${allBooks.length}\n`);

    // Update books based on source
    // Free books: imported from public sources
    const freeBooks = await prisma.book.updateMany({
      where: {
        source: {
          in: ['gutenberg', 'openlibrary', 'google', 'archive']
        }
      },
      data: {
        bookType: 'free',
        price: 0, // Free books should be $0
      }
    });

    console.log(`✅ Set ${freeBooks.count} books as FREE (from public sources)`);

    // Premium books: manually added
    const premiumBooks = await prisma.book.updateMany({
      where: {
        source: 'manual'
      },
      data: {
        bookType: 'premium'
      }
    });

    console.log(`✅ Set ${premiumBooks.count} books as PREMIUM (manually added)`);

    // Show summary
    const summary = await prisma.book.groupBy({
      by: ['bookType'],
      _count: true,
    });

    console.log('\n📊 Summary:');
    summary.forEach(item => {
      const icon = item.bookType === 'premium' ? '👑' : item.bookType === 'free' ? '🎁' : '📖';
      console.log(`  ${icon} ${item.bookType.toUpperCase()}: ${item._count} books`);
    });

    console.log('\n✨ Done! Book types updated.');
    console.log('🔄 Refresh your browser to see the changes.\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setBookTypes();
