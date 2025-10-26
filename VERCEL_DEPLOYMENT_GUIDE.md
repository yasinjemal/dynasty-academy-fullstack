# 🚀 Vercel Deployment Guide - Dynasty Academy

## Prerequisites Checklist

Before deploying to Vercel, ensure:

- ✅ **Database migration run** - Run `MIGRATION_SQL.sql` in Supabase SQL Editor first!
- ✅ **Code committed to GitHub** - Latest code pushed to `main` branch
- ✅ **Supabase database** - Running and accessible
- ✅ **Environment variables** - All required keys ready (see below)

---

## Step 1: Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

---

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Click "Add New Project"**

3. **Import Your GitHub Repository:**

   - Connect your GitHub account if not already connected
   - Select repository: `yasinjemal/dynasty-academy-fullstack`
   - Click "Import"

4. **Configure Project:**

   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `next build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

5. **Add Environment Variables** (see section below)

6. **Click "Deploy"** 🚀

### Option B: Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: dynasty-academy-fullstack
# - Directory: ./
# - Override settings? No

# Add environment variables (see below)
# Then deploy to production:
vercel --prod
```

---

## Step 3: Environment Variables Configuration

**⚠️ CRITICAL:** Add these in Vercel Dashboard → Project Settings → Environment Variables

### Required Environment Variables:

```bash
# ==================================
# DATABASE - REQUIRED
# ==================================
DATABASE_URL="postgresql://postgres:qqpp1100%40%40@db.xepfxnqprkcccgnwmctj.supabase.co:5432/postgres?sslmode=require"
DIRECT_DATABASE_URL="postgresql://postgres:qqpp1100%40%40@db.xepfxnqprkcccgnwmctj.supabase.co:5432/postgres?sslmode=require"

# ==================================
# NEXTAUTH - REQUIRED
# ==================================
# Generate new secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NEXTAUTH_SECRET="D4NU/WryRGSxyM0waB02eNC2mIiyhGBiYlLRcnBAxXg="
# ⚠️ CHANGE THIS to your Vercel URL after first deployment!
NEXTAUTH_URL="https://your-app.vercel.app"

# ==================================
# GOOGLE OAUTH - REQUIRED
# ==================================
GOOGLE_CLIENT_ID="1068138965719-o4bgngrbgl8ff41l6nik5erehtmm8uj6.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"

# ==================================
# PAYPAL - REQUIRED (Sandbox)
# ==================================
PAYPAL_CLIENT_ID="AVStqP_OJ3q5vsgHvJHdmS9fyErSPiJt11pUTMz59XS-2tyoPjU19RCj9jxn3V_9-BTIHq_5MVtvsoA8"
PAYPAL_CLIENT_SECRET="EAcw4GqDxUfOMT1ifsiCXzLr5AETcVdP0ovEva4nzC2vYHjD3A1VQfDgo5YNgyBLnyLaWqmNxwLfrkq8"

# ==================================
# AI SERVICES - REQUIRED
# ==================================
# ElevenLabs for audio narration
ELEVENLABS_API_KEY="your-elevenlabs-api-key"

# OpenAI for content generation
OPENAI_API_KEY="your-openai-api-key"

# Anthropic for semantic analysis
ANTHROPIC_API_KEY="your-anthropic-api-key"

# ==================================
# CLOUDINARY - REQUIRED (for uploads)
# ==================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# ==================================
# SUPABASE - REQUIRED (for vectors)
# ==================================
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# ==================================
# SEO & GENERAL - REQUIRED
# ==================================
USE_AI_SEO="true"
REVALIDATE_TOKEN="dynasty-seo-revalidate-2025-xyz789abc"
# ⚠️ CHANGE THIS to your Vercel URL after first deployment!
NEXT_PUBLIC_BASE_URL="https://your-app.vercel.app"

# ==================================
# SPOTIFY - REQUIRED
# ==================================
NEXT_PUBLIC_SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"
# ⚠️ CHANGE THIS to your Vercel URL after first deployment!
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"

# ==================================
# PINECONE - REQUIRED (for RAG)
# ==================================
PINECONE_API_KEY="your-pinecone-api-key"

# ==================================
# CRON SECRET - REQUIRED (for vercel.json cron)
# ==================================
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
CRON_SECRET="your-random-cron-secret-here"
```

---

## Step 4: Post-Deployment Configuration

### 1. Update Environment Variables with Vercel URL

After first deployment, you'll get a URL like: `https://dynasty-academy-fullstack.vercel.app`

**Update these variables in Vercel Dashboard:**

```bash
NEXTAUTH_URL="https://dynasty-academy-fullstack.vercel.app"
NEXT_PUBLIC_BASE_URL="https://dynasty-academy-fullstack.vercel.app"
NEXT_PUBLIC_APP_URL="https://dynasty-academy-fullstack.vercel.app"
```

**Redeploy** after updating (Vercel → Deployments → Click ⋮ → Redeploy)

### 2. Update Google OAuth Redirect URIs

