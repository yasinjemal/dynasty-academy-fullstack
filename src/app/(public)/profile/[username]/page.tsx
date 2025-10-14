import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Metadata } from "next";
import ProfileHero from "@/components/profile/ProfileHero";
import ProfileTabs from "@/components/profile/ProfileTabs";
import DopamineStats from "@/components/profile/DopamineStats";
import ActivityHeatmap from "@/components/profile/ActivityHeatmap";
import LiveProfileViews from "@/components/profile/LiveProfileViews";
import AchievementShowcase, {
  sampleAchievements,
} from "@/components/profile/AchievementShowcase";
import ComparisonStats from "@/components/profile/ComparisonStats";
import DailyChallenges, {
  sampleChallenges,
} from "@/components/profile/DailyChallenges";
import PowerUpsSystem, {
  samplePowerUps,
  sampleEvents,
} from "@/components/profile/PowerUpsSystem";
import ProfileVisitors, {
  sampleVisitors,
} from "@/components/profile/ProfileVisitors";
import CelebrationTrigger from "@/components/profile/CelebrationTrigger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      name: true,
      bio: true,
      image: true,
      bannerImage: true,
      dynastyScore: true,
      level: true,
    },
  });

  if (!user) {
    return {
      title: "User Not Found",
    };
  }

  return {
    title: `${user.name || username} (@${username}) • Dynasty Academy`,
    description:
      user.bio || `${user.name || username}'s profile on Dynasty Academy`,
    openGraph: {
      title: `${user.name || username}`,
      description:
        user.bio || `Dynasty Score: ${user.dynastyScore} • Level ${user.level}`,
      images: [
        {
          url: user.bannerImage || user.image || "/default-banner.jpg",
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${user.name || username}`,
      description:
        user.bio || `Dynasty Score: ${user.dynastyScore} • Level ${user.level}`,
      images: [user.bannerImage || user.image || "/default-banner.jpg"],
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await getServerSession(authOptions);

  // Check for username redirect
  const redirectRecord = await prisma.usernameRedirect.findUnique({
    where: { from: username },
  });

  if (redirectRecord && redirectRecord.expiresAt > new Date()) {
    redirect(`/@${redirectRecord.to}`);
  }

  // Fetch user profile
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      bannerImage: true,
      bio: true,
      location: true,
      website: true,
      xHandle: true,
      instagram: true,
      youtube: true,
      role: true,
      dynastyScore: true,
      level: true,
      streakDays: true,
      readingMinutesLifetime: true,
      booksCompleted: true,
      followersCount: true,
      followingCount: true,
      thanksReceived: true,
      profileTheme: true,
      isPrivate: true,
      dmOpen: true,
      isBanned: true,
      isSuspended: true,
      createdAt: true,
      currentBookId: true,
      currentPage: true,
    },
  });

  if (!user || user.isBanned || user.isSuspended) {
    notFound();
  }

  const isOwner = session?.user?.id === user.id;

  // Check if viewer follows this user
  const isFollowing = session?.user?.id
    ? !!(await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: user.id,
          },
        },
      }))
    : false;

  // Check privacy
  if (user.isPrivate && !isOwner && !isFollowing) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ProfileHero
          user={user}
          isOwner={isOwner}
          isFollowing={isFollowing}
          currentBook={null}
          isPrivate={true}
        />
        <div className="mt-12 text-center">
          <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 text-4xl">🔒</div>
            <h3 className="mb-2 text-xl font-semibold">
              This Account is Private
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Follow @{user.username} to see their posts, reflections, and
              collections.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch current book
  let currentBook = null;
  if (user.currentBookId) {
    currentBook = await prisma.book.findUnique({
      where: { id: user.currentBookId },
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        total_pages: true,
      },
    });
  }

  // Sample data for all features (in production, fetch from DB)
  const activityData = generateSampleActivityData(365);
  const comparisonStats = [
    {
      label: "Dynasty Score",
      current: user.dynastyScore,
      previous: user.dynastyScore - 250,
      unit: "pts",
      icon: "trendingUp",
    },
    {
      label: "Books Read",
      current: user.booksCompleted,
      previous: user.booksCompleted - 2,
      unit: "books",
      icon: "bookOpen",
    },
    {
      label: "Reading Time",
      current: user.readingMinutesLifetime,
      previous: user.readingMinutesLifetime - 120,
      unit: "min",
      icon: "clock",
    },
    {
      label: "Followers",
      current: user.followersCount,
      previous: user.followersCount - 15,
      unit: "people",
      icon: "users",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Celebration Triggers */}
      <CelebrationTrigger type="levelUp" trigger={false} />
      <CelebrationTrigger type="achievement" trigger={false} />
      <CelebrationTrigger
        type="streak"
        trigger={user.streakDays > 0 && user.streakDays % 7 === 0}
        emoji="🔥"
      />

      <ProfileHero
        user={user}
        isOwner={isOwner}
        isFollowing={isFollowing}
        currentBook={currentBook}
      />

      {/* Three-Column Layout: Tabs + Stats + Right Sidebar */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content - Tabs (6 cols) */}
        <div className="lg:col-span-7">
          <ProfileTabs username={username} userId={user.id} isOwner={isOwner} />

          {/* Full-Width Features Below Tabs */}
          <div className="mt-8 space-y-8">
            {/* Achievements */}
            <AchievementShowcase
              achievements={sampleAchievements}
              totalPossible={50}
            />

            {/* Activity Heatmap */}
            <ActivityHeatmap data={activityData} totalDays={365} />

            {/* Daily Challenges */}
            <DailyChallenges challenges={sampleChallenges} completedToday={2} />

            {/* Power-Ups & Events */}
            <PowerUpsSystem
              powerUps={samplePowerUps}
              events={sampleEvents}
              userCoins={2500}
            />

            {/* Profile Visitors */}
            <ProfileVisitors
              visitors={sampleVisitors}
              totalViews={12543}
              newVisitorsToday={47}
            />
          </div>
        </div>

        {/* Right Sidebar - Sticky Stats (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            {/* Dynasty Score & Main Stats */}
            <DopamineStats
              dynastyScore={user.dynastyScore}
              level={user.level}
              streakDays={user.streakDays}
              followersCount={user.followersCount}
              booksCompleted={user.booksCompleted}
              readingMinutes={user.readingMinutesLifetime}
            />

            {/* Live Profile Views */}
            <LiveProfileViews initialViews={12543} isLive={true} />

            {/* Comparison Stats */}
            <ComparisonStats
              stats={comparisonStats}
              userRank={2847}
              totalUsers={50000}
              percentile={6}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate sample activity data
function generateSampleActivityData(days: number) {
  const data = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split("T")[0];

    // Random activity level (0-4)
    const count = Math.floor(Math.random() * 8);
    const level =
      count === 0 ? 0 : count < 2 ? 1 : count < 4 ? 2 : count < 6 ? 3 : 4;

    data.push({
      date: dateString,
      count,
      level: level as 0 | 1 | 2 | 3 | 4,
    });
  }

  return data;
}
