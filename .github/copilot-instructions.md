# GitHub Copilot Instructions for Dynasty Built Academy

This file provides context and guidelines for GitHub Copilot when working on this project.

## Project Overview

Dynasty Built Academy is a full-stack learning management and e-commerce platform built with modern web technologies. It combines content management, e-commerce, social features, and gamification into a comprehensive educational platform.

### Mission
Provide elite-level training across multiple domains including wealth building, mindset, AI automation, brand storytelling, sales growth, and more, blending ancient wisdom with modern strategy.

## Tech Stack

### Core Framework
- **Next.js 15** (App Router) - React framework with server components
- **TypeScript** - Type-safe JavaScript
- **Node.js** - Runtime environment (use `pnpm` for package management)

### Frontend
- **React 19** - UI library
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Radix UI** - Unstyled accessible components
- **Lucide React** - Icon library

### Backend & Database
- **PostgreSQL** - Primary database (hosted on Supabase)
- **Prisma** - ORM for database access
- **NextAuth.js v4** - Authentication
- **Stripe** - Payment processing

### State Management
- **Zustand** - Global state management (for cart, UI state)
- **React Hook Form** - Form state management
- **Zod** - Schema validation

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # User dashboard pages
│   ├── (admin)/           # Admin CMS pages
│   ├── (public)/          # Public pages (home, blog, etc)
│   └── api/               # API routes
├── components/
│   ├── books/             # Book-specific components
│   ├── shared/            # Reusable components
│   └── ui/                # Base UI primitives
├── lib/
│   ├── auth/              # Authentication logic
│   ├── db/                # Database client
│   ├── utils/             # Helper functions
│   └── validations/       # Zod schemas
├── contexts/              # React contexts
├── config/                # Configuration files
└── types/                 # TypeScript type definitions
```

## Coding Standards

### TypeScript
- **Always use TypeScript** - No plain JavaScript files
- **Explicit types** - Prefer explicit types over `any`
- **Interface over type** - Use `interface` for object types, `type` for unions/primitives
- **Strict mode** - TypeScript strict mode is enabled

### React/Next.js
- **Server Components by default** - Use server components unless interactivity is needed
- **'use client' directive** - Add at the top of files that need client-side interactivity
- **Async server components** - Server components can be async functions
- **File naming** - Use kebab-case for files: `user-profile.tsx`
- **Component naming** - Use PascalCase for components: `UserProfile`

### Component Structure
```tsx
// Example component structure
'use client' // Only if client component needed

import { useState } from 'react'
import { ComponentProps } from '@/types'

interface UserProfileProps {
  userId: string
  // Always define explicit prop types
}

export function UserProfile({ userId }: UserProfileProps) {
  // Component logic
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### Styling
- **Tailwind utility classes** - Use Tailwind for all styling
- **cn() helper** - Use `cn()` from `@/lib/utils/helpers` to merge classes
- **Dark mode** - Support dark mode with `dark:` variants
- **Responsive** - Mobile-first approach, use `sm:`, `md:`, `lg:` breakpoints
- **Theme colors** - Use semantic colors: `purple-600`, `blue-600`, `gold` accent

### API Routes
- **RESTful conventions** - Follow REST principles
- **Error handling** - Always handle errors with appropriate status codes
- **Authentication** - Use `getServerSession()` for auth checks
- **Response format** - Return JSON with consistent structure
```typescript
// Success response
return NextResponse.json({ data: result })

// Error response  
return NextResponse.json({ error: 'Error message' }, { status: 400 })
```

### Database (Prisma)
- **Prisma Client** - Use `prisma` from `@/lib/db/prisma`
- **Relations** - Always include necessary relations in queries
- **Transactions** - Use `prisma.$transaction()` for multi-step operations
- **Error handling** - Catch and handle Prisma errors appropriately

Example query:
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    books: true,
    orders: true
  }
})
```

### State Management
- **Server state** - Fetch on server when possible
- **Client state** - Use Zustand for complex global state
- **Form state** - Use React Hook Form with Zod validation
- **Local state** - Use `useState` for component-local state

### Authentication & Authorization
- **Role-based access** - Check user roles: `USER`, `AUTHOR`, `ADMIN`, `PREMIUM`
- **Protected routes** - Use middleware.ts for route protection
- **Session checks** - Always validate session on protected routes
```typescript
const session = await getServerSession(authOptions)
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

## Common Patterns

### Creating New Pages
1. Place in appropriate route group: `(public)`, `(dashboard)`, or `(admin)`
2. Use server components by default
3. Implement SEO metadata
```typescript
export const metadata = {
  title: 'Page Title | Dynasty Built Academy',
  description: 'Page description'
}
```

### Creating New API Routes
1. Place in `src/app/api/[feature]/route.ts`
2. Export HTTP method functions: `GET`, `POST`, `PUT`, `DELETE`
3. Add authentication checks
4. Handle errors appropriately

### Adding Database Models
1. Update `prisma/schema.prisma`
2. Run `pnpm prisma migrate dev --name description`
3. Generate client: `pnpm prisma generate`
4. Update TypeScript types if needed

