"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  DollarSign,
  Users,
  BookOpen,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Eye,
  MessageSquare,
  Shield,
  Award,
  Plus,
  PlayCircle,
  Clock,
  BarChart3,
  Zap,
  Target,
  Calendar,
  ChevronRight,
  Video,
  FileText,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface DashboardData {
  stats: {
    totalRevenue: number;
    monthlyRevenue: number;
    totalStudents: number;
    activeCourses: number;
    draftCourses: number;
    averageRating: number;
    totalReviews: number;
    totalLessons: number;
  };
  recentEnrollments: {
    studentName: string;
    studentImage: string | null;
    courseName: string;
    courseSlug: string;
    date: string;
    amount: number;
  }[];
  coursePerformance: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
    students: number;
    lessons: number;
    reviews: number;
    rating: number;
    revenue: number;
    status: "published" | "draft";
  }[];
  trustScore: {
    totalScore: number;
    tier: string;
    breakdown: {
      contentQuality: number;
      engagement: number;
      reliability: number;
      community: number;
      compliance: number;
    };
    multipliers: {
      revenueShare: number;
      visibility: number;
      moderationThreshold: number;
    };
  };
}

export default function InstructorDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const response = await fetch("/api/instructor/dashboard");
      
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Unable to load dashboard data. Please try again.");
      
      // Set fallback mock data for development
      setData({
        stats: {
          totalRevenue: 12450,
          monthlyRevenue: 3200,
          totalStudents: 847,
          activeCourses: 5,
          draftCourses: 2,
          averageRating: 4.8,
          totalReviews: 234,
          totalLessons: 156,
        },
        recentEnrollments: [
          {
            studentName: "John Doe",
            studentImage: null,
            courseName: "Advanced Web Development",
            courseSlug: "advanced-web-dev",
            date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            amount: 99,
          },
          {
            studentName: "Jane Smith",
            studentImage: null,
            courseName: "React Masterclass",
            courseSlug: "react-masterclass",
            date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            amount: 149,
          },
          {
            studentName: "Mike Johnson",
            studentImage: null,
            courseName: "TypeScript Fundamentals",
            courseSlug: "typescript-fundamentals",
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            amount: 79,
          },
        ],
        coursePerformance: [
          {
            id: "1",
            title: "Advanced Web Development",
            slug: "advanced-web-dev",
            thumbnail: null,
            students: 234,
            lessons: 45,
            reviews: 89,
            rating: 4.9,
            revenue: 23166,
            status: "published",
          },
          {
            id: "2",
            title: "React Masterclass",
            slug: "react-masterclass",
            thumbnail: null,
            students: 156,
            lessons: 32,
            reviews: 67,
            rating: 4.7,
            revenue: 23244,
            status: "published",
          },
          {
            id: "3",
            title: "TypeScript Fundamentals",
            slug: "typescript-fundamentals",
            thumbnail: null,
            students: 98,
            lessons: 24,
            reviews: 34,
            rating: 4.8,
            revenue: 7742,
            status: "published",
          },
        ],
        trustScore: {
          totalScore: 720,
          tier: "Trusted",
          breakdown: {
            contentQuality: 250,
            engagement: 180,
            reliability: 160,
            community: 80,
            compliance: 50,
          },
          multipliers: {
            revenueShare: 0.8,
            visibility: 2,
            moderationThreshold: 70,
          },
        },
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) return null;

  const { stats, recentEnrollments, coursePerformance, trustScore } = data;

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Instructor Dashboard 🎓
          </h1>
          <p className="text-gray-400 mt-2">
            Track your courses, earnings, and student engagement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? "animate-spin" : ""}`} />
          </motion.button>
          <Link href="/instructor/create">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold text-white shadow-lg shadow-purple-500/25"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Create Course</span>
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
        >
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <p className="text-yellow-300 text-sm">{error} (Showing demo data)</p>
        </motion.div>
      )}

      {/* Trust Score & Quick Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trust Score Card */}
        <TrustScoreCard trustScore={trustScore} />

        {/* Revenue Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-cyan-500/10 border border-green-500/20 rounded-2xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
              <h2 className="text-4xl font-bold text-white">
                ${stats.totalRevenue.toLocaleString()}
              </h2>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MiniStatCard
              label="This Month"
              value={`$${stats.monthlyRevenue.toLocaleString()}`}
              change="+12.5%"
              positive
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <MiniStatCard
              label="Students"
              value={stats.totalStudents.toLocaleString()}
              change="+47 this week"
              positive
              icon={<Users className="w-4 h-4" />}
            />
            <MiniStatCard
              label="Courses"
              value={stats.activeCourses.toString()}
              subtext={`${stats.draftCourses} drafts`}
              icon={<BookOpen className="w-4 h-4" />}
            />
            <MiniStatCard
              label="Rating"
              value={stats.averageRating.toFixed(1)}
              subtext={`${stats.totalReviews} reviews`}
              icon={<Star className="w-4 h-4 text-yellow-400" />}
            />
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-green-500/20">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">Revenue Share:</span>
              <span className="text-green-400 font-semibold">
                {(trustScore.multipliers.revenueShare * 100).toFixed(0)}%
              </span>
            </div>
            <Link
              href="/instructor/revenue"
              className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              View Details <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Course Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/50 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Course Performance</h2>
          </div>
          <Link
            href="/instructor/courses"
            className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {coursePerformance.length > 0 ? (
          <div className="grid gap-4">
            {coursePerformance.slice(0, 3).map((course, index) => (
              <CoursePerformanceCard key={course.id} course={course} index={index} />
            ))}
          </div>
        ) : (
          <EmptyCoursesState />
        )}
      </motion.div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enrollments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-slate-900/50 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Recent Enrollments</h2>
            </div>
            <Link
              href="/instructor/students"
              className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentEnrollments.length > 0 ? (
            <div className="space-y-3">
              {recentEnrollments.map((enrollment, index) => (
                <EnrollmentCard key={index} enrollment={enrollment} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No recent enrollments</p>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/50 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-pink-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-pink-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Quick Actions</h2>
          </div>

          <div className="space-y-3">
            <QuickActionButton
              href="/instructor/create"
              icon={<Plus className="w-5 h-5" />}
              label="Create New Course"
              description="Start building your next course"
              gradient="from-purple-600 to-pink-600"
            />
            <QuickActionButton
              href="/instructor/create/smart"
              icon={<Sparkles className="w-5 h-5" />}
              label="AI Course Builder"
              description="Generate course with AI"
              gradient="from-cyan-600 to-blue-600"
              badge="New"
            />
            <QuickActionButton
              href="/instructor/create/youtube"
              icon={<Video className="w-5 h-5" />}
              label="Import from YouTube"
              description="Convert playlists to courses"
              gradient="from-red-600 to-orange-600"
            />
            <QuickActionButton
              href="/instructor/analytics"
              icon={<BarChart3 className="w-5 h-5" />}
              label="View Analytics"
              description="Track your performance"
            />
            <QuickActionButton
              href="/instructor/revenue"
              icon={<DollarSign className="w-5 h-5" />}
              label="Revenue & Payouts"
              description="Manage your earnings"
            />
          </div>
        </motion.div>
      </div>

      {/* Goals & Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <Target className="w-5 h-5 text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Next Milestones</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MilestoneCard
            title="1,000 Students"
            current={stats.totalStudents}
            target={1000}
            icon={<Users className="w-5 h-5" />}
            color="blue"
          />
          <MilestoneCard
            title="Elite Trust Tier"
            current={trustScore.totalScore}
            target={800}
            icon={<Shield className="w-5 h-5" />}
            color="purple"
          />
          <MilestoneCard
            title="$50,000 Earnings"
            current={stats.totalRevenue}
            target={50000}
            icon={<DollarSign className="w-5 h-5" />}
            color="green"
            prefix="$"
          />
        </div>
      </motion.div>
    </div>
  );
}

// Sub-components

function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto animate-pulse">
      <div className="h-12 bg-white/5 rounded-xl w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-64 bg-white/5 rounded-2xl" />
        <div className="lg:col-span-2 h-64 bg-white/5 rounded-2xl" />
      </div>
      <div className="h-80 bg-white/5 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-white/5 rounded-2xl" />
        <div className="h-64 bg-white/5 rounded-2xl" />
      </div>
    </div>
  );
}

function TrustScoreCard({ trustScore }: { trustScore: DashboardData["trustScore"] }) {
  const tierColors: Record<string, string> = {
    Legendary: "from-yellow-500 to-orange-500",
    Elite: "from-purple-500 to-pink-500",
    Trusted: "from-cyan-500 to-blue-500",
    Verified: "from-green-500 to-emerald-500",
    Unverified: "from-gray-500 to-slate-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-cyan-500/20 rounded-xl">
          <Shield className="w-6 h-6 text-cyan-400" />
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${
            tierColors[trustScore.tier] || tierColors.Unverified
          } text-white`}
        >
          {trustScore.tier}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-gray-400 text-sm mb-1">Trust Score</p>
        <h3 className="text-3xl font-bold text-white">
          {trustScore.totalScore}
          <span className="text-lg text-gray-500">/1000</span>
        </h3>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-2 mb-4">
        <ScoreBar label="Content" value={trustScore.breakdown.contentQuality} max={300} color="purple" />
        <ScoreBar label="Engagement" value={trustScore.breakdown.engagement} max={200} color="blue" />
        <ScoreBar label="Reliability" value={trustScore.breakdown.reliability} max={200} color="green" />
      </div>

      <Link
        href="/admin/instructor-verification"
        className="block w-full py-2 text-center text-cyan-400 hover:text-cyan-300 text-sm font-medium border border-cyan-500/30 hover:bg-cyan-500/10 rounded-lg transition-colors"
      >
        Improve Score →
      </Link>
    </motion.div>
  );
}

function ScoreBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percentage = Math.min(100, (value / max) * 100);
  const colorMap: Record<string, string> = {
    purple: "from-purple-500 to-pink-500",
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-20">{label}</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colorMap[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-12 text-right">
        {value}/{max}
      </span>
    </div>
  );
}

function MiniStatCard({
  label,
  value,
  change,
  positive,
  subtext,
  icon,
}: {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  subtext?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-3 bg-white/5 rounded-xl">
      <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
        {icon}
        {label}
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      {change && (
        <div className={`text-xs flex items-center gap-1 ${positive ? "text-green-400" : "text-red-400"}`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      )}
      {subtext && <div className="text-xs text-gray-500">{subtext}</div>}
    </div>
  );
}

function CoursePerformanceCard({
  course,
  index,
}: {
  course: DashboardData["coursePerformance"][0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-purple-500/30 transition-all group"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            width={64}
            height={64}
            className="rounded-lg object-cover"
          />
        ) : (
          <BookOpen className="w-6 h-6 text-purple-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-white truncate">{course.title}</h3>
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              course.status === "published"
                ? "bg-green-500/20 text-green-400"
                : "bg-yellow-500/20 text-yellow-400"
            }`}
          >
            {course.status}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {course.students}
          </span>
          <span className="flex items-center gap-1">
            <PlayCircle className="w-3 h-3" /> {course.lessons} lessons
          </span>
          <span className="flex items-center gap-1 text-yellow-400">
            <Star className="w-3 h-3 fill-current" /> {course.rating.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="text-right">
        <div className="text-lg font-bold text-green-400">${course.revenue.toLocaleString()}</div>
        <div className="text-xs text-gray-500">{course.reviews} reviews</div>
      </div>

      <Link
        href={`/instructor/courses/${course.slug}`}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </Link>
    </motion.div>
  );
}

function EmptyCoursesState() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <BookOpen className="w-8 h-8 text-purple-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No courses yet</h3>
      <p className="text-gray-400 mb-6">Create your first course and start earning!</p>
      <Link href="/instructor/create">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white"
        >
          Create Your First Course
        </motion.button>
      </Link>
    </div>
  );
}

function EnrollmentCard({
  enrollment,
  index,
}: {
  enrollment: DashboardData["recentEnrollments"][0];
  index: number;
}) {
  const timeAgo = getTimeAgo(new Date(enrollment.date));

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
    >
      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
        {enrollment.studentName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white truncate">{enrollment.studentName}</div>
        <div className="text-sm text-gray-400 truncate">{enrollment.courseName}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-semibold text-green-400">+${enrollment.amount}</div>
        <div className="text-xs text-gray-500">{timeAgo}</div>
      </div>
    </motion.div>
  );
}

function QuickActionButton({
  href,
  icon,
  label,
  description,
  gradient,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  gradient?: string;
  badge?: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative flex items-center gap-3 p-3 rounded-xl transition-all ${
          gradient
            ? `bg-gradient-to-r ${gradient} text-white`
            : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
        }`}
      >
        <div className={`p-2 rounded-lg ${gradient ? "bg-white/20" : "bg-white/10"}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="font-medium flex items-center gap-2">
            {label}
            {badge && (
              <span className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded-full">{badge}</span>
            )}
          </div>
          <div className={`text-xs ${gradient ? "text-white/70" : "text-gray-500"}`}>
            {description}
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 ${gradient ? "text-white/70" : "text-gray-500"}`} />
      </motion.div>
    </Link>
  );
}

function MilestoneCard({
  title,
  current,
  target,
  icon,
  color,
  prefix = "",
}: {
  title: string;
  current: number;
  target: number;
  icon: React.ReactNode;
  color: string;
  prefix?: string;
}) {
  const percentage = Math.min(100, (current / target) * 100);
  const colorMap: Record<string, { bg: string; text: string; bar: string }> = {
    blue: { bg: "bg-blue-500/20", text: "text-blue-400", bar: "from-blue-500 to-cyan-500" },
    purple: { bg: "bg-purple-500/20", text: "text-purple-400", bar: "from-purple-500 to-pink-500" },
    green: { bg: "bg-green-500/20", text: "text-green-400", bar: "from-green-500 to-emerald-500" },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <span className={colors.text}>{icon}</span>
        </div>
        <span className="font-medium text-white">{title}</span>
      </div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className={colors.text}>
          {prefix}{current.toLocaleString()}
        </span>
        <span className="text-gray-500">
          / {prefix}{target.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colors.bar} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-2 text-right">
        {percentage.toFixed(0)}% complete
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
