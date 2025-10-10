# 🏛️ Dynasty Built Academy - Full-Stack PlatformThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



An award-winning full-stack web application with CMS, e-commerce, social features, and admin panel. Built with Next.js 14, TypeScript, Prisma, and Tailwind CSS.## Getting Started



## ✨ FeaturesFirst, run the development server:



### 🎨 Frontend```bash

- **Modern UI**: Black & gold luxury theme with Tailwind CSS 4npm run dev

- **Responsive Design**: Mobile-first approach# or

- **Animations**: Smooth transitions with Framer Motionyarn dev

- **SEO Optimized**: Meta tags, Open Graph, structured data# or

pnpm dev

### 🔐 Authentication & Authorization# or

- **NextAuth.js**: Email/password + OAuth (Google, GitHub)bun dev

- **Role-Based Access**: USER, AUTHOR, ADMIN, PREMIUM```

- **Secure**: Bcrypt password hashing, JWT sessions

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 📚 Content Management

- **Books/Courses**: Create, edit, publish digital productsYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- **Blog System**: Rich text editor, categories, tags

- **Media Library**: Image uploads with Cloudinary/UploadthingThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

- **SEO Fields**: Meta titles, descriptions, slugs

## Learn More

### 🛒 E-Commerce

- **Shopping Cart**: Zustand state managementTo learn more about Next.js, take a look at the following resources:

- **Stripe Integration**: Secure payments

- **Order Management**: Track purchases, download links- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- **Discount System**: Sale prices, coupons- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.



### 🌐 Social FeaturesYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

- **Comments**: Nested replies on blog posts

- **Likes & Bookmarks**: Save favorite content## Deploy on Vercel

- **Follow System**: Follow authors/users

- **Notifications**: Real-time updatesThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.



### 📊 Admin PanelCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

- **Dashboard**: Analytics, stats, recent activity
- **Content Management**: CRUD for books & blog posts
- **User Management**: View, edit, delete users
- **Order Tracking**: View all transactions
- **No-Code CMS**: Manage all content without editing code

### 🎮 Gamification
- **Achievements**: Unlock badges for milestones
- **Progress Tracking**: Track reading progress
- **Leaderboards**: Top users, most active

## 🚀 Tech Stack

### Core
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)

### Frontend
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend & Auth
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Validation**: [Zod](https://zod.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **State**: [Zustand](https://zustand-demo.pmnd.rs/)

### Tools
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Payments**: [Stripe](https://stripe.com/)
- **File Upload**: [Uploadthing](https://uploadthing.com/) or [Cloudinary](https://cloudinary.com/)

## 📦 Quick Start

### 1. Install dependencies
```bash
pnpm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```

**Required environment variables:**
- `DATABASE_URL`: PostgreSQL connection string (use Supabase for free tier)
- `NEXTAUTH_SECRET`: Run `openssl rand -base64 32` to generate
- `NEXTAUTH_URL`: `http://localhost:3000`

**Optional (for full functionality):**
- Stripe keys for payments
- Google/GitHub OAuth credentials
- Cloudinary/Uploadthing for file uploads

### 3. Set up database

**Option A: Supabase (Recommended - Free Tier)**
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings > Database > Connection String
4. Copy URI and update `.env`:
```
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL, then:
createdb dynasty_academy
# Update .env:
DATABASE_URL="postgresql://postgres:password@localhost:5432/dynasty_academy"
```

### 4. Run migrations
```bash
pnpm prisma migrate dev
```

### 5. Start development server
```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 🏗️ Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, Register pages
│   ├── (dashboard)/         # User dashboard
│   ├── (admin)/             # Admin CMS panel
│   ├── (public)/            # Home, Works, Blog, About, Contact
│   └── api/                 # API routes
├── components/
│   ├── admin/               # Admin-only components
│   ├── auth/                # Auth forms
│   ├── shared/              # Reusable components
│   └── ui/                  # UI primitives (buttons, modals, etc.)
├── lib/
│   ├── auth/                # NextAuth configuration
│   ├── db/                  # Prisma client
│   ├── utils/               # Helper functions
│   └── validations/         # Zod schemas
├── hooks/                   # Custom React hooks
├── stores/                  # Zustand global state
├── types/                   # TypeScript definitions
└── config/                  # Site configuration
```