### Creating New Components
1. Place in appropriate directory (ui, shared, or feature-specific)
2. Use TypeScript interfaces for props
3. Export as named export
4. Add JSDoc comments for complex components

## Testing & Development

### Development Commands
```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm prisma studio    # Open database GUI
pnpm prisma migrate dev # Run migrations
```

### Before Committing
- Build succeeds: `pnpm build`
- No TypeScript errors: Check terminal output
- No console errors in browser
- Test affected features manually

## Domain-Specific Knowledge

### E-Commerce Flow
1. User adds items to cart (Zustand store)
2. Checkout creates order via API
3. Stripe processes payment
4. Order status updated in database
5. Digital content access granted

### Content Management
- **Books** - Digital products (PDFs, courses, audio books)
- **Blog Posts** - Articles with rich content
- **Categories** - Organize content by domain (Wealth, Mindset, AI, etc.)
- **Status** - Draft, published, archived

### User Roles
- **USER** - Basic access, can purchase content
- **AUTHOR** - Can create blog posts
- **ADMIN** - Full access to CMS and admin panel
- **PREMIUM** - Access to premium content

### Social Features
- Comments (nested replies)
- Likes and bookmarks
- Follow system
- Notifications
- Achievements/gamification

## Important Notes

### Security
- Never expose sensitive credentials
- Validate all user inputs with Zod
- Sanitize database queries
- Use parameterized queries (Prisma handles this)
- Hash passwords with bcrypt

### Performance
- Use Next.js Image component for images
- Implement pagination for large lists
- Use database indexes for frequent queries
- Enable static generation where possible
- Lazy load heavy components

### Accessibility
- Use semantic HTML
- Include ARIA labels where needed
- Ensure keyboard navigation works
- Support screen readers
- Maintain color contrast ratios

### SEO
- Add metadata to all pages
- Use semantic HTML structure
- Include Open Graph tags
- Generate sitemaps
- Implement structured data

## File Conventions

### Naming
- **Pages**: `page.tsx` (Next.js convention)
- **Layouts**: `layout.tsx` (Next.js convention)
- **API Routes**: `route.ts` (Next.js convention)
- **Components**: `kebab-case.tsx` (e.g., `user-profile.tsx`)
- **Utilities**: `kebab-case.ts` (e.g., `format-date.ts`)
- **Types**: `kebab-case.ts` (e.g., `book-types.ts`)

### Imports
- Use `@/` alias for absolute imports from src
- Group imports: external → internal → types
- Sort alphabetically within groups

Example:
```typescript
import { useState } from 'react'
import { NextResponse } from 'next/server'

import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db/prisma'

import type { User } from '@/types'
```

## Environment Variables

Required variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Auth secret key
- `NEXTAUTH_URL` - App URL
- `STRIPE_SECRET_KEY` - Stripe API key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key

## Documentation

For more detailed information:
- **Quick Setup**: See `SETUP.md`
- **Full Documentation**: See `README.md`
- **Deployment**: See `DEPLOYMENT_GUIDE.md`
- **Checklist**: See `CHECKLIST.md`

## When Helping Users

### Prefer These Approaches
1. **Server Components** over client components when possible
2. **Prisma queries** over raw SQL
3. **Zod validation** for all user inputs
4. **Tailwind classes** over custom CSS
5. **Type-safe** approaches over runtime checks
6. **Existing patterns** from the codebase

### Avoid These
1. Adding unnecessary dependencies
2. Using deprecated Next.js features (Pages Router)
3. Bypassing authentication checks
4. Hardcoding values that should be configurable
5. Creating duplicate utilities that already exist
6. Using `any` type unless absolutely necessary

## Key Features to Preserve

When modifying the codebase, ensure these features continue to work:
- User authentication (email/password and OAuth)
- Book/course purchasing workflow
- Blog post creation and management
- Admin panel functionality
- Shopping cart and checkout
- User dashboard and progress tracking
- Comment system
- Notification system
- Achievement/gamification system
- Dark mode toggle
- Mobile responsiveness

## Brand Identity

- **Colors**: Black & gold/purple luxury theme
- **Tone**: Professional, empowering, no-nonsense
- **Values**: Truth over hype, builders first, relentless iteration
- **Target Audience**: Ambitious builders, entrepreneurs, learners

## Common Tasks

### Adding a New Feature
1. Design database schema (if needed)
2. Create Prisma models and migrations
3. Build API routes
4. Create UI components
5. Add to appropriate pages
6. Test thoroughly
7. Update documentation

### Fixing a Bug
1. Reproduce the issue
2. Identify root cause
3. Write fix with minimal changes
4. Test the fix
5. Ensure no regressions
6. Document if complex

### Optimizing Performance
1. Identify bottleneck
2. Consider caching strategies
3. Optimize database queries
4. Use React.memo/useMemo if needed
5. Measure improvement
6. Monitor in production

---

**Remember**: This is a production application serving real users. Prioritize stability, security, and user experience in all changes.
