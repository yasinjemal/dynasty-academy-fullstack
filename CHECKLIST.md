# ✅ Dynasty Academy Development Checklist

Use this checklist to track your progress from setup to deployment!

## 🚀 Phase 1: Initial Setup (10 minutes)

### Database Setup
- [ ] Create Supabase account at [supabase.com](https://supabase.com)
- [ ] Create new project (name: dynasty-academy)
- [ ] Copy database connection string from Settings → Database → URI
- [ ] Paste into `.env` as `DATABASE_URL`

### Environment Configuration
- [ ] Copy `.env.example` to `.env` (already exists)
- [ ] Generate `NEXTAUTH_SECRET`:
  ```powershell
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
  ```
- [ ] Paste generated secret into `.env`
- [ ] Set `NEXTAUTH_URL="http://localhost:3000"`

### Database Migration
- [ ] Open terminal in project directory
- [ ] Run: `pnpm prisma migrate dev --name init`
- [ ] Verify: Should see "✔ Generated Prisma Client"

### Start Development Server
- [ ] Run: `pnpm dev`
- [ ] Open: http://localhost:3000
- [ ] Verify: Should see Dynasty Academy homepage

### Create Admin Account
- [ ] Go to: http://localhost:3000/register
- [ ] Register with:
  - Name: Admin User
  - Email: admin@dynastyacademy.com
  - Password: (your choice, 8+ characters)
- [ ] Run: `pnpm prisma studio`
- [ ] Open: http://localhost:5555
- [ ] Click "users" table
- [ ] Find your user → Change `role` to `ADMIN` → Save
- [ ] Go to: http://localhost:3000/admin
- [ ] Verify: You can access admin panel

## 🎨 Phase 2: Content Creation (30 minutes)

### Add Your First Book
- [ ] Go to: http://localhost:3000/admin/books
- [ ] Click "Create New Book"
- [ ] Fill in:
  - Title: Your first book
  - Slug: your-first-book
  - Description: (at least 10 characters)
  - Price: 29.99
  - Category: Business
  - Content Type: PDF
  - Featured: ✓ (check this)
- [ ] Click "Publish"
- [ ] Go to: http://localhost:3000/works
- [ ] Verify: Book appears in the list

### Write Your First Blog Post
- [ ] Go to: http://localhost:3000/admin/blog
- [ ] Click "Create New Post"
- [ ] Fill in:
  - Title: Welcome to Dynasty Academy
  - Slug: welcome-to-dynasty-academy
  - Content: (write at least 100 characters)
  - Category: Announcements
  - Featured: ✓ (check this)
- [ ] Click "Publish"
- [ ] Go to: http://localhost:3000/blog
- [ ] Verify: Post appears in the list

### Add More Content
- [ ] Add 2-3 more books
- [ ] Write 2-3 more blog posts
- [ ] Test viewing individual book pages
- [ ] Test viewing individual blog posts
- [ ] Test commenting on blog posts

## 🎨 Phase 3: Customization (1 hour)

### Brand Customization
- [ ] Open `src/config/site.ts`
- [ ] Update `siteConfig.name` to your brand name
- [ ] Update `siteConfig.description`
- [ ] Update social media links
- [ ] Change `theme.colors.primary` to your brand color (optional)

### Homepage Content
- [ ] Open `src/app/(public)/page.tsx`
- [ ] Customize hero section text
- [ ] Update about section
- [ ] Adjust featured content display

### About Page
- [ ] Open `src/app/(public)/about/page.tsx`
- [ ] Write your story
- [ ] Add your mission/vision
- [ ] Include team information (if applicable)

### Contact Page
- [ ] Open `src/app/(public)/contact/page.tsx`
- [ ] Update contact information
- [ ] Configure email service (optional - Resend recommended)

## 🛒 Phase 4: E-Commerce Setup (30 minutes)

### Stripe Integration
- [ ] Create Stripe account at [stripe.com](https://stripe.com)
- [ ] Get test API keys from Dashboard → Developers → API keys
- [ ] Add to `.env`:
  ```
  STRIPE_SECRET_KEY="sk_test_..."
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
  ```
- [ ] Restart development server

### Test Checkout Flow
- [ ] Add a book to cart
- [ ] Go to checkout
- [ ] Use Stripe test card: 4242 4242 4242 4242
- [ ] Complete purchase
- [ ] Verify order appears in `/admin/orders`
- [ ] Verify order appears in user dashboard

## 🔐 Phase 5: Authentication (Optional, 20 minutes)

### Google OAuth (Optional)
- [ ] Go to: [Google Cloud Console](https://console.cloud.google.com)
- [ ] Create new project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials
- [ ] Add to `.env`:
  ```
  GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
  GOOGLE_CLIENT_SECRET="your-client-secret"
  ```
- [ ] Test login with Google

### GitHub OAuth (Optional)
- [ ] Go to: [GitHub Developer Settings](https://github.com/settings/developers)
- [ ] Create new OAuth App
- [ ] Add to `.env`:
  ```
  GITHUB_ID="your-github-id"
  GITHUB_SECRET="your-github-secret"
  ```
- [ ] Test login with GitHub

## 📤 Phase 6: File Uploads (Optional, 30 minutes)

### Uploadthing Setup (Recommended)
- [ ] Go to: [uploadthing.com](https://uploadthing.com)
- [ ] Create account
- [ ] Create new app
- [ ] Get API keys
- [ ] Add to `.env`:
  ```
  UPLOADTHING_SECRET="sk_live_..."
  UPLOADTHING_APP_ID="your-app-id"
  ```
- [ ] Test image uploads in admin panel

### Alternative: Cloudinary
- [ ] Go to: [cloudinary.com](https://cloudinary.com)
- [ ] Create account
- [ ] Get credentials from Dashboard
- [ ] Add to `.env`:
  ```
  CLOUDINARY_CLOUD_NAME="your-cloud-name"
  CLOUDINARY_API_KEY="your-api-key"
  CLOUDINARY_API_SECRET="your-api-secret"
  ```

## 🚢 Phase 7: Deployment (1 hour)

### Prepare for Deployment
- [ ] Test all features locally
- [ ] Review all content
- [ ] Check for console errors
- [ ] Test on mobile/tablet
- [ ] Run: `pnpm build` (should complete without errors)

### GitHub Setup
- [ ] Create GitHub repository
- [ ] Run:
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git branch -M main
  git remote add origin https://github.com/yourusername/dynasty-academy.git
  git push -u origin main
  ```

### Vercel Deployment
- [ ] Go to: [vercel.com](https://vercel.com)
- [ ] Click "New Project"
- [ ] Import your GitHub repository
- [ ] Add environment variables (copy from `.env`)
- [ ] Deploy!
- [ ] Wait for deployment to complete

### Production Database
- [ ] Create production database on Supabase
- [ ] Copy production connection string
- [ ] Add to Vercel environment variables as `DATABASE_URL`
- [ ] Redeploy Vercel project

### Post-Deployment
- [ ] Run migrations on production: `pnpm prisma migrate deploy`
- [ ] Create admin account on production
- [ ] Add content to production site
- [ ] Test all features on production
- [ ] Configure custom domain (optional)

## 📊 Phase 8: Analytics & SEO (Optional, 30 minutes)

### Google Analytics
- [ ] Create GA4 property
- [ ] Add measurement ID to `.env`:
  ```
  NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
  ```
- [ ] Verify tracking works

### SEO Optimization
- [ ] Add Open Graph images
- [ ] Create sitemap
- [ ] Submit to Google Search Console
- [ ] Add robots.txt
- [ ] Test meta tags with [metatags.io](https://metatags.io)

## 🎯 Phase 9: Testing & QA (1 hour)

### Functionality Testing
- [ ] Test user registration
- [ ] Test login/logout
- [ ] Test password reset (if implemented)
- [ ] Test creating book
- [ ] Test creating blog post
- [ ] Test editing content
- [ ] Test deleting content
- [ ] Test purchasing flow
- [ ] Test commenting
- [ ] Test liking/bookmarking
- [ ] Test following users

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Color contrast sufficient
- [ ] Forms have labels
- [ ] Images have alt text

## 🎉 Phase 10: Launch!

### Pre-Launch
- [ ] Final content review
- [ ] Test all links
- [ ] Verify contact form works
- [ ] Check email notifications
- [ ] Test payment flow one more time
- [ ] Backup database

### Launch Day
- [ ] Announce on social media
- [ ] Email your list (if applicable)
- [ ] Monitor for errors
- [ ] Respond to user feedback
- [ ] Track analytics

### Post-Launch
- [ ] Monitor Vercel logs for errors
- [ ] Check Stripe dashboard for orders
- [ ] Respond to comments
- [ ] Add more content regularly
- [ ] Engage with community

## 📈 Ongoing Maintenance

### Weekly
- [ ] Review analytics
- [ ] Respond to comments
- [ ] Check for errors in logs
- [ ] Back up database
- [ ] Add new content

### Monthly
- [ ] Update dependencies: `pnpm update`
- [ ] Review and improve SEO
- [ ] Analyze user behavior
- [ ] Plan new features
- [ ] Security audit

### Quarterly
- [ ] Major feature additions
- [ ] Design refresh (if needed)
- [ ] Performance optimization
- [ ] User survey/feedback
- [ ] Marketing campaign

---

## 🏆 Success Metrics

Track these to measure your success:
- [ ] 100+ registered users
- [ ] 10+ books/courses published
- [ ] 20+ blog posts published
- [ ] $1,000+ in sales
- [ ] 1,000+ page views/month
- [ ] 100+ email subscribers
- [ ] 50+ engaged community members

## 🆘 Troubleshooting

If stuck, check:
1. **[SETUP.md](./SETUP.md)** - Quick setup guide
2. **[README.md](./README.md)** - Full documentation
3. Terminal output for error messages
4. Prisma Studio to inspect database
5. Vercel logs for production errors

## 🎯 Your Next Steps

**Right now:**
1. [ ] Follow Phase 1: Initial Setup (10 minutes)
2. [ ] Follow Phase 2: Content Creation (30 minutes)
3. [ ] Start customizing (Phase 3)

**This week:**
- Complete Phases 1-5
- Add 5+ books and 5+ blog posts
- Test all features thoroughly

**This month:**
- Deploy to production (Phase 7)
- Set up analytics (Phase 8)
- Launch! (Phase 10)

**You've got this! 🚀**

---

**Need help?** Check [SETUP.md](./SETUP.md) or [README.md](./README.md)
