/**
 * 🔮 FUTURE SELF PREDICTION API
 *
 * Revolutionary AI that predicts your future based on current learning patterns.
 * Uses ML to project skills, salary, portfolio, and career trajectory.
 *
 * NO ONE HAS THIS. This is Dynasty's secret weapon.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface FutureSelfPrediction {
  userId: string;
  generatedAt: Date;
  timeframe: "3months" | "6months" | "1year" | "2years";

  // Skills Projection
  skills: {
    current: SkillLevel[];
    projected: SkillLevel[];
    newSkills: string[];
  };

  // Career Trajectory
  career: {
    currentLevel: string;
    projectedLevel: string;
    salaryRange: { min: number; max: number; currency: string };
    jobTitles: string[];
    companies: string[]; // Types of companies they could work at
  };

  // Portfolio Projection
  portfolio: {
    projects: ProjectedProject[];
    githubContributions: number;
    certifications: string[];
  };

  // Learning Stats
  learning: {
    coursesCompleted: number;
    booksRead: number;
    totalHours: number;
    streakPrediction: number;
    xpProjection: number;
  };

  // Milestones Timeline
  milestones: Milestone[];

  // AI-Generated Letter from Future Self
  letterFromFuture: string;

  // Confidence & Probability
  confidence: number; // 0-100
  probabilityOfSuccess: number; // 0-100

  // What could change the outcome
  accelerators: string[];
  risks: string[];
}

interface SkillLevel {
  name: string;
  level: number; // 0-100
  category: string;
}

interface ProjectedProject {
  name: string;
  description: string;
  technologies: string[];
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  estimatedWeeks: number;
}

interface Milestone {
  date: Date;
  title: string;
  description: string;
  icon: string;
  type: "skill" | "career" | "achievement" | "project" | "certification";
  probability: number;
}

// GET - Generate future self prediction
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const timeframe = (searchParams.get("timeframe") ||
      "6months") as FutureSelfPrediction["timeframe"];

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        course_enrollments: {
          include: {
            courses: true,
          },
        },
        lesson_progress: true,
        quiz_attempts: {
          orderBy: { startedAt: "desc" },
          take: 50,
        },
        userAchievements: {
          include: {
            achievement: true,
          },
        },
        progress: {
          include: {
            book: true,
          },
        },
        certificates: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate current stats
    const currentStats = calculateCurrentStats(user);

    // Generate AI prediction
    const prediction = await generateFuturePrediction(
      user,
      currentStats,
      timeframe
    );

    return NextResponse.json({
      success: true,
      prediction,
      currentStats,
    });
  } catch (error) {
    console.error("[Future Self API Error]:", error);
    return NextResponse.json(
      { error: "Failed to generate prediction" },
      { status: 500 }
    );
  }
}

// POST - Chat with your future self
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, prediction } = await request.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, xp: true, level: true, streakDays: true },
    });

    // Generate response from "future self"
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are the user's FUTURE SELF from ${
            prediction?.timeframe || "6 months"
          } in the future. 
          
You've already achieved the goals they're working towards. You're:
- Wise but relatable
- Encouraging but honest
- Speak from experience of having walked this path
- Share specific details about what worked and what you wish you'd done differently

Current user stats:
- Name: ${user?.name || "Builder"}
- Current Level: ${user?.level || 1}
- Current XP: ${user?.xp || 0}
- Current Streak: ${user?.streakDays || 0} days

Predicted achievements (your reality now):
${JSON.stringify(prediction?.milestones?.slice(0, 5) || [], null, 2)}

Respond as if you ARE them from the future. Use "I" and "we" - you're talking to your past self.
Be conversational, warm, and motivating. Share specific memories of the journey.
Keep responses concise but impactful (2-3 paragraphs max).`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    return NextResponse.json({
      success: true,
      response:
        response.choices[0]?.message?.content || "I believe in us. Keep going.",
    });
  } catch (error) {
    console.error("[Future Self Chat Error]:", error);
    return NextResponse.json(
      { error: "Failed to connect with future self" },
      { status: 500 }
    );
  }
}

function calculateCurrentStats(user: any) {
  const enrollments = user.course_enrollments || [];
  const completedLessons =
    user.lesson_progress?.filter((l: any) => l.completed)?.length || 0;
  const quizScores = user.quiz_attempts?.map((q: any) => q.score) || [];
  const avgQuizScore =
    quizScores.length > 0
      ? quizScores.reduce((a: number, b: number) => a + b, 0) /
        quizScores.length
      : 0;

  // Extract skills from courses
  const skills: SkillLevel[] = [];
  const skillMap = new Map<string, number>();

  enrollments.forEach((enrollment: any) => {
    const course = enrollment.courses;
    if (course?.tags) {
      course.tags.forEach((tag: string) => {
        const current = skillMap.get(tag) || 0;
        skillMap.set(tag, Math.min(current + 20, 100));
      });
    }
  });

  skillMap.forEach((level, name) => {
    skills.push({ name, level, category: "Technical" });
  });

  return {
    level: user.level || 1,
    xp: user.xp || 0,
    streak: user.streakDays || 0,
    coursesEnrolled: enrollments.length,
    lessonsCompleted: completedLessons,
    avgQuizScore,
    booksRead: user.progress?.filter((p: any) => p.completed)?.length || 0,
    certificates: user.certificates?.length || 0,
    achievements: user.userAchievements?.length || 0,
    skills,
    joinedDaysAgo: Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    ),
  };
}

async function generateFuturePrediction(
  user: any,
  currentStats: any,
  timeframe: FutureSelfPrediction["timeframe"]
): Promise<FutureSelfPrediction> {
  const timeframeMonths = {
    "3months": 3,
    "6months": 6,
    "1year": 12,
    "2years": 24,
  }[timeframe];

  // Calculate projected growth based on current trajectory
  const dailyXP = currentStats.xp / Math.max(currentStats.joinedDaysAgo, 1);
  const projectedXP = currentStats.xp + dailyXP * timeframeMonths * 30;

  const learningVelocity =
    currentStats.lessonsCompleted / Math.max(currentStats.joinedDaysAgo, 1);
  const projectedLessons = Math.floor(
    currentStats.lessonsCompleted + learningVelocity * timeframeMonths * 30
  );

  // Project skills growth
  const projectedSkills = currentStats.skills.map((skill: SkillLevel) => ({
    ...skill,
    level: Math.min(skill.level + timeframeMonths * 8, 100),
  }));

  // Generate new skills based on learning path
  const potentialNewSkills = [
    "System Design",
    "Cloud Architecture",
    "Team Leadership",
    "Technical Writing",
    "API Design",
    "Performance Optimization",
    "Security Best Practices",
    "CI/CD Pipelines",
    "Microservices",
  ]
    .filter(() => Math.random() > 0.5)
    .slice(0, 3);

  // Calculate career trajectory
  const careerLevels = [
    "Beginner",
    "Junior",
    "Mid-Level",
    "Senior",
    "Lead",
    "Principal",
    "Staff",
  ];
  const currentLevelIndex = Math.min(
    Math.floor(currentStats.level / 15),
    careerLevels.length - 1
  );
  const projectedLevelIndex = Math.min(
    currentLevelIndex + Math.floor(timeframeMonths / 6),
    careerLevels.length - 1
  );

  // Salary projection (based on level and skills)
  const baseSalary = 40000 + projectedLevelIndex * 20000;
  const skillBonus = projectedSkills.length * 2000;

  // Generate milestones
  const milestones: Milestone[] = generateMilestones(
    timeframeMonths,
    currentStats,
    projectedSkills
  );

  // Generate letter from future self using AI
  let letterFromFuture = "";
  try {
    const letterResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Write a short, powerful letter (150 words max) from the user's future self. 
They've achieved: Level ${Math.floor(
            projectedXP / 1000
          )}, ${projectedLessons} lessons completed, ${
            careerLevels[projectedLevelIndex]
          } developer.
Be emotional, motivating, and specific. Reference the journey, the struggles that were worth it, and encourage them to keep going.
Start with "Dear Past Me," and sign with "Your Future Self"`,
        },
        {
          role: "user",
          content: `Write the letter for ${
            user.name || "Builder"
          } who is currently Level ${currentStats.level} with ${
            currentStats.streak
          } day streak.`,
        },
      ],
      max_tokens: 300,
      temperature: 0.9,
    });
    letterFromFuture =
      letterResponse.choices[0]?.message?.content ||
      getDefaultLetter(user.name, timeframe);
  } catch {
    letterFromFuture = getDefaultLetter(user.name, timeframe);
  }

  // Calculate confidence based on data
  const dataPoints =
    currentStats.joinedDaysAgo +
    currentStats.lessonsCompleted +
    currentStats.achievements;
  const confidence = Math.min(50 + dataPoints / 10, 95);

  // Success probability based on streak and consistency
  const streakFactor = Math.min(currentStats.streak * 2, 30);
  const consistencyFactor =
    learningVelocity > 0.5 ? 20 : learningVelocity > 0.2 ? 10 : 0;
  const probabilityOfSuccess = Math.min(
    40 + streakFactor + consistencyFactor + currentStats.avgQuizScore / 5,
    95
  );

  return {
    userId: user.id,
    generatedAt: new Date(),
    timeframe,
    skills: {
      current: currentStats.skills,
      projected: projectedSkills,
      newSkills: potentialNewSkills,
    },
    career: {
      currentLevel: careerLevels[currentLevelIndex],
      projectedLevel: careerLevels[projectedLevelIndex],
      salaryRange: {
        min: baseSalary + skillBonus - 10000,
        max: baseSalary + skillBonus + 20000,
        currency: "USD",
      },
      jobTitles: generateJobTitles(
        careerLevels[projectedLevelIndex],
        projectedSkills
      ),
      companies: [
        "Tech Startups",
        "FAANG",
        "Fortune 500",
        "Remote-First Companies",
      ],
    },
    portfolio: {
      projects: generateProjectedProjects(projectedSkills, timeframeMonths),
      githubContributions: Math.floor(timeframeMonths * 30 * 2), // ~2 contributions per day
      certifications: generateCertifications(projectedSkills),
    },
    learning: {
      coursesCompleted: Math.floor(
        currentStats.coursesEnrolled + timeframeMonths / 2
      ),
      booksRead: Math.floor(currentStats.booksRead + timeframeMonths),
      totalHours: Math.floor((projectedLessons * 15) / 60), // ~15 min per lesson
      streakPrediction: currentStats.streak + timeframeMonths * 20, // Optimistic but motivating
      xpProjection: Math.floor(projectedXP),
    },
    milestones,
    letterFromFuture,
    confidence: Math.round(confidence),
    probabilityOfSuccess: Math.round(probabilityOfSuccess),
    accelerators: [
      "Study 2+ hours daily",
      "Complete all quizzes with 90%+ scores",
      "Build portfolio projects weekly",
      "Maintain your streak",
      "Join study groups and duels",
    ],
    risks: [
      "Breaking your streak",
      "Skipping difficult topics",
      "Not applying what you learn",
      "Inconsistent study schedule",
    ],
  };
}

function generateMilestones(
  months: number,
  currentStats: any,
  skills: SkillLevel[]
): Milestone[] {
  const milestones: Milestone[] = [];
  const now = new Date();

  // Week 1-2: First victories
  milestones.push({
    date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    title: "First Week Champion",
    description: "Completed first full week of consistent learning",
    icon: "🏆",
    type: "achievement",
    probability: 90,
  });

  // Month 1: Foundation complete
  milestones.push({
    date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    title: "Foundation Builder",
    description: "Mastered core fundamentals and built first project",
    icon: "🏗️",
    type: "skill",
    probability: 85,
  });

  // Month 2: First certification
  if (months >= 2) {
    milestones.push({
      date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      title: "Certified Builder",
      description: "Earned your first professional certification",
      icon: "📜",
      type: "certification",
      probability: 75,
    });
  }

  // Month 3: Portfolio project
  if (months >= 3) {
    milestones.push({
      date: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      title: "Portfolio Milestone",
      description: "Completed impressive portfolio project that gets noticed",
      icon: "🚀",
      type: "project",
      probability: 70,
    });
  }

  // Month 6: Career ready
  if (months >= 6) {
    milestones.push({
      date: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
      title: "Career Ready",
      description: "Ready for professional opportunities, skills validated",
      icon: "💼",
      type: "career",
      probability: 65,
    });
  }

  // Year 1: Level up career
  if (months >= 12) {
    milestones.push({
      date: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
      title: "Career Transformation",
      description:
        "Major career milestone achieved - new role or significant raise",
      icon: "⭐",
      type: "career",
      probability: 60,
    });
  }

  // Year 2: Expert status
  if (months >= 24) {
    milestones.push({
      date: new Date(now.getTime() + 730 * 24 * 60 * 60 * 1000),
      title: "Expert Builder",
      description: "Recognized expert in your field, mentoring others",
      icon: "👑",
      type: "achievement",
      probability: 55,
    });
  }

  return milestones;
}

function generateJobTitles(level: string, skills: SkillLevel[]): string[] {
  const baseTitles: Record<string, string[]> = {
    Beginner: ["Junior Developer", "Associate Developer", "Developer Trainee"],
    Junior: ["Junior Developer", "Frontend Developer", "Backend Developer"],
    "Mid-Level": [
      "Software Developer",
      "Full Stack Developer",
      "Software Engineer",
    ],
    Senior: ["Senior Developer", "Senior Engineer", "Tech Lead"],
    Lead: ["Technical Lead", "Engineering Manager", "Principal Engineer"],
    Principal: [
      "Principal Engineer",
      "Staff Engineer",
      "Distinguished Engineer",
    ],
    Staff: ["Staff Engineer", "Chief Architect", "VP of Engineering"],
  };

  return baseTitles[level] || baseTitles["Mid-Level"];
}

function generateProjectedProjects(
  skills: SkillLevel[],
  months: number
): ProjectedProject[] {
  const projects: ProjectedProject[] = [
    {
      name: "Portfolio Website",
      description:
        "Professional portfolio showcasing your journey and projects",
      technologies: ["React", "Next.js", "Tailwind CSS"],
      difficulty: "beginner",
      estimatedWeeks: 2,
    },
    {
      name: "Full-Stack Application",
      description: "Complete application with auth, database, and API",
      technologies: ["Next.js", "PostgreSQL", "Prisma"],
      difficulty: "intermediate",
      estimatedWeeks: 4,
    },
  ];

  if (months >= 6) {
    projects.push({
      name: "Open Source Contribution",
      description: "Meaningful contributions to popular open source projects",
      technologies: ["TypeScript", "Testing", "Documentation"],
      difficulty: "advanced",
      estimatedWeeks: 6,
    });
  }

  if (months >= 12) {
    projects.push({
      name: "SaaS Product",
      description: "Your own SaaS product with paying customers",
      technologies: ["Full Stack", "Stripe", "Cloud Infrastructure"],
      difficulty: "expert",
      estimatedWeeks: 12,
    });
  }

  return projects;
}

function generateCertifications(skills: SkillLevel[]): string[] {
  return [
    "AWS Cloud Practitioner",
    "Meta Frontend Developer",
    "Google Cloud Associate",
    "MongoDB Developer",
  ].slice(0, Math.min(skills.length, 3));
}

function getDefaultLetter(name: string | null, timeframe: string): string {
  return `Dear Past Me,

I'm writing this from ${timeframe} in your future, and I have to tell you - we made it. Remember those late nights when you wondered if this was all worth it? It was. Every single moment.

The skills you're building right now will open doors you can't even imagine yet. That consistency, that discipline - it compounds in ways that will surprise you.

Keep going. Don't break the streak. The person you're becoming is exactly who you need to be.

With pride and gratitude,
Your Future Self 🚀`;
}