Go to [Google Cloud Console](https://console.cloud.google.com/):

1. Navigate to **APIs & Services → Credentials**
2. Click your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs:**
   ```
   https://dynasty-academy-fullstack.vercel.app/api/auth/callback/google
   ```
4. Click **Save**

### 3. Run Database Migration (if not done)

**⚠️ CRITICAL - Run this in Supabase SQL Editor:**

```sql
-- Copy entire MIGRATION_SQL.sql content and run in Supabase
```

### 4. Verify Cron Jobs

In Vercel Dashboard → Project → Settings → Cron Jobs:

- Verify cron is configured (from `vercel.json`)
- Path: `/api/cron`
- Schedule: `*/5 * * * *` (every 5 minutes)

---

## Step 5: Testing Deployment

### 1. Check Build Logs

- Vercel Dashboard → Deployments → Click latest deployment
- Review build logs for errors

### 2. Test Core Features:

- ✅ Homepage loads
- ✅ Google Sign-In works
- ✅ Course page loads
- ✅ Quiz functionality works
- ✅ Payment flow works (PayPal sandbox)
- ✅ Avatar upload works
- ✅ Audio narration works

### 3. Monitor Runtime Logs:

- Vercel Dashboard → Project → Logs
- Check for runtime errors

---

## Common Issues & Solutions

### Issue 1: "Invalid course data received: {}"

**Cause:** Database migration not run
**Solution:** Run `MIGRATION_SQL.sql` in Supabase SQL Editor

### Issue 2: Build fails with Prisma errors

**Cause:** Database connection string invalid
**Solution:**

- Verify `DATABASE_URL` is correct
- Ensure Supabase database is accessible from Vercel IPs
- Check Supabase → Settings → Database → Connection Pooling is enabled

### Issue 3: Google Sign-In fails

**Cause:** Redirect URI not configured
**Solution:** Add Vercel URL to Google OAuth authorized redirect URIs

### Issue 4: Environment variables not working

**Cause:** Variables not added or deployment not refreshed
**Solution:**

- Add all variables in Vercel Dashboard
- Redeploy after adding variables

### Issue 5: API routes timeout

**Cause:** Database queries too slow or connection pooling issue
**Solution:**

- Use Supabase transaction pooler URL for `DATABASE_URL`
- Enable connection pooling in Supabase
- Optimize slow queries

---

## Performance Optimization

### 1. Enable Edge Caching

Vercel automatically caches static pages. For dynamic pages:

```typescript
// In page.tsx
export const revalidate = 60; // Revalidate every 60 seconds
```

### 2. Database Connection Pooling

Switch to Supabase pooler URL in production:

```bash
# Production DATABASE_URL (use pooler)
DATABASE_URL="postgresql://postgres.xepfxnqprkcccgnwmctj:qqpp1100%40%40@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require"

# Keep direct URL for migrations
DIRECT_DATABASE_URL="postgresql://postgres:qqpp1100%40%40@db.xepfxnqprkcccgnwmctj.supabase.co:5432/postgres?sslmode=require"
```

### 3. Enable Vercel Analytics

- Go to Vercel Dashboard → Project → Analytics
- Enable Web Analytics & Speed Insights

---

## Monitoring & Maintenance

### 1. Set Up Alerts

- Vercel Dashboard → Project → Settings → Notifications
- Enable deployment notifications
- Enable error notifications

### 2. Monitor Database

- Supabase Dashboard → Database → Performance
- Check query performance
- Monitor connection count

### 3. Check Logs Regularly

- Vercel → Project → Logs
- Look for errors, warnings, slow queries

---

## Custom Domain (Optional)

### 1. Add Domain in Vercel

- Vercel Dashboard → Project → Settings → Domains
- Click "Add Domain"
- Enter your domain (e.g., `dynastyacademy.com`)

### 2. Update DNS Records

Add these records in your domain registrar:

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### 3. Update Environment Variables

```bash
NEXTAUTH_URL="https://dynastyacademy.com"
NEXT_PUBLIC_BASE_URL="https://dynastyacademy.com"
NEXT_PUBLIC_APP_URL="https://dynastyacademy.com"
```

### 4. Update Google OAuth

Add to authorized redirect URIs:

```
https://dynastyacademy.com/api/auth/callback/google
```

---

## Security Checklist

Before going live:

- [ ] Generate new `NEXTAUTH_SECRET` for production
- [ ] Generate new `CRON_SECRET`
- [ ] Rotate all API keys if using same keys from development
- [ ] Enable Vercel security headers
- [ ] Set up CORS policies
- [ ] Enable Supabase RLS (Row Level Security)
- [ ] Review all environment variables for sensitive data
- [ ] Enable Vercel DDoS protection
- [ ] Set up rate limiting (using Upstash Redis)

---

## Quick Deploy Commands

```bash
# First time deployment
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Inspect specific deployment
vercel inspect [deployment-url]

# Remove deployment
vercel rm [deployment-url]
```

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Supabase Integration:** https://supabase.com/partners/integrations/vercel
- **Vercel Support:** https://vercel.com/support

---

## 🎉 Success Checklist

After successful deployment:

- [ ] App loads at Vercel URL
- [ ] All environment variables configured
- [ ] Database migration run
- [ ] Google Sign-In works
- [ ] Course progression system functional
- [ ] Quiz system works with locks
- [ ] Payment flows functional
- [ ] Audio narration works
- [ ] Image uploads work
- [ ] No console errors
- [ ] Performance acceptable (< 3s load time)
- [ ] Mobile responsive
- [ ] Custom domain configured (if applicable)

---

**🚀 Ready to deploy? Follow the steps above and your Dynasty Academy will be live on Vercel!**

Need help? Check the "Common Issues" section or review Vercel deployment logs.
