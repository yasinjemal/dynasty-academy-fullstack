// Course Detail Data API - Server-side data fetching with fallback
import { prisma } from "@/lib/prisma";
import { cache } from "react";

// ============================================================================
// INTERFACES
// ============================================================================

export interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  coverImage: string;
  previewVideo: string | null;
  level: "beginner" | "intermediate" | "advanced";
  category: string;
  tags: string[];
  duration: number; // in minutes
  lessonCount: number;
  price: number;
  originalPrice: number;
  discount: number;
  isFree: boolean;
  isPremium: boolean;
  featured: boolean;
  status: string;
  instructor: InstructorInfo;
  stats: CourseStats;
  sections: CurriculumSection[];
  highlights: string[];
  requirements: string[];
  targetAudience: string[];
  whatYouWillLearn: string[];
  certificateEnabled: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

export interface InstructorInfo {
  id: string;
  name: string;
  image: string;
  bio: string;
  title: string;
  totalStudents: number;
  totalCourses: number;
  averageRating: number;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    website?: string;
  };
}

export interface CourseStats {
  enrollmentCount: number;
  completionCount: number;
  averageRating: number;
  reviewCount: number;
  totalHours: number;
  totalLessons: number;
  totalQuizzes: number;
  totalResources: number;
}

export interface CurriculumSection {
  id: string;
  title: string;
  description: string | null;
  order: number;
  duration: number; // minutes
  lessonCount: number;
  lessons: CurriculumLesson[];
}

export interface CurriculumLesson {
  id: string;
  title: string;
  type: "video" | "article" | "pdf" | "quiz";
  duration: number;
  order: number;
  isFree: boolean; // Preview lesson
  hasQuiz: boolean;
}

export interface CourseReview {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  createdAt: string;
  verified: boolean;
}

export interface RelatedCourse {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  price: number;
  averageRating: number;
  enrollmentCount: number;
  level: string;
  duration: number;
  lessonCount: number;
  instructor: string;
}

export interface CoursePageData {
  course: CourseDetail;
  reviews: CourseReview[];
  relatedCourses: RelatedCourse[];
  isEnrolled: boolean;
  userProgress: number;
}

// ============================================================================
// FALLBACK DATA
// ============================================================================

const FALLBACK_INSTRUCTOR: InstructorInfo = {
  id: "inst-1",
  name: "Dr. Marcus Chen",
  image: "/images/instructors/default.jpg",
  bio: "Award-winning educator with 15+ years of experience in financial education. Former Wall Street analyst and bestselling author.",
  title: "Financial Education Expert",
  totalStudents: 45000,
  totalCourses: 12,
  averageRating: 4.9,
  socialLinks: {
    twitter: "https://twitter.com/marcuschen",
    linkedin: "https://linkedin.com/in/marcuschen",
    youtube: "https://youtube.com/@marcuschen",
  },
};

