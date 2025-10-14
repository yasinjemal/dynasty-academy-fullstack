import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUserName() {
  try {
    console.log('\n🔧 Fixing User Name Field...\n');
    
    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: 'yasinyutbr@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        image: true,
      },
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('Current user data:');
    console.log(`  - Name: ${user.name || '❌ NULL'}`);
    console.log(`  - Username: ${user.username || '❌ NULL'}`);
    console.log(`  - Email: ${user.email}`);
    console.log('');

    if (!user.name) {
      console.log('🔨 Setting name to username as fallback...');
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name: user.username || 'Dynasty Scholar',
        },
      });

      console.log(`✅ Updated name to: ${user.username || 'Dynasty Scholar'}`);
    } else {
      console.log('✅ Name is already set!');
    }

    // Verify update
    const updated = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, username: true },
    });

    console.log('');
    console.log('Updated user data:');
    console.log(`  - Name: ${updated.name}`);
    console.log(`  - Username: ${updated.username}`);
    console.log('');
    console.log('✅ Fix complete!\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserName();
