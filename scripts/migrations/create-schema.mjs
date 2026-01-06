// Create database schema using raw SQL (bypasses Prisma migration issues with PgBouncer)
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const prisma = new PrismaClient()

async function createSchema() {
  try {
    console.log('🚀 Creating database schema directly via SQL...\n')

    await prisma.$connect()
    console.log('✅ Connected to database\n')

    console.log('📝 Creating tables...')
    
    // Create tables one by one
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT,
        "email" TEXT UNIQUE NOT NULL,
        "emailVerified" TIMESTAMP,
        "image" TEXT,
        "password" TEXT,
        "role" TEXT NOT NULL DEFAULT 'USER',
        "bio" TEXT,
        "socialLinks" JSONB,
        "isPremium" BOOLEAN NOT NULL DEFAULT false,
        "premiumUntil" TIMESTAMP,
        "settings" JSONB,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL,
        "lastLoginAt" TIMESTAMP
      )`,
      
      // Accounts table (NextAuth)
      `CREATE TABLE IF NOT EXISTS "accounts" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        UNIQUE("provider", "providerAccountId")
      )`,
      
      // Sessions table (NextAuth)
      `CREATE TABLE IF NOT EXISTS "sessions" (
        "id" TEXT PRIMARY KEY,
        "sessionToken" TEXT UNIQUE NOT NULL,
        "userId" TEXT NOT NULL,
        "expires" TIMESTAMP NOT NULL
      )`,
      
      // Verification tokens (NextAuth)
      `CREATE TABLE IF NOT EXISTS "verification_tokens" (
        "identifier" TEXT NOT NULL,
        "token" TEXT UNIQUE NOT NULL,
        "expires" TIMESTAMP NOT NULL,
        UNIQUE("identifier", "token")
      )`,
      
      // Books table
      `CREATE TABLE IF NOT EXISTS "books" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT UNIQUE NOT NULL,
        "description" TEXT NOT NULL,
        "excerpt" TEXT,
        "coverImage" TEXT,
        "price" DOUBLE PRECISION NOT NULL,
        "salePrice" DOUBLE PRECISION,
        "category" TEXT NOT NULL,
        "tags" TEXT[],
        "contentType" TEXT NOT NULL,
        "fileUrl" TEXT,
        "previewUrl" TEXT,
        "pages" INTEGER,
        "duration" TEXT,
        "authorId" TEXT NOT NULL,
        "publishedAt" TIMESTAMP,
        "featured" BOOLEAN NOT NULL DEFAULT false,
        "viewCount" INTEGER NOT NULL DEFAULT 0,
        "salesCount" INTEGER NOT NULL DEFAULT 0,
        "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "reviewCount" INTEGER NOT NULL DEFAULT 0,
        "metaTitle" TEXT,
        "metaDescription" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL
      )`,
      
      // Blog posts table
      `CREATE TABLE IF NOT EXISTS "blog_posts" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT UNIQUE NOT NULL,
        "content" TEXT NOT NULL,
        "excerpt" TEXT,
        "coverImage" TEXT,
        "category" TEXT NOT NULL,
        "tags" TEXT[],
        "authorId" TEXT NOT NULL,
        "publishedAt" TIMESTAMP,
        "featured" BOOLEAN NOT NULL DEFAULT false,
        "viewCount" INTEGER NOT NULL DEFAULT 0,
        "readTime" TEXT,
        "metaTitle" TEXT,
        "metaDescription" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL
      )`,
      
      // Orders table
      `CREATE TABLE IF NOT EXISTS "orders" (
        "id" TEXT PRIMARY KEY,
        "orderNumber" TEXT UNIQUE NOT NULL,
        "userId" TEXT NOT NULL,
        "subtotal" DOUBLE PRECISION NOT NULL,
        "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "total" DOUBLE PRECISION NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "paymentId" TEXT,
        "paymentMethod" TEXT,
        "email" TEXT NOT NULL,
        "downloadLinks" JSONB,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL
      )`,
      
      // Order items table
      `CREATE TABLE IF NOT EXISTS "order_items" (
        "id" TEXT PRIMARY KEY,
        "orderId" TEXT NOT NULL,
        "bookId" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "price" DOUBLE PRECISION NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Comments table
      `CREATE TABLE IF NOT EXISTS "comments" (
        "id" TEXT PRIMARY KEY,
        "content" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "postId" TEXT NOT NULL,
        "parentId" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL
      )`,
      
      // Likes table
      `CREATE TABLE IF NOT EXISTS "likes" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "postId" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("userId", "postId")
      )`,
      
      // Bookmarks table
      `CREATE TABLE IF NOT EXISTS "bookmarks" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "bookId" TEXT,
        "postId" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Follows table
      `CREATE TABLE IF NOT EXISTS "follows" (
        "id" TEXT PRIMARY KEY,
        "followerId" TEXT NOT NULL,
        "followingId" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("followerId", "followingId")
      )`,
      
      // Notifications table
      `CREATE TABLE IF NOT EXISTS "notifications" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT,
        "link" TEXT,
        "read" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Achievements table
      `CREATE TABLE IF NOT EXISTS "achievements" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT UNIQUE NOT NULL,
        "description" TEXT NOT NULL,
        "icon" TEXT NOT NULL,
        "points" INTEGER NOT NULL,
        "requirement" TEXT NOT NULL
      )`,
      
      // User achievements table
      `CREATE TABLE IF NOT EXISTS "user_achievements" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "achievementId" TEXT NOT NULL,
        "unlockedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("userId", "achievementId")
      )`,
      
      // User progress table
      `CREATE TABLE IF NOT EXISTS "user_progress" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "bookId" TEXT NOT NULL,
        "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "lastPage" INTEGER,
        "completed" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL,
        UNIQUE("userId", "bookId")
      )`,
      
      // Reviews table
      `CREATE TABLE IF NOT EXISTS "reviews" (
        "id" TEXT PRIMARY KEY,
        "rating" INTEGER NOT NULL,
        "comment" TEXT,
        "userId" TEXT NOT NULL,
        "bookId" TEXT NOT NULL,
        "helpful" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL,
        UNIQUE("userId", "bookId")
      )`
    ]

    for (let i = 0; i < tables.length; i++) {
      await prisma.$executeRawUnsafe(tables[i])
      console.log(`  ✓ Table ${i + 1}/${tables.length} created`)
    }

    console.log('\n📊 Creating indexes...')
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email")',
      'CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role")',
      'CREATE INDEX IF NOT EXISTS "books_slug_idx" ON "books"("slug")',
      'CREATE INDEX IF NOT EXISTS "books_category_idx" ON "books"("category")',
      'CREATE INDEX IF NOT EXISTS "books_featured_idx" ON "books"("featured")',
      'CREATE INDEX IF NOT EXISTS "blog_posts_slug_idx" ON "blog_posts"("slug")',
      'CREATE INDEX IF NOT EXISTS "blog_posts_category_idx" ON "blog_posts"("category")',
      'CREATE INDEX IF NOT EXISTS "orders_userId_idx" ON "orders"("userId")',
      'CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders"("status")',
      'CREATE INDEX IF NOT EXISTS "comments_postId_idx" ON "comments"("postId")',
      'CREATE INDEX IF NOT EXISTS "comments_userId_idx" ON "comments"("userId")',
      'CREATE INDEX IF NOT EXISTS "likes_postId_idx" ON "likes"("postId")',
      'CREATE INDEX IF NOT EXISTS "bookmarks_userId_idx" ON "bookmarks"("userId")',
      'CREATE INDEX IF NOT EXISTS "follows_followerId_idx" ON "follows"("followerId")',
      'CREATE INDEX IF NOT EXISTS "follows_followingId_idx" ON "follows"("followingId")',
      'CREATE INDEX IF NOT EXISTS "notifications_userId_idx" ON "notifications"("userId")',
      'CREATE INDEX IF NOT EXISTS "notifications_read_idx" ON "notifications"("read")',
      'CREATE INDEX IF NOT EXISTS "user_progress_userId_idx" ON "user_progress"("userId")',
      'CREATE INDEX IF NOT EXISTS "reviews_bookId_idx" ON "reviews"("bookId")'
    ]

    for (let i = 0; i < indexes.length; i++) {
      await prisma.$executeRawUnsafe(indexes[i])
      console.log(`  ✓ Index ${i + 1}/${indexes.length} created`)
    }

    // Verify tables were created
    const result = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `
    
    console.log('\n✅ Schema creation complete!')
    console.log(`📊 Created ${result.length} tables:`)
    result.forEach((table) => console.log(`   - ${table.tablename}`))
    
    console.log('\n💡 Next steps:')
    console.log('   1. Run: pnpm prisma generate')
    console.log('   2. Run: pnpm prisma studio (to view your database)')
    console.log('   3. Run: pnpm dev (to start your app)\n')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('Full error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createSchema()