## 🎯 Create Admin Account

1. Start the app and register a normal user account
2. Open Prisma Studio:
```bash
pnpm prisma studio
```
3. Go to `users` table at `http://localhost:5555`
4. Find your user and change `role` from `USER` to `ADMIN`
5. Access admin panel at `/admin`

## 📝 Adding Content (No Code Required!)

### Via Admin Panel
1. Login as ADMIN
2. Navigate to:
   - `/admin/books` - Create books/courses
   - `/admin/blog` - Write blog posts
   - `/admin/users` - Manage users
   - `/admin/orders` - View transactions

3. Click "Create New" and fill the form
4. Publish!

### Via Prisma Studio (Development)
```bash
pnpm prisma studio
```
Edit data directly in the browser at `http://localhost:5555`

## 🚢 Deployment to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/dynasty-academy.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Add environment variables (copy from `.env`)
5. Deploy!

### 3. Environment Variables on Vercel
Add these in Vercel Dashboard > Settings > Environment Variables:
- `DATABASE_URL` (use Supabase production URL)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your vercel.app domain)
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- OAuth credentials (if using)

### 4. Run migrations on production
```bash
pnpm prisma migrate deploy
```

## 🛠️ Development Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Open Prisma Studio
pnpm prisma studio

# Create new migration
pnpm prisma migrate dev --name your_migration_name

# Generate Prisma Client
pnpm prisma generate

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset
```

## 🎨 Customization

### Change Theme Colors
Edit `src/config/site.ts`:
```typescript
export const theme = {
  colors: {
    primary: '#D4AF37',    // Your brand color
    secondary: '#000000',  // Secondary color
    // ...
  }
}
```

### Update Site Info
Edit `src/config/site.ts`:
```typescript
export const siteConfig = {
  name: 'Your Site Name',
  description: 'Your description',
  url: 'https://yoursite.com',
  // ...
}
```

### Modify Navigation
Edit `src/config/site.ts`:
```typescript
export const navigation = {
  main: [
    { name: 'Home', href: '/' },
    { name: 'Custom Page', href: '/custom' },
    // ...
  ]
}
```

## 📊 Database Schema

### Key Models
- **User**: Authentication, profiles, roles
- **Book**: Digital products (PDFs, courses, etc.)
- **BlogPost**: Blog articles
- **Order**: E-commerce transactions
- **Comment**: Blog comments (nested)
- **Like**: Social engagement
- **Bookmark**: Saved content
- **Follow**: User relationships
- **Notification**: Real-time alerts
- **Achievement**: Gamification

See `prisma/schema.prisma` for full schema.

## 🔑 API Routes

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/signin` - Login

### Books (Protected)
- `GET /api/books` - List all books
- `GET /api/books/[slug]` - Get single book
- `POST /api/books` - Create (Admin only)
- `PUT /api/books/[id]` - Update (Admin only)
- `DELETE /api/books/[id]` - Delete (Admin only)

### Blog
- `GET /api/blog` - List posts
- `GET /api/blog/[slug]` - Get post
- `POST /api/blog` - Create (Admin/Author)
- `PUT /api/blog/[id]` - Update (Admin/Author)
- `DELETE /api/blog/[id]` - Delete (Admin)

### Orders
- `POST /api/orders/checkout` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/[id]` - Get order details

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] AI-powered recommendations
- [ ] Live courses/webinars
- [ ] Community forums
- [ ] Affiliate program
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Email marketing integration
- [ ] Subscription tiers

## 🆘 Support

Need help? Reach out:
- 📧 Email: support@dynastyacademy.com
- 💬 Discord: [Join our community](#)
- 📖 Documentation: [docs.dynastyacademy.com](#)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/dynasty-academy/issues)

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

Built with ❤️ by Dynasty Built Academy Team
