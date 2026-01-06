import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createPurchaseTables() {
  console.log('🔄 Creating purchases and subscriptions tables...')

  try {
    // Run raw SQL to create tables
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS purchases (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        book_id TEXT NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
        status TEXT DEFAULT 'completed',
        payment_provider TEXT DEFAULT 'stripe',
        payment_intent_id TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT purchases_user_id_book_id_key UNIQUE (user_id, book_id)
      );
    `

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS purchases_user_id_idx ON purchases(user_id);
    `

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS purchases_book_id_idx ON purchases(book_id);
    `

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS purchases_status_idx ON purchases(status);
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        plan_id TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        stripe_subscription_id TEXT UNIQUE,
        stripe_customer_id TEXT,
        current_period_end TIMESTAMP NOT NULL,
        canceled_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
    `

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);
    `

    console.log('✅ Tables created successfully!')
    console.log('')
    console.log('📋 Summary:')
    console.log('  - purchases table: Track individual book purchases')
    console.log('  - subscriptions table: Track monthly subscription plans')
    console.log('')
    console.log('Next steps:')
    console.log('  1. Add STRIPE_SECRET_KEY to .env')
    console.log('  2. Add STRIPE_WEBHOOK_SECRET to .env')
    console.log('  3. Install Stripe CLI: npm install stripe')
    console.log('  4. Test webhook: stripe listen --forward-to localhost:3000/api/webhooks/stripe')
    console.log('  5. Configure Stripe products in dashboard')
    console.log('')
  } catch (error) {
    if (error.code === '42P07') {
      console.log('✅ Tables already exist')
    } else {
      console.error('❌ Error:', error)
      throw error
    }
  } finally {
    await prisma.$disconnect()
  }
}

createPurchaseTables()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
