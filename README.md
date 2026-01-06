# 🏛️ Dynasty Academy

> A world-class full-stack learning platform with AI-powered features, gamification, and social learning.

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?logo=prisma)](https://www.prisma.io/)

---

## ✨ Features

### 📚 Learning Platform

- **Books & Courses** - Create, publish, and sell digital products
- **AI-Powered Content** - Generate lessons, quizzes, and summaries
- **Immersive Reader** - 3D book viewer with ambient sounds
- **Progress Tracking** - Track completion and comprehension

### 🤖 AI Integration

- **AI Coach** - Personalized learning assistant
- **RAG System** - Intelligent Q&A powered by Pinecone
- **Voice Commands** - "Hey Dynasty" voice assistant
- **Smart Narration** - ElevenLabs text-to-speech

### 🎮 Gamification

- **Achievements & Badges** - Unlock rewards for milestones
- **XP & Levels** - Progress through learning ranks
- **Streaks** - Daily engagement tracking
- **Dynasty Duels** - Competitive learning battles
- **Leaderboards** - Top performers showcase

### 🛒 E-Commerce

- **Stripe Payments** - Secure checkout
- **Instructor Payouts** - Revenue sharing
- **Shopping Cart** - Multi-item purchases
- **Certificates** - Completion certificates

### 👥 Social Features

- **Community Feed** - Share posts and updates
- **Follow System** - Connect with other learners
- **Comments & Likes** - Engage with content
- **Co-Reading** - Read books together

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (or Supabase)
- pnpm (recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/yasinjemal/dynasty-academy-fullstack.git
cd dynasty-academy-fullstack

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
pnpm prisma migrate dev

# Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
dynasty-academy-fullstack/
├── docs/                    # 📖 Documentation
│   ├── guides/             # How-to guides
│   ├── features/           # Feature documentation
│   ├── deployment/         # Deployment guides
│   ├── api/                # API reference
│   ├── architecture/       # System design docs
│   ├── testing/            # Testing guides
│   └── setup/              # Setup instructions
├── prisma/                  # 🗄️ Database schema & migrations
├── public/                  # 📂 Static assets
├── scripts/                 # 🔧 Utility scripts
│   ├── db/                 # Database checks
│   ├── migrations/         # Migration runners
│   ├── seed/               # Seed data
│   ├── sql/                # SQL scripts
│   ├── test/               # Test scripts
│   └── utils/              # Helper utilities
├── src/
│   ├── app/                # 📱 Next.js App Router
│   │   ├── (admin)/       # Admin dashboard
│   │   ├── (auth)/        # Authentication pages
│   │   ├── (dashboard)/   # User dashboard
│   │   ├── (public)/      # Public pages
│   │   └── api/           # API routes (60+)
│   ├── components/         # 🧩 React components
│   │   ├── admin/         # Admin components
│   │   ├── ai/            # AI features
│   │   ├── audio/         # Audio/voice
│   │   ├── books/         # Book reader
│   │   ├── courses/       # Course player
│   │   ├── gamification/  # XP, achievements
│   │   └── ui/            # Base UI components
│   ├── lib/                # 📚 Core libraries
│   ├── hooks/              # 🪝 Custom React hooks
│   ├── contexts/           # 🔄 React contexts
│   └── types/              # 📝 TypeScript types
└── tests/                   # 🧪 Test files
```

---

## 🛠️ Tech Stack

| Category          | Technology                   |
| ----------------- | ---------------------------- |
| **Framework**     | Next.js 15 (App Router)      |
| **Language**      | TypeScript                   |
| **Database**      | PostgreSQL + Prisma          |
| **Auth**          | Clerk + NextAuth             |
| **Styling**       | Tailwind CSS 4               |
| **UI Components** | Radix UI, Framer Motion      |
| **3D Graphics**   | Three.js, React Three Fiber  |
| **AI/ML**         | OpenAI, Anthropic, Langchain |
| **Vector DB**     | Pinecone                     |
| **Voice**         | ElevenLabs, Web Speech API   |
| **Payments**      | Stripe                       |
| **State**         | Zustand                      |
| **Caching**       | Upstash Redis                |

---

## 📝 Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Testing
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage

# Database
pnpm prisma studio    # Open Prisma Studio
pnpm prisma migrate dev    # Run migrations
pnpm prisma generate  # Generate Prisma Client
```

---

## 🔐 Environment Variables

See [.env.example](.env.example) for required variables:

```env
# Database
DATABASE_URL=
DIRECT_DATABASE_URL=

# Auth
CLERK_SECRET_KEY=
NEXTAUTH_SECRET=

# AI
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# And more...
```

---

## 📖 Documentation

Full documentation is available in the [docs/](docs/) folder:

- [Setup Guide](docs/setup/)
- [Feature Documentation](docs/features/)
- [API Reference](docs/api/)
- [Deployment Guide](docs/deployment/)
- [Testing Guide](docs/testing/)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary. All rights reserved.

---

<p align="center">
  Built with ❤️ by <strong>Dynasty Built Academy</strong>
</p>
