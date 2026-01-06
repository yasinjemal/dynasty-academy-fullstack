// Fix missing Role enum in database
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixRoleEnum() {
  try {
    console.log('✅ Connected to database')

    console.log('📝 Creating all enums...')
    
    // Create all enums in one go
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        -- Role enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
          CREATE TYPE "Role" AS ENUM ('USER', 'MODERATOR', 'ADMIN');
          RAISE NOTICE 'Created Role enum';
        ELSE
          RAISE NOTICE 'Role enum already exists';
        END IF;

        -- OrderStatus enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrderStatus') THEN
          CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED');
          RAISE NOTICE 'Created OrderStatus enum';
        ELSE
          RAISE NOTICE 'OrderStatus enum already exists';
        END IF;

        -- BlogPostStatus enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BlogPostStatus') THEN
          CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
          RAISE NOTICE 'Created BlogPostStatus enum';
        ELSE
          RAISE NOTICE 'BlogPostStatus enum already exists';
        END IF;

        -- NotificationType enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationType') THEN
          CREATE TYPE "NotificationType" AS ENUM ('LIKE', 'COMMENT', 'FOLLOW', 'ORDER', 'ACHIEVEMENT', 'SYSTEM');
          RAISE NOTICE 'Created NotificationType enum';
        ELSE
          RAISE NOTICE 'NotificationType enum already exists';
        END IF;

        -- ResourceType enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ResourceType') THEN
          CREATE TYPE "ResourceType" AS ENUM ('BOOK', 'BLOG');
          RAISE NOTICE 'Created ResourceType enum';
        ELSE
          RAISE NOTICE 'ResourceType enum already exists';
        END IF;
      END $$;
    `)
    
    console.log('🎉 All enums verified/created successfully!')
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixRoleEnum()
  .then(() => {
    console.log('✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed:', error)
    process.exit(1)
  })