const FALLBACK_COURSE: CourseDetail = {
  id: "course-demo",
  title: "Master Your Finances: From Zero to Wealth",
  slug: "master-your-finances",
  description: `Transform your financial future with this comprehensive course designed for ambitious individuals ready to take control of their money.

This course covers everything from basic budgeting to advanced investment strategies, all taught through real-world examples and actionable exercises.

Whether you're just starting your financial journey or looking to optimize your existing wealth, this course provides the framework and tools you need to succeed.`,
  shortDescription:
    "The complete guide to building lasting wealth through smart financial decisions.",
  coverImage: "/images/courses/finance-master.jpg",
  previewVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  level: "beginner",
  category: "Finance",
  tags: [
    "Finance",
    "Investing",
    "Budgeting",
    "Wealth Building",
    "Personal Finance",
  ],
  duration: 1240,
  lessonCount: 48,
  price: 197,
  originalPrice: 497,
  discount: 60,
  isFree: false,
  isPremium: true,
  featured: true,
  status: "published",
  instructor: FALLBACK_INSTRUCTOR,
  stats: {
    enrollmentCount: 12847,
    completionCount: 8923,
    averageRating: 4.8,
    reviewCount: 2341,
    totalHours: 21,
    totalLessons: 48,
    totalQuizzes: 12,
    totalResources: 36,
  },
  sections: [
    {
      id: "sec-1",
      title: "Foundation: Understanding Money",
      description: "Build a rock-solid understanding of how money works",
      order: 1,
      duration: 180,
      lessonCount: 8,
      lessons: [
        {
          id: "l1",
          title: "Welcome & Course Overview",
          type: "video",
          duration: 15,
          order: 1,
          isFree: true,
          hasQuiz: false,
        },
        {
          id: "l2",
          title: "The Psychology of Money",
          type: "video",
          duration: 28,
          order: 2,
          isFree: true,
          hasQuiz: false,
        },
        {
          id: "l3",
          title: "Understanding Your Money Story",
          type: "video",
          duration: 22,
          order: 3,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l4",
          title: "The Wealth Mindset Framework",
          type: "video",
          duration: 25,
          order: 4,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l5",
          title: "Goal Setting for Financial Success",
          type: "video",
          duration: 20,
          order: 5,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l6",
          title: "Creating Your Financial Vision",
          type: "article",
          duration: 15,
          order: 6,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l7",
          title: "Module Resources & Worksheets",
          type: "pdf",
          duration: 10,
          order: 7,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l8",
          title: "Module 1 Assessment",
          type: "quiz",
          duration: 15,
          order: 8,
          isFree: false,
          hasQuiz: true,
        },
      ],
    },
    {
      id: "sec-2",
      title: "Budgeting & Cash Flow Mastery",
      description: "Take complete control of where your money goes",
      order: 2,
      duration: 210,
      lessonCount: 10,
      lessons: [
        {
          id: "l9",
          title: "The 50/30/20 Rule Explained",
          type: "video",
          duration: 24,
          order: 1,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l10",
          title: "Building Your First Budget",
          type: "video",
          duration: 32,
          order: 2,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l11",
          title: "Tracking Every Dollar",
          type: "video",
          duration: 18,
          order: 3,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l12",
          title: "Cutting Expenses Without Sacrifice",
          type: "video",
          duration: 26,
          order: 4,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l13",
          title: "Increasing Your Income Streams",
          type: "video",
          duration: 30,
          order: 5,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l14",
          title: "Automating Your Finances",
          type: "video",
          duration: 22,
          order: 6,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l15",
          title: "Emergency Fund Strategy",
          type: "video",
          duration: 20,
          order: 7,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l16",
          title: "Budget Templates & Tools",
          type: "pdf",
          duration: 10,
          order: 8,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l17",
          title: "Cash Flow Calculator",
          type: "pdf",
          duration: 8,
          order: 9,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l18",
          title: "Module 2 Assessment",
          type: "quiz",
          duration: 20,
          order: 10,
          isFree: false,
          hasQuiz: true,
        },
      ],
    },
    {
      id: "sec-3",
      title: "Debt Elimination Strategies",
      description: "Break free from debt and stay debt-free",
      order: 3,
      duration: 150,
      lessonCount: 7,
      lessons: [
        {
          id: "l19",
          title: "Understanding Good vs Bad Debt",
          type: "video",
          duration: 22,
          order: 1,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l20",
          title: "The Debt Snowball Method",
          type: "video",
          duration: 25,
          order: 2,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l21",
          title: "The Debt Avalanche Method",
          type: "video",
          duration: 23,
          order: 3,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l22",
          title: "Negotiating with Creditors",
          type: "video",
          duration: 28,
          order: 4,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l23",
          title: "Building Credit While Paying Off Debt",
          type: "video",
          duration: 20,
          order: 5,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l24",
          title: "Debt Payoff Calculator",
          type: "pdf",
          duration: 12,
          order: 6,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l25",
          title: "Module 3 Assessment",
          type: "quiz",
          duration: 20,
          order: 7,
          isFree: false,
          hasQuiz: true,
        },
      ],
    },
    {
      id: "sec-4",
      title: "Investment Fundamentals",
      description: "Learn to grow your wealth through smart investing",
      order: 4,
      duration: 280,
      lessonCount: 12,
      lessons: [
        {
          id: "l26",
          title: "Introduction to Investing",
          type: "video",
          duration: 28,
          order: 1,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l27",
          title: "Stocks, Bonds & ETFs Explained",
          type: "video",
          duration: 35,
          order: 2,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l28",
          title: "Understanding Market Cycles",
          type: "video",
          duration: 30,
          order: 3,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l29",
          title: "Building Your Investment Portfolio",
          type: "video",
          duration: 32,
          order: 4,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l30",
          title: "Risk Management Strategies",
          type: "video",
          duration: 26,
          order: 5,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l31",
          title: "Retirement Accounts Masterclass",
          type: "video",
          duration: 28,
          order: 6,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l32",
          title: "Real Estate Investing Basics",
          type: "video",
          duration: 30,
          order: 7,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l33",
          title: "Alternative Investments",
          type: "video",
          duration: 24,
          order: 8,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l34",
          title: "Tax-Efficient Investing",
          type: "video",
          duration: 22,
          order: 9,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l35",
          title: "Investment Checklist",
          type: "pdf",
          duration: 10,
          order: 10,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l36",
          title: "Portfolio Tracker Template",
          type: "pdf",
          duration: 5,
          order: 11,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l37",
          title: "Module 4 Assessment",
          type: "quiz",
          duration: 25,
          order: 12,
          isFree: false,
          hasQuiz: true,
        },
      ],
    },
    {
      id: "sec-5",
      title: "Advanced Wealth Building",
      description: "Take your wealth to the next level",
      order: 5,
      duration: 220,
      lessonCount: 9,
      lessons: [
        {
          id: "l38",
          title: "Multiple Income Streams",
          type: "video",
          duration: 30,
          order: 1,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l39",
          title: "Business Ownership for Wealth",
          type: "video",
          duration: 35,
          order: 2,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l40",
          title: "Tax Optimization Strategies",
          type: "video",
          duration: 28,
          order: 3,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l41",
          title: "Estate Planning Essentials",
          type: "video",
          duration: 25,
          order: 4,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l42",
          title: "Protecting Your Wealth",
          type: "video",
          duration: 22,
          order: 5,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l43",
          title: "Legacy Building",
          type: "video",
          duration: 20,
          order: 6,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l44",
          title: "Your 90-Day Wealth Action Plan",
          type: "video",
          duration: 25,
          order: 7,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l45",
          title: "Wealth Building Resources",
          type: "pdf",
          duration: 15,
          order: 8,
          isFree: false,
          hasQuiz: false,
        },
        {
          id: "l46",
          title: "Final Course Assessment",
          type: "quiz",
          duration: 30,
          order: 9,
          isFree: false,
          hasQuiz: true,
        },
      ],
    },
  ],
  highlights: [
    "21+ hours of HD video content",
    "48 comprehensive lessons",
    "12 quizzes to test your knowledge",
    "36 downloadable resources & templates",
    "Lifetime access to course updates",
    "Certificate of completion",
    "Private community access",
    "Live Q&A sessions monthly",
  ],
  requirements: [
    "No prior financial knowledge required",
    "A willingness to take control of your finances",
    "Basic computer skills to access online materials",
    "Pen and paper for exercises (or digital note-taking)",
  ],
  targetAudience: [
    "Beginners looking to understand personal finance",
    "Young professionals wanting to build wealth early",
    "Anyone struggling with budgeting or debt",
    "People looking to start investing",
    "Those wanting to achieve financial independence",
  ],
  whatYouWillLearn: [
    "Create and maintain a budget that actually works",
    "Eliminate debt using proven strategies",
    "Build an emergency fund and financial safety net",
    "Start investing with confidence",
    "Understand stocks, bonds, ETFs, and real estate",
    "Plan for retirement effectively",
    "Build multiple streams of income",
    "Protect and grow your wealth long-term",
  ],
  certificateEnabled: true,
  publishedAt: "2024-01-15T00:00:00.000Z",
  updatedAt: "2024-12-01T00:00:00.000Z",
};

