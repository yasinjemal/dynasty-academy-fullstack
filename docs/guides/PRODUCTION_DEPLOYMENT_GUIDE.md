# 🌐 PRODUCTION DEPLOYMENT GUIDE

## Dynasty Academy - Complete Deployment Checklist

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Code Ready:

- [x] All features tested locally
- [x] No TypeScript errors
- [x] No console errors
- [x] All environment variables documented
- [x] Database schema finalized
- [x] API routes secured

### ✅ Services Configured:

- [x] Resend Email (100 emails/day free tier)
- [x] Upstash Redis (10K commands/day free tier)
- [x] Supabase Database
- [x] Cloudinary Media Storage
- [x] Google OAuth
- [x] OpenAI API
- [x] ElevenLabs TTS
- [x] Anthropic Claude
- [x] Spotify API

---

## 🚀 DEPLOYMENT OPTIONS

### **Option 1: Vercel (Recommended)** ⭐

**Best for:**

- Next.js applications (native support)
- Automatic deployments
- Edge network CDN
- Zero configuration

**Free Tier:**

- 100GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Custom domains

#### Steps:

1. **Install Vercel CLI:**

```bash
npm install -g vercel
```

2. **Login to Vercel:**

```bash
vercel login
```

3. **Deploy:**

```bash
vercel
```

4. **Configure Environment Variables:**
   Go to: `https://vercel.com/your-username/dynasty-academy/settings/environment-variables`

Add ALL variables from your `.env` file:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (change to your production URL)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `RESEND_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `ELEVENLABS_API_KEY`
- `CLOUDINARY_*` (all 3 variables)
- `SUPABASE_*` (all 3 variables)
- `SPOTIFY_*` (both variables)

5. **Deploy to Production:**

```bash
vercel --prod
```

6. **Custom Domain:**

```bash
vercel domains add dynasty-academy.com
```

---

### **Option 2: Railway** 🚂

**Best for:**

- Full-stack applications
- Database hosting included
- Simple pricing
- Great developer experience

**Free Tier:**

- $5 free credit/month
- 500 hours uptime
- Automatic deployments

#### Steps:

1. **Create Railway Account:**
   Visit: `https://railway.app`

2. **Install Railway CLI:**

```bash
npm install -g @railway/cli
```

3. **Login:**

```bash
railway login
```

4. **Initialize Project:**

```bash
railway init
```

5. **Add Database:**

```bash
railway add postgresql
```

6. **Set Environment Variables:**

```bash
railway variables set NEXTAUTH_SECRET=your-secret
railway variables set RESEND_API_KEY=your-key
# ... add all other variables
```

7. **Deploy:**

```bash
railway up
```

8. **Get Production URL:**

```bash
railway open
```

---

### **Option 3: DigitalOcean App Platform** 🌊

**Best for:**

- More control
- Predictable pricing
- Multiple apps
- Managed databases

**Pricing:**

- $5/month Basic app
- $12/month Professional app
- $15/month Managed database

#### Steps:

1. **Create DigitalOcean Account:**
   Visit: `https://cloud.digitalocean.com`

2. **Create New App:**

- Click "Create" → "Apps"
- Connect GitHub repository
- Select branch: `main`

3. **Configure Build:**

```yaml
build:
  command: npm run build
run:
  command: npm start
```

4. **Add Environment Variables:**

- Click "Settings" → "App-Level Environment Variables"
- Add all variables from `.env`

5. **Add Database:**

- Click "Create" → "Databases"
- Choose PostgreSQL
- Copy connection string to `DATABASE_URL`

6. **Deploy:**

- Click "Deploy"
- Wait for build to complete

---

## 🔐 SECURITY HARDENING

### 1. Environment Variables:

```bash
# Generate new secrets for production
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### 2. Database Security:

- Enable SSL connections
- Restrict IP access
- Use connection pooling
- Regular backups

### 3. API Rate Limiting:

Already implemented via Upstash Rate Limiter:

- 5 failed login attempts per 15 minutes
- Automatic IP blocking
- Session tracking

### 4. CORS Configuration:

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://dynasty-academy.com",
          },
        ],
      },
    ];
  },
};
```

### 5. Content Security Policy:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  return response;
}
```

---

## 📧 DOMAIN & EMAIL SETUP

### Custom Domain:

1. **Purchase Domain:**

- Namecheap, Google Domains, or Cloudflare

2. **Configure DNS:**

```
Type: A
Name: @
Value: [Your Vercel/Railway IP]

Type: CNAME
Name: www
Value: dynasty-academy.com
```

3. **SSL Certificate:**

- Automatically provisioned by Vercel/Railway
- Or use Let's Encrypt

### Email Domain Verification (Resend):

1. **Add Domain to Resend:**

```bash
https://resend.com/domains
```

2. **Add DNS Records:**

```
Type: TXT
Name: _resend
Value: [Resend verification token]

Type: MX
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
```

3. **Update Environment:**

```env
EMAIL_FROM="Dynasty Academy <noreply@dynasty-academy.com>"
```

---

## 🗄️ DATABASE MIGRATION

### Production Database Setup:

1. **Backup Local Database:**

```bash
npx prisma db push
npx prisma db seed # if you have seed data
```

2. **Update Production Database:**

```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-db-url"

# Run migrations
npx prisma migrate deploy

