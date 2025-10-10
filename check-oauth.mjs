// Quick test to check if Google OAuth is configured
console.log('🔍 Checking Google OAuth Configuration...\n')

const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET
const nextAuthUrl = process.env.NEXTAUTH_URL
const nextAuthSecret = process.env.NEXTAUTH_SECRET

console.log('✅ Environment Variables:')
console.log(`   NEXTAUTH_URL: ${nextAuthUrl || '❌ NOT SET'}`)
console.log(`   NEXTAUTH_SECRET: ${nextAuthSecret ? '✅ SET' : '❌ NOT SET'}`)
console.log(`   GOOGLE_CLIENT_ID: ${clientId ? '✅ SET' : '❌ NOT SET'}`)
console.log(`   GOOGLE_CLIENT_SECRET: ${clientSecret ? '✅ SET' : '❌ NOT SET'}`)

console.log('\n📋 Status:')

if (!clientId || clientId === '') {
  console.log('❌ Google Client ID is missing!')
  console.log('   👉 Follow the guide in GOOGLE_OAUTH_SETUP.md')
} else {
  console.log('✅ Google Client ID is configured')
}

if (!clientSecret || clientSecret === '') {
  console.log('❌ Google Client Secret is missing!')
  console.log('   👉 Follow the guide in GOOGLE_OAUTH_SETUP.md')
} else {
  console.log('✅ Google Client Secret is configured')
}

if (clientId && clientSecret && clientId !== '' && clientSecret !== '') {
  console.log('\n🎉 Google OAuth is fully configured!')
  console.log('   You can now use "Sign in with Google"')
  console.log('\n📍 Expected callback URL:')
  console.log(`   ${nextAuthUrl}/api/auth/callback/google`)
  console.log('\n   Make sure this URL is added to your Google Console!')
} else {
  console.log('\n⚠️  Google OAuth is NOT configured yet')
  console.log('   Please follow these steps:')
  console.log('   1. Read GOOGLE_OAUTH_SETUP.md')
  console.log('   2. Get credentials from Google Cloud Console')
  console.log('   3. Update your .env file')
  console.log('   4. Restart your dev server')
}