const FALLBACK_REVIEWS: CourseReview[] = [
  {
    id: "rev-1",
    userId: "u1",
    userName: "Sarah Johnson",
    userImage: "/images/users/sarah.jpg",
    rating: 5,
    title: "Life-changing course!",
    content:
      "This course completely transformed how I think about money. I went from living paycheck to paycheck to having a 6-month emergency fund in just 8 months. The investment section alone was worth 10x the price.",
    helpful: 234,
    createdAt: "2024-11-15T00:00:00.000Z",
    verified: true,
  },
  {
    id: "rev-2",
    userId: "u2",
    userName: "Michael Thompson",
    userImage: "/images/users/michael.jpg",
    rating: 5,
    title: "Finally understand investing",
    content:
      "I've tried reading books and watching YouTube videos, but nothing clicked until this course. Dr. Chen breaks down complex concepts into simple, actionable steps. My portfolio is up 15% since completing the course.",
    helpful: 189,
    createdAt: "2024-11-01T00:00:00.000Z",
    verified: true,
  },
  {
    id: "rev-3",
    userId: "u3",
    userName: "Emily Rodriguez",
    userImage: "/images/users/emily.jpg",
    rating: 5,
    title: "Paid off $30k in debt!",
    content:
      "The debt elimination strategies in this course are incredible. I used the debt avalanche method and paid off $30,000 in student loans in 18 months. Can't recommend this enough!",
    helpful: 312,
    createdAt: "2024-10-20T00:00:00.000Z",
    verified: true,
  },
  {
    id: "rev-4",
    userId: "u4",
    userName: "David Kim",
    userImage: "/images/users/david.jpg",
    rating: 4,
    title: "Great content, well structured",
    content:
      "Very comprehensive course covering all aspects of personal finance. Only giving 4 stars because I wish there was more on cryptocurrency and alternative investments. Otherwise, excellent!",
    helpful: 98,
    createdAt: "2024-10-05T00:00:00.000Z",
    verified: true,
  },
  {
    id: "rev-5",
    userId: "u5",
    userName: "Jessica Williams",
    userImage: "/images/users/jessica.jpg",
    rating: 5,
    title: "Best investment I've made",
    content:
      "Ironic that the best investment I made this year was investing in my financial education. The ROI on this course is insane. Already saved $500/month from the budgeting techniques alone.",
    helpful: 156,
    createdAt: "2024-09-28T00:00:00.000Z",
    verified: true,
  },
];