# Generate client
npx prisma generate
```

3. **Verify Schema:**

```bash
npx prisma studio
```

---

## 🎯 POST-DEPLOYMENT CHECKLIST

### ✅ Verify Features:

1. **Authentication:**

- [ ] Google OAuth login works
- [ ] Password reset emails arrive
- [ ] Session persistence works

2. **Email System:**

- [ ] Welcome emails send
- [ ] Instructor approval emails send
- [ ] Security alerts send
- [ ] Visit `/admin/email-test` to verify

3. **Security Systems:**

- [ ] Rate limiting blocks 6th failed login
- [ ] Active sessions visible at `/admin/sessions`
- [ ] Audit logs recording events
- [ ] JWT tokens refreshing automatically

4. **Content Features:**

- [ ] Course uploads work
- [ ] Video playback works
- [ ] Audio generation works
- [ ] Book imports work
- [ ] PDF exports work

5. **Analytics:**

- [ ] `/admin/analytics` loads
- [ ] Dynasty Score calculating
- [ ] Leaderboard displaying
- [ ] Content moderation working

### ✅ Performance:

1. **Load Testing:**

```bash
# Install artillery
npm install -g artillery

# Test API
artillery quick --count 100 --num 10 https://dynasty-academy.com/api/health
```

2. **Monitor Metrics:**

- Response time < 200ms
- Error rate < 0.1%
- Uptime > 99.9%

3. **CDN Optimization:**

- Enable Vercel Edge Network
- Compress images via Cloudinary
- Enable Next.js Image Optimization

---

## 📊 MONITORING & LOGGING

### Error Tracking:

**Option 1: Sentry** (Recommended)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Option 2: LogRocket**

```bash
npm install logrocket logrocket-react
```

### Uptime Monitoring:

**Option 1: UptimeRobot** (Free)

- Monitor 50 endpoints
- 5-minute checks
- Email/SMS alerts

**Option 2: Better Uptime**

- 10 monitors free
- Status page included

### Analytics:

**Option 1: Vercel Analytics** (Built-in)

- Real user monitoring
- Web Vitals tracking
- No code changes needed

**Option 2: Plausible Analytics**

- Privacy-friendly
- Lightweight
- GDPR compliant

---

## 💰 COST BREAKDOWN

### Free Tier (Month 1):

- ✅ Vercel Hosting: $0
- ✅ Resend Email: $0 (100 emails/day)
- ✅ Upstash Redis: $0 (10K commands/day)
- ✅ Supabase DB: $0 (500MB, 2GB bandwidth)
- ✅ Cloudinary: $0 (25 credits)

**Total: $0/month** (up to ~1,000 users)

### Growth Tier (Month 2-6):

- Vercel Pro: $20/month (unlimited)
- Resend: $20/month (50K emails)
- Upstash: $10/month (100K commands)
- Supabase: $25/month (8GB DB)
- Cloudinary: $0 (still free tier)

**Total: $75/month** (up to ~10,000 users)

### Scale Tier (Month 7+):

- Vercel Enterprise: $Custom
- Resend: $50/month (100K emails)
- Upstash: $30/month (1M commands)
- Supabase: $100/month (100GB DB)
- Cloudinary: $89/month (premium)

**Total: ~$300/month** (100,000+ users)

---

## 🚨 ROLLBACK PLAN

If deployment fails:

1. **Vercel:**

```bash
# Rollback to previous deployment
vercel rollback
```

2. **Railway:**

```bash
# Redeploy previous version
railway rollback
```

3. **Database:**

```bash
# Restore from backup
psql $DATABASE_URL < backup.sql
```

---

## 🎉 GO-LIVE CHECKLIST

### Final Steps:

- [ ] All environment variables set
- [ ] Database migrated successfully
- [ ] Domain DNS propagated (24-48 hours)
- [ ] SSL certificate active
- [ ] Email sending working
- [ ] OAuth providers configured
- [ ] Rate limiting active
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] Support email configured
- [ ] Legal pages added (Terms, Privacy)

### Launch Announcement:

1. **Social Media:**

- Twitter/X announcement
- LinkedIn post
- Product Hunt launch

2. **Email Campaign:**

- Send to waitlist
- Announce to beta users

3. **SEO:**

- Submit sitemap to Google
- Configure Google Analytics
- Set up Google Search Console

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues:

**"Database connection failed"**

- Check `DATABASE_URL` environment variable
- Verify database is running
- Check IP whitelist settings

**"Emails not sending"**

- Verify `RESEND_API_KEY` is set
- Check Resend dashboard for errors
- Verify domain DNS records

**"OAuth not working"**

- Update `NEXTAUTH_URL` to production URL
- Update redirect URIs in Google Console
- Check `NEXTAUTH_SECRET` is set

**"Redis timeout"**

- Verify `UPSTASH_REDIS_REST_URL` is set
- Check Upstash dashboard
- Verify network connectivity

---

## 🎯 SUCCESS METRICS

Track these KPIs post-launch:

- Daily Active Users (DAU)
- Average Session Duration
- Course Completion Rate
- Email Open Rate
- API Response Time
- Error Rate
- Conversion Rate (Free → Paid)

---

**Deployment Ready! 🚀**

You now have a complete, production-grade deployment guide for Dynasty Academy.

**Estimated Total Deployment Time:** 2-4 hours

**Good luck with launch! 🎉**
