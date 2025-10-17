import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-900">
      <nav className="sticky top-0 z-50 border-b border-purple-200/50 dark:border-purple-900/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link
              href="/"
              className="flex items-center space-x-2 md:space-x-3 group"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                <span className="text-white font-bold text-lg md:text-xl">
                  DB
                </span>
              </div>
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Dynasty Built Academy
              </span>
            </Link>
            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-sm font-medium text-purple-700 dark:text-purple-300 mb-6">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              From Underdog to Dynasty
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Learn. Build. Own.
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed">
              Dynasty Built Academy turns underdogs into builders. We blend
              elite strategy, practical playbooks, and AI-powered learning to
              help creators, founders, and students build wealth, work, and
              wisdom—step by step.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-purple-500/25"
                >
                  Start Building 🚀
                </Button>
              </Link>
              <Link href="/books">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 px-8 py-6 text-lg rounded-xl"
                >
                  Browse Library �
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-purple-200/50 dark:border-purple-800/50">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Who We Are 🎯
            </h2>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Dynasty Built Academy is a social-first learning platform for
              ambitious underdogs. We publish elite-level manuals, run practical
              courses, and provide a marketplace for digital products. Our
              approach is simple: short lessons, real tools, measurable
              outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12">
            {/* Vision */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl p-8 border border-purple-200 dark:border-purple-700/50">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Our Vision
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                A world where first-generation builders can access elite
                knowledge, modern tools, and community—so they can create
                assets, not just income, and pass on a legacy with dignity.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl p-8 border border-blue-200 dark:border-blue-700/50">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Our Mission
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Deliver practical, AI-assisted education and tools—books,
                courses, and playbooks—paired with a community and marketplace
                that convert learning into assets, income, and impact.
              </p>
            </div>
          </div>

          {/* What Makes Us Different */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 md:p-10 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">
              What Makes Us Different ⚡
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🧠</div>
                <h4 className="font-bold text-lg mb-2">
                  Ancient Wisdom Meets Modern Strategy
                </h4>
                <p className="text-white/90 text-sm">
                  Qur'anic principles, African proverbs, behavioral psychology,
                  and product thinking—all in one.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🤖</div>
                <h4 className="font-bold text-lg mb-2">AI-Powered Learning</h4>
                <p className="text-white/90 text-sm">
                  PDF-to-Course AI, smart tutors, personalized paths, and voice
                  intelligence.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">📋</div>
                <h4 className="font-bold text-lg mb-2">Action Over Theory</h4>
                <p className="text-white/90 text-sm">
                  Practical playbooks, checklists, dashboards, and templates you
                  can use today.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🌍</div>
                <h4 className="font-bold text-lg mb-2">
                  Community-First Platform
                </h4>
                <p className="text-white/90 text-sm">
                  10K+ learners, co-reading, study rooms, and social learning
                  features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Features Section - NEW */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Complete Learning Ecosystem 🚀
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            12+ premium features designed to accelerate your learning and
            building journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Books Library */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-orange-200/50 dark:border-orange-800/50 shadow-lg hover:-translate-y-2 transition-all">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Premium Books Library
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  500+ curated books with AI reading modes, co-reading, and
                  luxury listen experience
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Courses */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50 shadow-lg hover:-translate-y-2 transition-all">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Interactive Courses
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Professional video lessons, quizzes, certificates, and
                  real-time progress tracking
                </p>
              </div>
            </div>
          </div>

          {/* PDF-to-Course AI */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/50 shadow-lg hover:-translate-y-2 transition-all">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  PDF-to-Course AI
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Upload any PDF and generate a 12-lesson course with quizzes in
                  2 minutes
                </p>
                <span className="inline-block mt-2 px-2 py-1 text-[10px] font-bold rounded-full bg-purple-500 text-white">
                  Revolutionary
                </span>
              </div>
            </div>
          </div>

          {/* Community Feed */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-green-200/50 dark:border-green-800/50 shadow-lg hover:-translate-y-2 transition-all">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Community Feed
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Share insights, discuss books, and connect with 10,000+
                  ambitious learners
                </p>
              </div>
            </div>
          </div>

          {/* Co-Reading */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-pink-200/50 dark:border-pink-800/50 shadow-lg hover:-translate-y-2 transition-all">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Co-Reading Experience
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Read together in real-time with live chat, reactions, and
                  presence indicators
                </p>
              </div>
            </div>
          </div>

          {/* AI Audio */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-indigo-200/50 dark:border-indigo-800/50 shadow-lg hover:-translate-y-2 transition-all">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎵</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  AI Audio Intelligence
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Professional text-to-speech with 8 neural voices and ambient
                  sounds
                </p>
              </div>
            </div>
          </div>

          {/* Dynasty Brain */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-violet-200/50 dark:border-violet-800/50 shadow-lg hover:-translate-y-2 transition-all">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Dynasty Brain AI
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  AI tutor, personalized learning paths, and smart
                  recommendations
                </p>
                <span className="inline-block mt-2 px-2 py-1 text-[10px] font-bold rounded-full bg-violet-500 text-white">
                  AI-Powered
                </span>
              </div>
            </div>
          </div>

          {/* Study Rooms */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-cyan-200/50 dark:border-cyan-800/50 shadow-lg hover:-translate-y-2 transition-all">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📹</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Study Rooms
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Live video collaboration with screen sharing and group
                  activities
                </p>
              </div>
            </div>
          </div>

          {/* Gamification */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-yellow-200/50 dark:border-yellow-800/50 shadow-lg hover:-translate-y-2 transition-all">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Dynasty Points
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Gamification with XP, levels, achievements, and daily streaks
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - 12 Month Goals */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Our 12-Month Vision 📊
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Measurable goals, transparent progress, real impact
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 md:p-8 text-center shadow-xl transform hover:scale-105 transition-transform">
            <p className="text-4xl md:text-5xl font-bold text-white mb-2">
              10K+
            </p>
            <p className="text-white/90 text-sm md:text-base">
              Registered Users
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 md:p-8 text-center shadow-xl transform hover:scale-105 transition-transform">
            <p className="text-4xl md:text-5xl font-bold text-white mb-2">
              R1M
            </p>
            <p className="text-white/90 text-sm md:text-base">GMV Target</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl p-6 md:p-8 text-center shadow-xl transform hover:scale-105 transition-transform">
            <p className="text-4xl md:text-5xl font-bold text-white mb-2">
              5K+
            </p>
            <p className="text-white/90 text-sm md:text-base">
              Certificates Issued
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 md:p-8 text-center shadow-xl transform hover:scale-105 transition-transform">
            <p className="text-4xl md:text-5xl font-bold text-white mb-2">
              10M+
            </p>
            <p className="text-white/90 text-sm md:text-base">Video Views</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-6 md:p-8 text-center shadow-xl transform hover:scale-105 transition-transform">
            <p className="text-4xl md:text-5xl font-bold text-white mb-2">
              25K+
            </p>
            <p className="text-white/90 text-sm md:text-base">
              Email Subscribers
            </p>
          </div>
        </div>
      </div>

      {/* 7 Core Values */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Our 7 Core Values 💎
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            These principles guide every decision, every lesson, and every
            interaction at Dynasty Built Academy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Truth over hype */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/50 shadow-lg hover:-translate-y-1 transition-transform">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💯</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Truth over hype
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  No fluff, only what works. Real strategies, honest metrics.
                </p>
              </div>
            </div>
          </div>

          {/* Builders first */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50 shadow-lg hover:-translate-y-1 transition-transform">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔨</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Builders first
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Action beats theory. Ship, iterate, improve.
                </p>
              </div>
            </div>
          </div>

          {/* Honor & barakah */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-green-200/50 dark:border-green-800/50 shadow-lg hover:-translate-y-1 transition-transform">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🌙</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Honor & barakah
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Halal wealth, ethical wins, blessed outcomes.
                </p>
              </div>
            </div>
          </div>

          {/* Craftsmanship */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-orange-200/50 dark:border-orange-800/50 shadow-lg hover:-translate-y-1 transition-transform">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Craftsmanship
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Elegant design, clear writing, robust code.
                </p>
              </div>
            </div>
          </div>

          {/* Ownership */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-pink-200/50 dark:border-pink-800/50 shadow-lg hover:-translate-y-1 transition-transform">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏰</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Ownership
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Build assets you control. Your work, your equity.
                </p>
              </div>
            </div>
          </div>

          {/* Service */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-teal-200/50 dark:border-teal-800/50 shadow-lg hover:-translate-y-1 transition-transform">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🤝</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Service
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Lift your family and community. Success shared is multiplied.
                </p>
              </div>
            </div>
          </div>

          {/* Relentless iteration */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-indigo-200/50 dark:border-indigo-800/50 shadow-lg hover:-translate-y-1 transition-transform md:col-span-2 lg:col-span-1">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Relentless iteration
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Improve daily. 1% better compounds into excellence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            What You'll Learn 📚
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Elite-level training across 8 core domains through books, courses,
            and interactive content
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Wealth & Work (Halal)",
              icon: "💰",
              desc: "Money systems, asset building, side hustles, pricing",
            },
            {
              title: "Mindset & Discipline",
              icon: "🧠",
              desc: "Habits, focus, anti-distraction, grit",
            },
            {
              title: "AI & Automation",
              icon: "🤖",
              desc: "Writing, visuals, no-code apps, agents",
            },
            {
              title: "Brand & Storytelling",
              icon: "📖",
              desc: "Positioning, identity, content engine",
            },
            {
              title: "Sales & Growth",
              icon: "📈",
              desc: "Offers, funnels, launches, retention",
            },
            {
              title: "Operations & Systems",
              icon: "⚙️",
              desc: "SOPs, dashboards, time blocking",
            },
            {
              title: "Community & Leadership",
              icon: "👥",
              desc: "Audience building, partnerships",
            },
            {
              title: "Spiritual Intelligence",
              icon: "🌙",
              desc: "Barakah, intentions, ethics",
            },
          ].map((category, idx) => (
            <div
              key={idx}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg hover:-translate-y-2 hover:border-purple-400 dark:hover:border-purple-600 transition-all"
            >
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {category.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {category.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Founder Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center">
            <div className="md:col-span-1 text-center md:text-left">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white/20 backdrop-blur-xl rounded-full mx-auto md:mx-0 flex items-center justify-center border-4 border-white/50">
                <span className="text-6xl md:text-7xl">👨🏽‍💼</span>
              </div>
            </div>
            <div className="md:col-span-2 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Meet Yasin Ali
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-6 leading-relaxed">
                Founder of Dynasty Built Academy. I build practical, halal
                wealth systems for first-generation builders. Books, playbooks,
                AI workflows. From underdog to dynasty.
              </p>
              <p className="text-white/80 mb-6 leading-relaxed">
                Yasin Ali is a creator, entrepreneur, and systems thinker from
                South Africa. He writes high-leverage manuals for
                first-generation builders—blending Qur'anic principles,
                psychology, and modern business strategy. His goal: help
                underdogs build assets, not just income, and pass on a dignified
                legacy.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-xl rounded-lg text-sm font-medium">
                  🇿🇦 South Africa
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-xl rounded-lg text-sm font-medium">
                  📚 Author
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-xl rounded-lg text-sm font-medium">
                  💻 Systems Builder
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-xl rounded-lg text-sm font-medium">
                  🤖 AI Enthusiast
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 md:p-16 text-center shadow-2xl border border-purple-200 dark:border-purple-800">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Build Quietly. Win Loudly. 🏆
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of first-generation builders who are turning
            knowledge into assets, income into equity, and dreams into legacy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-xl font-semibold"
              >
                Start Your Dynasty
              </Button>
            </Link>
            <Link href="/books">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 px-8 py-6 text-lg rounded-xl font-semibold"
              >
                Explore Playbooks
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-purple-200 dark:border-purple-900 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DB</span>
              </div>
              <span className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Dynasty Built Academy
              </span>
            </div>
            <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
              <Link
                href="/about"
                className="hover:text-purple-600 transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="hover:text-purple-600 transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/blog"
                className="hover:text-purple-600 transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/books"
                className="hover:text-purple-600 transition-colors"
              >
                Books
              </Link>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 dark:text-gray-500 mt-6">
            © {new Date().getFullYear()} Dynasty Built Academy. All rights
            reserved. • From Underdog to Dynasty
          </div>
        </div>
      </footer>
    </div>
  );
}
