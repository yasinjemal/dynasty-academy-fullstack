import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, isPrivate: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // TODO: Check privacy and follow status

    // Fetch mixed activity timeline
    const [posts, reflections, achievements, follows] = await Promise.all([
      prisma.post.findMany({
        where: { userId: user.id, published: true },
        take: Math.ceil(limit / 4),
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          coverImage: true,
          publishedAt: true,
          likesCount: true,
          commentsCount: true,
        },
      }),
      prisma.reflection.findMany({
        where: { userId: user.id },
        take: Math.ceil(limit / 4),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          createdAt: true,
          likesCount: true,
          commentsCount: true,
          book: {
            select: {
              title: true,
              slug: true,
              coverImage: true,
            },
          },
        },
      }),
      prisma.userAchievement.findMany({
        where: { userId: user.id },
        take: Math.ceil(limit / 4),
        orderBy: { awardedAt: 'desc' },
        select: {
          id: true,
          awardedAt: true,
          achievement: {
            select: {
              slug: true,
              title: true,
              name: true,
              icon: true,
              tier: true,
            },
          },
        },
      }),
      prisma.follow.findMany({
        where: { followerId: user.id },
        take: Math.ceil(limit / 4),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          following: {
            select: {
              username: true,
              name: true,
              image: true,
              dynastyScore: true,
            },
          },
        },
      }),
    ]);

    // Combine and sort by date
    const activities = [
      ...posts.map((p) => ({
        type: 'post',
        id: p.id,
        date: p.publishedAt,
        data: p,
      })),
      ...reflections.map((r) => ({
        type: 'reflection',
        id: r.id,
        date: r.createdAt,
        data: r,
      })),
      ...achievements.map((a) => ({
        type: 'achievement',
        id: a.id,
        date: a.awardedAt,
        data: a,
      })),
      ...follows.map((f) => ({
        type: 'follow',
        id: f.id,
        date: f.createdAt,
        data: f,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return NextResponse.json({
      activities: activities.slice(0, limit),
      hasMore: activities.length > limit,
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
