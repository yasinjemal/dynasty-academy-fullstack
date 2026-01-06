# 🔐 Google OAuth Setup Guide for Dynasty Built Academy

## Issue
Google Sign-In is not working because OAuth credentials are not configured.

## Solution: Set Up Google OAuth

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name: `Dynasty Built Academy`
   - Click "CREATE"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" or "Google Identity"
   - Click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" (for testing) or "Internal" (for organization)
   - Fill in required fields:
     - App name: `Dynasty Built Academy`
     - User support email: Your email
     - Developer contact: Your email
   - Click "SAVE AND CONTINUE"
   - Scopes: Add `email`, `profile`, `openid` (should be default)
   - Click "SAVE AND CONTINUE"
   - Test users: Add your email for testing
   - Click "SAVE AND CONTINUE"

5. **Create OAuth Client ID**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: "Web application"
   - Name: `Dynasty Built Academy Web Client`
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     http://localhost:3001
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     http://localhost:3001/api/auth/callback/google
     ```
   - Click "CREATE"

6. **Copy Your Credentials**
   - You'll see a popup with:
     - **Client ID**: `something.apps.googleusercontent.com`
     - **Client Secret**: Random string
   - **SAVE THESE!**

---

### Step 2: Update Your .env File

Open your `.env` file and add the credentials:

```env
# ==================================
# DATABASE
# ==================================
DATABASE_URL="postgresql://postgres.xepfxnqprkcccgnwmctj:qqpp1100%40%40@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&connection_limit=1"

# ==================================
# NEXTAUTH
# ==================================
NEXTAUTH_SECRET="D4NU/WryRGSxyM0waB02eNC2mIiyhGBiYlLRcnBAxXg="
NEXTAUTH_URL="http://localhost:3001"

# ==================================
# GOOGLE OAUTH (ADD THESE)
# ==================================
GOOGLE_CLIENT_ID="YOUR_CLIENT_ID_HERE.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET_HERE"

# ==================================
# OPTIONAL - Add when needed
# ==================================
# STRIPE_SECRET_KEY=""
```

**Important:** Replace `YOUR_CLIENT_ID_HERE` and `YOUR_CLIENT_SECRET_HERE` with your actual credentials!

---

### Step 3: Restart Your Dev Server

After updating `.env`, restart your development server:

```powershell
# Stop the current server (Ctrl+C)
# Then restart:
cd "E:\web dev\dynasty\Dynasty Built Academy Website Design and Features\dynasty-academy-fullstack"
pnpm dev
```

---

### Step 4: Test Google Sign-In

1. Go to: http://localhost:3001/login
2. Click "Continue with Google"
3. Select your Google account
4. Grant permissions
5. You'll be redirected back and logged in! ✅

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
- **Solution:** Make sure your redirect URI in Google Console exactly matches:
  - `http://localhost:3001/api/auth/callback/google` (note: 3001, not 3000)

### Error: "invalid_client"
- **Solution:** Check that your Client ID and Secret are correct in `.env`

### Error: "access_denied"
- **Solution:** Make sure you added your email to "Test users" in OAuth consent screen

### Still not working?
1. Clear browser cookies and cache
2. Try incognito/private mode
3. Check that you saved the `.env` file
4. Verify server restarted after .env changes

---

## Quick Checklist ✅

- [ ] Created Google Cloud Project
- [ ] Enabled Google+ API
- [ ] Configured OAuth consent screen
- [ ] Created OAuth Client ID
- [ ] Added redirect URIs (http://localhost:3001/api/auth/callback/google)
- [ ] Copied Client ID and Secret
- [ ] Updated .env file with credentials
- [ ] Restarted dev server
- [ ] Tested Google Sign-In

---

## What Happens After Sign-In?

When a user signs in with Google:
1. ✅ User account is automatically created in your database
2. ✅ Profile info (name, email, image) is saved
3. ✅ User role is set to "USER" by default
4. ✅ User is redirected to dashboard
5. ✅ Session is created with JWT

---

## Production Deployment

When deploying to production (Vercel):
1. Add production domain to Authorized JavaScript origins:
   - `https://yourdomain.com`
2. Add production callback to Authorized redirect URIs:
   - `https://yourdomain.com/api/auth/callback/google`
3. Update environment variables in Vercel dashboard
4. Set `NEXTAUTH_URL=https://yourdomain.com` in Vercel

---

## Security Notes 🔒

- ✅ Never commit `.env` file to Git (it's in .gitignore)
- ✅ Keep Client Secret private
- ✅ Use different credentials for development and production
- ✅ Regularly rotate secrets
- ✅ Review authorized domains periodically

---

Need help? Check the terminal output for specific error messages!
