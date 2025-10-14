import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { Metadata } from 'next';
import ProfileHero from '@/components/profile/ProfileHero';
import ProfileTabs from '@/components/profile/ProfileTabs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
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
      title: 'User Not Found',
    };
  }

  return {
    title: `${user.name || params.username} (@${params.username}) • Dynasty Academy`,
    description:
      user.bio || `${user.name || params.username}'s profile on Dynasty Academy`,
    openGraph: {
      title: `${user.name || params.username}`,
      description: user.bio || `Dynasty Score: ${user.dynastyScore} • Level ${user.level}`,
      images: [
        {
          url: user.bannerImage || user.image || '/default-banner.jpg',
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${user.name || params.username}`,
      description: user.bio || `Dynasty Score: ${user.dynastyScore} • Level ${user.level}`,
      images: [user.bannerImage || user.image || '/default-banner.jpg'],
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const session = await getServerSession(authOptions);

  // Check for username redirect
  const redirectRecord = await prisma.usernameRedirect.findUnique({
    where: { from: params.username },
  });

  if (redirectRecord && redirectRecord.expiresAt > new Date()) {
    redirect(`/@${redirectRecord.to}`);
  }

  // Fetch user profile
  const user = await prisma.user.findUnique({
    where: { username: params.username },
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
            <h3 className="mb-2 text-xl font-semibold">This Account is Private</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Follow @{user.username} to see their posts, reflections, and collections.
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

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHero
        user={user}
        isOwner={isOwner}
        isFollowing={isFollowing}
        currentBook={currentBook}
      />
      <ProfileTabs username={params.username} userId={user.id} isOwner={isOwner} />
    </div>
  );
}