const FALLBACK_RELATED: RelatedCourse[] = [
  {
    id: "rel-1",
    title: "Stock Market Investing for Beginners",
    slug: "stock-market-beginners",
    coverImage: "/images/courses/stocks.jpg",
    price: 149,
    averageRating: 4.7,
    enrollmentCount: 8543,
    level: "beginner",
    duration: 720,
    lessonCount: 32,
    instructor: "James Wilson",
  },
  {
    id: "rel-2",
    title: "Real Estate Investment Masterclass",
    slug: "real-estate-masterclass",
    coverImage: "/images/courses/realestate.jpg",
    price: 297,
    averageRating: 4.9,
    enrollmentCount: 5231,
    level: "intermediate",
    duration: 960,
    lessonCount: 42,
    instructor: "Amanda Foster",
  },
  {
    id: "rel-3",
    title: "Cryptocurrency & Blockchain Fundamentals",
    slug: "crypto-fundamentals",
    coverImage: "/images/courses/crypto.jpg",
    price: 179,
    averageRating: 4.6,
    enrollmentCount: 11234,
    level: "beginner",
    duration: 540,
    lessonCount: 28,
    instructor: "Alex Chen",
  },
];

// ============================================================================
// DATA FETCHERS
// ============================================================================

export const getCourseDetail = cache(
  async (courseId: string): Promise<CourseDetail> => {
    try {
      const course = await prisma.courses.findFirst({
        where: {
          OR: [{ id: courseId }, { slug: courseId }],
        },
        include: {
          course_sections: {
            orderBy: { order: "asc" },
            include: {
              course_lessons: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  title: true,
                  type: true,
                  videoDuration: true,
                  order: true,
                  isFree: true,
                },
              },
            },
          },
        },
      });

      if (!course) {
        console.log(`Course not found: ${courseId}, using fallback`);
        return FALLBACK_COURSE;
      }

      // Get instructor info if authorId exists
      let instructorInfo = FALLBACK_INSTRUCTOR;
      if (course.authorId) {
        const author = await prisma.user.findUnique({
          where: { id: course.authorId },
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            socialLinks: true,
          },
        });

        if (author) {
          // Count instructor's courses and students
          const [courseCount, totalStudents] = await Promise.all([
            prisma.courses.count({
              where: { authorId: author.id, status: "published" },
            }),
            prisma.course_enrollments.count({
              where: { courses: { authorId: author.id } },
            }),
          ]);

          instructorInfo = {
            id: author.id,
            name: author.name || course.instructorName || "Instructor",
            image:
              author.image ||
              course.instructorImage ||
              "/images/instructors/default.jpg",
            bio: author.bio || course.instructorBio || "Expert instructor",
            title: "Course Instructor",
            totalStudents,
            totalCourses: courseCount,
            averageRating: 4.8,
            socialLinks: (author.socialLinks as any) || {},
          };
        }
      }

      // Get additional counts
      const [totalQuizzes, totalResources] = await Promise.all([
        prisma.course_quizzes.count({ where: { courseId: course.id } }),
        prisma.course_resources.count({ where: { courseId: course.id } }),
      ]);

      // Transform sections with proper typing
      const sections: CurriculumSection[] = course.course_sections.map(
        (section: {
          id: string;
          title: string;
          description: string | null;
          order: number;
          course_lessons: Array<{
            id: string;
            title: string;
            type: string;
            videoDuration: number | null;
            order: number;
            isFree: boolean | null;
          }>;
        }) => ({
          id: section.id,
          title: section.title,
          description: section.description,
          order: section.order,
          duration: section.course_lessons.reduce(
            (acc: number, l) => acc + (l.videoDuration || 0),
            0
          ),
          lessonCount: section.course_lessons.length,
          lessons: section.course_lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            type:
              (lesson.type as "video" | "article" | "pdf" | "quiz") || "video",
            duration: lesson.videoDuration || 0,
            order: lesson.order,
            isFree: lesson.isFree || false,
            hasQuiz: false, // Would need to check quizzes
          })),
        })
      );

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description || "",
        shortDescription: course.shortDescription || "",
        coverImage: course.coverImage || "/images/courses/default.jpg",
        previewVideo: course.previewVideo,
        level:
          (course.level as "beginner" | "intermediate" | "advanced") ||
          "beginner",
        category: course.category,
        tags: course.tags || [],
        duration: course.duration || 0,
        lessonCount: course.lessonCount || 0,
        price: Number(course.price) || 0,
        originalPrice: course.discount
          ? Number(course.price) / (1 - course.discount / 100)
          : Number(course.price),
        discount: course.discount || 0,
        isFree: course.isFree || false,
        isPremium: course.isPremium || false,
        featured: course.featured || false,
        status: course.status || "draft",
        instructor: instructorInfo,
        stats: {
          enrollmentCount: course.enrollmentCount || 0,
          completionCount: course.completionCount || 0,
          averageRating: Number(course.averageRating) || 0,
          reviewCount: course.reviewCount || 0,
          totalHours: Math.round((course.duration || 0) / 60),
          totalLessons: course.lessonCount || 0,
          totalQuizzes,
          totalResources,
        },
        sections,
        highlights: [
          `${Math.round((course.duration || 0) / 60)}+ hours of content`,
          `${course.lessonCount || 0} comprehensive lessons`,
          `${totalQuizzes} quizzes to test knowledge`,
          `${totalResources} downloadable resources`,
          "Lifetime access",
          course.certificateEnabled
            ? "Certificate of completion"
            : "Progress tracking",
        ],
        requirements: [
          "No prior experience required",
          "Access to a computer or mobile device",
          "Willingness to learn and apply concepts",
        ],
        targetAudience: [
          "Anyone interested in this topic",
          "Beginners looking to learn fundamentals",
          "Professionals wanting to expand skills",
        ],
        whatYouWillLearn: [
          "Core concepts and fundamentals",
          "Practical skills you can apply immediately",
          "Best practices and industry standards",
          "Real-world examples and case studies",
        ],
        certificateEnabled: course.certificateEnabled || false,
        publishedAt: course.publishedAt?.toISOString() || null,
        updatedAt: course.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error("Error fetching course detail:", error);
      return FALLBACK_COURSE;
    }
  }
);

