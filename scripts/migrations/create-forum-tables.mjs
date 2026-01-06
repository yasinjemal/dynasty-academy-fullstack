import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating forum tables...')

  try {
    // Create tables using raw SQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."forum_categories" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "description" TEXT,
        "icon" TEXT,
        "color" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "forum_categories_pkey" PRIMARY KEY ("id")
      );
    `)
    console.log('✅ Created forum_categories table')

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "forum_categories_slug_key" ON "public"."forum_categories"("slug");
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."forum_topics" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "category_id" TEXT NOT NULL,
        "author_id" TEXT NOT NULL,
        "is_pinned" BOOLEAN NOT NULL DEFAULT false,
        "is_locked" BOOLEAN NOT NULL DEFAULT false,
        "view_count" INTEGER NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "forum_topics_pkey" PRIMARY KEY ("id")
      );
    `)
    console.log('✅ Created forum_topics table')

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "forum_topics_slug_key" ON "public"."forum_topics"("slug");
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "forum_topics_category_id_idx" ON "public"."forum_topics"("category_id");
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "forum_topics_author_id_idx" ON "public"."forum_topics"("author_id");
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."forum_posts" (
        "id" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "topic_id" TEXT NOT NULL,
        "author_id" TEXT NOT NULL,
        "parent_id" TEXT,
        "is_answer" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "forum_posts_pkey" PRIMARY KEY ("id")
      );
    `)
    console.log('✅ Created forum_posts table')

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "forum_posts_topic_id_idx" ON "public"."forum_posts"("topic_id");
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "forum_posts_author_id_idx" ON "public"."forum_posts"("author_id");
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "forum_posts_parent_id_idx" ON "public"."forum_posts"("parent_id");
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."forum_topic_likes" (
        "id" TEXT NOT NULL,
        "topic_id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "forum_topic_likes_pkey" PRIMARY KEY ("id")
      );
    `)
    console.log('✅ Created forum_topic_likes table')

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "forum_topic_likes_topic_id_user_id_key" ON "public"."forum_topic_likes"("topic_id", "user_id");
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."forum_post_likes" (
        "id" TEXT NOT NULL,
        "post_id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "forum_post_likes_pkey" PRIMARY KEY ("id")
      );
    `)
    console.log('✅ Created forum_post_likes table')

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "forum_post_likes_post_id_user_id_key" ON "public"."forum_post_likes"("post_id", "user_id");
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "public"."forum_topic_bookmarks" (
        "id" TEXT NOT NULL,
        "topic_id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "forum_topic_bookmarks_pkey" PRIMARY KEY ("id")
      );
    `)
    console.log('✅ Created forum_topic_bookmarks table')

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "forum_topic_bookmarks_topic_id_user_id_key" ON "public"."forum_topic_bookmarks"("topic_id", "user_id");
    `)

    // Add foreign keys (skip if already exist)
    const foreignKeys = [
      {
        name: 'forum_topics_category_id_fkey',
        sql: 'ALTER TABLE "public"."forum_topics" ADD CONSTRAINT "forum_topics_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."forum_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;'
      },
      {
        name: 'forum_topics_author_id_fkey',
        sql: 'ALTER TABLE "public"."forum_topics" ADD CONSTRAINT "forum_topics_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;'
      },
      {
        name: 'forum_posts_topic_id_fkey',
        sql: 'ALTER TABLE "public"."forum_posts" ADD CONSTRAINT "forum_posts_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."forum_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;'
      },
      {
        name: 'forum_posts_author_id_fkey',
        sql: 'ALTER TABLE "public"."forum_posts" ADD CONSTRAINT "forum_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;'
      },
      {
        name: 'forum_posts_parent_id_fkey',
        sql: 'ALTER TABLE "public"."forum_posts" ADD CONSTRAINT "forum_posts_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."forum_posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;'
      },
      {
        name: 'forum_topic_likes_topic_id_fkey',
        sql: 'ALTER TABLE "public"."forum_topic_likes" ADD CONSTRAINT "forum_topic_likes_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."forum_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;'
      },
      {
        name: 'forum_topic_likes_user_id_fkey',
        sql: 'ALTER TABLE "public"."forum_topic_likes" ADD CONSTRAINT "forum_topic_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;'
      },
      {
        name: 'forum_post_likes_post_id_fkey',
        sql: 'ALTER TABLE "public"."forum_post_likes" ADD CONSTRAINT "forum_post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;'
      },
      {
        name: 'forum_post_likes_user_id_fkey',
        sql: 'ALTER TABLE "public"."forum_post_likes" ADD CONSTRAINT "forum_post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;'
      },
      {
        name: 'forum_topic_bookmarks_topic_id_fkey',
        sql: 'ALTER TABLE "public"."forum_topic_bookmarks" ADD CONSTRAINT "forum_topic_bookmarks_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."forum_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;'
      },
      {
        name: 'forum_topic_bookmarks_user_id_fkey',
        sql: 'ALTER TABLE "public"."forum_topic_bookmarks" ADD CONSTRAINT "forum_topic_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;'
      }
    ]

    for (const fk of foreignKeys) {
      try {
        await prisma.$executeRawUnsafe(fk.sql)
        console.log(`✅ Added ${fk.name}`)
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️  ${fk.name} already exists`)
        } else {
          console.log(`⚠️  Skipping ${fk.name}: ${error.message}`)
        }
      }
    }

    console.log('✅ Foreign key setup complete')
    console.log('✅ Forum tables created successfully!')
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Tables already exist, skipping creation')
    } else {
      console.error('❌ Error:', error.message)
      throw error
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
