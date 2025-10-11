#!/usr/bin/env node

/**
 * Professional Audio System Setup
 * Installs dependencies and initializes infrastructure
 * 
 * Run: node setup-audio-system.mjs
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const REQUIRED_PACKAGES = [
  '@supabase/supabase-js',
  'ioredis', // Optional but recommended for production
]

const REQUIRED_ENV_VARS = {
  ELEVENLABS_API_KEY: 'Your ElevenLabs API key',
  NEXT_PUBLIC_SUPABASE_URL: 'Your Supabase project URL (https://xxx.supabase.co)',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Your Supabase anon/public key',
  SUPABASE_SERVICE_ROLE_KEY: 'Your Supabase service role key (for uploads)',
  REDIS_URL: 'Your Redis URL (optional - for production locking)',
}

console.log('🎙️ Dynasty Academy - Professional Audio System Setup\n')

// Step 1: Install npm packages
console.log('📦 Step 1: Installing required packages...')
try {
  const packagesToInstall = REQUIRED_PACKAGES.join(' ')
  console.log(`   Installing: ${packagesToInstall}`)
  
  execSync(`npm install ${packagesToInstall}`, {
    stdio: 'inherit',
    encoding: 'utf-8',
  })
  
  console.log('   ✅ Packages installed successfully\n')
} catch (error) {
  console.error('   ❌ Failed to install packages:', error.message)
  console.log('   Try manually: npm install @supabase/supabase-js ioredis\n')
}

// Step 2: Check environment variables
console.log('🔐 Step 2: Checking environment variables...')
const envPath = join(process.cwd(), '.env.local')
const envExists = existsSync(envPath)

if (!envExists) {
  console.log('   ⚠️ .env.local not found - creating template...')
  
  const envTemplate = Object.entries(REQUIRED_ENV_VARS)
    .map(([key, description]) => `# ${description}\n${key}=`)
    .join('\n\n')
  
  writeFileSync(envPath, envTemplate, 'utf-8')
  console.log('   ✅ Created .env.local template\n')
} else {
  const envContent = readFileSync(envPath, 'utf-8')
  const missingVars = []
  
  for (const [key, description] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!envContent.includes(key) || !envContent.match(new RegExp(`${key}=.+`))) {
      missingVars.push(`${key} (${description})`)
    }
  }
  
  if (missingVars.length > 0) {
    console.log('   ⚠️ Missing or empty environment variables:')
    missingVars.forEach((v) => console.log(`      - ${v}`))
    console.log('\n   📝 Please add these to your .env.local file\n')
  } else {
    console.log('   ✅ All required environment variables configured\n')
  }
}

// Step 3: Database migration
console.log('🗄️ Step 3: Database migration')
console.log('   To migrate from BookAudio to AudioAsset:')
console.log('   1. Run: node migrate-audio-assets.mjs')
console.log('   2. Then: npx prisma generate')
console.log('   3. Restart dev server: npm run dev\n')

// Step 4: Supabase Storage setup
console.log('☁️ Step 4: Supabase Storage setup')
console.log('   1. Go to https://supabase.com/dashboard')
console.log('   2. Select your project')
console.log('   3. Navigate to Storage → Create Bucket')
console.log('   4. Bucket name: "audio"')
console.log('   5. Make bucket PUBLIC')
console.log('   6. No file size limit restrictions needed')
console.log('\n   Alternatively, run this SQL in Supabase SQL Editor:')
console.log(`
   -- Create storage bucket
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('audio', 'audio', true);
   
   -- Allow public reads
   CREATE POLICY "Audio read access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'audio');
   
   -- Allow authenticated uploads (or service role only)
   CREATE POLICY "Audio upload access"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'audio' AND auth.role() = 'authenticated');
`)
console.log('\n')

// Step 5: Redis setup (optional)
console.log('🔒 Step 5: Redis setup (Optional - for production)')
console.log('   For development: Redis is optional, system will work without it')
console.log('   For production: Recommended to prevent duplicate generations')
console.log('\n   Option A: Local Redis')
console.log('      - Install Redis: https://redis.io/download')
console.log('      - Start: redis-server')
console.log('      - Add to .env.local: REDIS_URL=redis://localhost:6379')
console.log('\n   Option B: Upstash Redis (Free tier)')
console.log('      - Sign up: https://upstash.com/')
console.log('      - Create database')
console.log('      - Copy REDIS_URL to .env.local')
console.log('\n')

// Step 6: Test the system
console.log('✅ Step 6: Testing')
console.log('   After completing setup:')
console.log('   1. Ensure .env.local has all credentials')
console.log('   2. Run migration: node migrate-audio-assets.mjs')
console.log('   3. Regenerate Prisma: npx prisma generate')
console.log('   4. Start dev server: npm run dev')
console.log('   5. Open a book and test Listen Mode')
console.log('   6. Check console for:')
console.log('      - "Cache MISS" on first generation (paid)')
console.log('      - "Cache HIT" on second generation (free)')
console.log('\n')

console.log('📊 Expected Cost Savings:')
console.log('   Without hash caching:')
console.log('      - 100 users read Chapter 1 = 100 generations × R15 = R1,500')
console.log('   With hash caching:')
console.log('      - 100 users read Chapter 1 = 1 generation × R15 = R15')
console.log('      - 99 users get instant cache = FREE')
console.log('   💰 Savings: 99% = R1,485 per 100 users per chapter\n')

console.log('🚀 Setup guide complete!')
console.log('📚 Next: Follow steps 3-6 above to complete setup\n')