export const getCourseReviews = cache(
  async (courseId: string, limit = 10): Promise<CourseReview[]> => {
    try {
      const reviews = await prisma.course_reviews.findMany({
        where: { courseId },
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      if (!reviews.length) {
        return FALLBACK_REVIEWS;
      }

      return reviews.map(
        (review): CourseReview => ({
          id: review.id,
          userId: review.userId,
          userName: review.users.name || "Anonymous",
          userImage: review.users.image || "/images/users/default.jpg",
          rating: review.rating,
          title: "",
          content: review.comment || "",
          helpful: review.helpful || 0,
          createdAt: review.createdAt.toISOString(),
          verified: review.verified || true,
        })
      );
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return FALLBACK_REVIEWS;
    }
  }
);

export const getRelatedCourses = cache(
  async (
    courseId: string,
    category: string,
    limit = 3
  ): Promise<RelatedCourse[]> => {
    try {
      const courses = await prisma.courses.findMany({
        where: {
          status: "published",
          category,
          id: { not: courseId },
        },
        take: limit,
        orderBy: { enrollmentCount: "desc" },
      });

      if (!courses.length) {
        return FALLBACK_RELATED;
      }

      return courses.map((course) => ({
        id: course.id,
        title: course.title,
        slug: course.slug,
        coverImage: course.coverImage || "/images/courses/default.jpg",
        price: Number(course.price) || 0,
        averageRating: Number(course.averageRating) || 0,
        enrollmentCount: course.enrollmentCount || 0,
        level: course.level,
        duration: course.duration || 0,
        lessonCount: course.lessonCount || 0,
        instructor: course.instructorName || "Instructor",
      }));
    } catch (error) {
      console.error("Error fetching related courses:", error);
      return FALLBACK_RELATED;
    }
  }
);

export const checkEnrollment = cache(
  async (
    courseId: string,
    userId: string | undefined
  ): Promise<{ isEnrolled: boolean; progress: number }> => {
    if (!userId) {
      return { isEnrolled: false, progress: 0 };
    }

    try {
      const enrollment = await prisma.course_enrollments.findFirst({
        where: {
          courseId,
          userId,
        },
        select: {
          id: true,
          progress: true,
        },
      });

      return {
        isEnrolled: !!enrollment,
        progress: Number(enrollment?.progress) || 0,
      };
    } catch (error) {
      console.error("Error checking enrollment:", error);
      return { isEnrolled: false, progress: 0 };
    }
  }
);

export const getCoursePageData = cache(
  async (courseId: string, userId?: string): Promise<CoursePageData> => {
    const [course, reviews, enrollmentStatus] = await Promise.all([
      getCourseDetail(courseId),
      getCourseReviews(courseId),
      checkEnrollment(courseId, userId),
    ]);

    const relatedCourses = await getRelatedCourses(courseId, course.category);

    return {
      course,
      reviews,
      relatedCourses,
      isEnrolled: enrollmentStatus.isEnrolled,
      userProgress: enrollmentStatus.progress,
    };
  }
);
