# 🚀 Quick Setup Guide

This guide will help you set up Dynasty Built Academy in under 10 minutes.

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ pnpm installed (`npm install -g pnpm`)
- ✅ A Supabase account (free) OR local PostgreSQL

## Step-by-Step Setup

### 1️⃣ Install Dependencies (1 minute)

```bash
cd "e:\web dev\dynasty\Dynasty Built Academy Website Design and Features\dynasty-academy-fullstack"
pnpm install
```

### 2️⃣ Set Up Database (3 minutes)

**Option A: Supabase (Recommended - FREE)**

1. Go to [supabase.com](https://supabase.com) and create account
2. Click "New Project"
3. Fill in:
   - **Name**: dynasty-academy
   - **Database Password**: Create strong password (save it!)
   - **Region**: Choose closest to you
4. Wait 2 minutes for project to initialize
5. Click "Settings" (bottom left) → "Database"
6. Scroll to "Connection string" → Click "URI"
7. Copy the connection string (looks like `postgresql://postgres.[ref]:[YOUR-PASSWORD]@...`)
8. Open `.env` file and paste:
```env
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

**Option B: Local PostgreSQL**

```bash
# Install PostgreSQL (if not installed)
# Windows: Download from postgresql.org
# Mac: brew install postgresql

# Create database
createdb dynasty_academy

# Update .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dynasty_academy"
```

### 3️⃣ Configure Environment Variables (2 minutes)

Open `.env` file and update:

```env
# Database (from step 2)
DATABASE_URL="your-database-url-here"

# NextAuth Secret - Generate with this command:
# Windows PowerShell: [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
# Mac/Linux: openssl rand -base64 32
NEXTAUTH_SECRET="paste-generated-secret-here"

# NextAuth URL
NEXTAUTH_URL="http://localhost:3000"

# Optional (can skip for now):
# STRIPE_SECRET_KEY=""
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
```

**Generate NEXTAUTH_SECRET:**

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

Copy the output and paste into `NEXTAUTH_SECRET` in `.env`

### 4️⃣ Initialize Database (1 minute)

```bash
# Run migrations
pnpm prisma migrate dev --name init

# Generate Prisma Client
pnpm prisma generate
```

You should see:
```
✔ Generated Prisma Client
```

### 5️⃣ Start the App (30 seconds)

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 🎯 Next Steps

### Create Your Admin Account

1. **Register a user account**
   - Go to http://localhost:3000/login
   - Click "Register" (or go to /register)
   - Fill in:
     - Name: Admin User
     - Email: admin@dynastyacademy.com
     - Password: (your choice, min 8 chars)
   - Click "Create Account"

2. **Make yourself admin**
   ```bash
   # Open Prisma Studio
   pnpm prisma studio
   ```
   - Opens at http://localhost:5555
   - Click "users" table
   - Find your user
   - Change `role` from `USER` to `ADMIN`
   - Click "Save 1 change"

3. **Access Admin Panel**
   - Go back to your app
   - Navigate to http://localhost:3000/admin
   - You should see the admin dashboard!

### Add Your First Book

1. Go to http://localhost:3000/admin/books
2. Click "Create New Book"
3. Fill in:
   - **Title**: My First Book
   - **Slug**: my-first-book (auto-generated)
   - **Description**: This is my first book on Dynasty Academy
   - **Price**: 29.99
   - **Category**: Business
   - **Content Type**: PDF
4. Click "Publish"

### Add Your First Blog Post

1. Go to http://localhost:3000/admin/blog
2. Click "Create New Post"
3. Fill in:
   - **Title**: Welcome to Dynasty Academy
   - **Content**: Write something amazing...
   - **Category**: Announcements
4. Click "Publish"

### View Your Content

- **Books**: http://localhost:3000/works
- **Blog**: http://localhost:3000/blog
- **Homepage**: http://localhost:3000

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**Solution**: Check your `DATABASE_URL` in `.env`

If using Supabase:
- Make sure you replaced `[YOUR-PASSWORD]` with your actual password
- Try the "Transaction" connection string instead of "Session"
- Check if your IP is allowed (Supabase Settings → Database → Connection Pooling)

### Error: "Invalid `prisma.user.create()`"

**Solution**: Run migrations again
```bash
pnpm prisma migrate reset
pnpm prisma migrate dev
```

### Error: "Module not found"

**Solution**: Reinstall dependencies
```bash
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Port 3000 already in use

**Solution**: 
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

Or use different port:
```bash
PORT=3001 pnpm dev
```

## 📚 What's Next?

### Development
- [ ] Customize theme colors in `src/config/site.ts`
- [ ] Add your logo to `public/`
- [ ] Modify homepage in `src/app/(public)/page.tsx`
- [ ] Set up Stripe for payments
- [ ] Configure OAuth providers (Google, GitHub)
- [ ] Set up file uploads (Cloudinary/Uploadthing)

### Deployment
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Set up production database (Supabase/Railway)
- [ ] Configure custom domain
- [ ] Set up analytics (Google Analytics/PostHog)

### Content
- [ ] Add 5-10 books/courses
- [ ] Write 3-5 blog posts
- [ ] Create About page content
- [ ] Set up contact form
- [ ] Add testimonials/reviews

## 🆘 Need Help?

- **Check the main README.md** for detailed documentation
- **Prisma Studio**: `pnpm prisma studio` to browse your database
- **View logs**: Check terminal for error messages
- **Reset everything**: `pnpm prisma migrate reset` (⚠️ deletes all data)

## 🎉 Success Checklist

- [ ] Dependencies installed
- [ ] Database connected
- [ ] Environment variables configured
- [ ] Migrations completed
- [ ] App running at localhost:3000
- [ ] Admin account created
- [ ] First book added
- [ ] First blog post published

**You're all set!** 🚀

---

**Estimated Total Time**: 7-10 minutes

Next: Read the [main README.md](./README.md) for advanced features and deployment.
