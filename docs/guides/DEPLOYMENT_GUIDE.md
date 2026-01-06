# 🚀 Deployment Guide - Dynasty Built Academy

## Prerequisites
- GitHub account
- Vercel account (free tier works)
- Supabase account (already set up)
- Stripe account (for payments)

## 1️⃣ Prepare for Deployment

### Update Environment Variables
Make sure your `.env` file has production values:
```env
# Database (Supabase Transaction Pooler for production)
DATABASE_URL="postgresql://postgres.xepfxnqprkcccgnwmctj:qqpp1100@@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"

# NextAuth
NEXTAUTH_SECRET="your-production-secret-here"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App URL
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

### Generate Production Secret
```bash
# Generate a secure secret for NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 2️⃣ Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Dynasty Built Academy"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/dynasty-academy.git
git branch -M main
git push -u origin main
```

## 3️⃣ Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add all variables from your `.env` file
   - Make sure to use production values

6. Click "Deploy"

### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - What's your project's name? dynasty-academy
# - In which directory is your code? ./
# - Auto-detect settings? Yes

# Add environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
# ... add all other env vars

# Deploy to production
vercel --prod
```

## 4️⃣ Configure Stripe Webhooks for Production

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter webhook URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
5. Copy the webhook signing secret
6. Add to Vercel environment variables:
   ```
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

## 5️⃣ Update NEXTAUTH_URL

After deployment, update the `NEXTAUTH_URL` in Vercel:
1. Go to your project settings
2. Environment Variables
3. Update `NEXTAUTH_URL` to your actual Vercel URL
4. Redeploy: `vercel --prod`

## 6️⃣ Custom Domain (Optional)

### Add Custom Domain in Vercel:
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain (e.g., `dynastybuiltacademy.com`)
4. Follow DNS configuration instructions
5. Update environment variables:
   ```
   NEXTAUTH_URL="https://dynastybuiltacademy.com"
   NEXT_PUBLIC_APP_URL="https://dynastybuiltacademy.com"
   ```

### Update DNS Records:
Add these records to your domain provider:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## 7️⃣ Post-Deployment Checklist

- [ ] Test login/register functionality
- [ ] Test book purchases with Stripe
- [ ] Verify webhook is receiving events
- [ ] Test social features (comments, likes, follows)
- [ ] Check notifications system
- [ ] Verify achievements unlocking
- [ ] Test dark mode toggle
- [ ] Check all pages load correctly
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit (aim for 90+ scores)

## 8️⃣ Monitoring & Analytics

### Enable Vercel Analytics:
1. Go to project settings
2. Click "Analytics"
3. Enable Web Analytics (free)

### Add Error Tracking (Optional):
Consider adding Sentry for error monitoring:
```bash
pnpm add @sentry/nextjs
```

## 9️⃣ Database Migrations

If you make schema changes:
```bash
# Run on local first
pnpm prisma migrate dev --name migration_name

# Then update production (use direct connection, not pooler)
DATABASE_URL="your-direct-connection-url" pnpm prisma migrate deploy
```

## 🔟 Continuous Deployment

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: For pull requests and other branches

## 🎉 Your App is Live!

Visit your deployment URL and test all features. Share your award-winning platform with the world! 🚀

## Troubleshooting

### Build Errors
```bash
# Test build locally first
pnpm build

# Check logs in Vercel dashboard
```

### Database Connection Issues
- Use Transaction Pooler URL for Vercel (with `?pgbouncer=true`)
- Check connection limits in Supabase dashboard
- Verify DATABASE_URL is set correctly

### Webhook Not Working
- Verify webhook URL is correct
- Check Stripe webhook logs
- Ensure STRIPE_WEBHOOK_SECRET matches Stripe dashboard
- Test with `stripe trigger checkout.session.completed`

### Environment Variables Not Loading
- Redeploy after adding/updating env vars
- Check variable names match exactly (case-sensitive)
- Make sure they're set for "Production" environment

## Support

For issues, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
