import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username.replace("@", "");
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const session = await getServerSession(authOptions);

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, isPrivate: true, isBanned: true, isSuspended: true },
    });

    if (!user || user.isBanned || user.isSuspended) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isOwner = session?.user?.id === user.id;
    const viewerId = session?.user?.id;

    // Privacy check
    if (user.isPrivate && !isOwner) {
      const isFollowing = viewerId
        ? await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: viewerId,
                followingId: user.id,
              },
            },
          })
        : null;

      if (!isFollowing) {
        return NextResponse.json(
          { error: "This profile is private" },
          { status: 403 }
        );
      }
    }

    const reflections = await prisma.reflection.findMany({
      where: {
        userId: user.id,
        isPrivate: false,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            slug: true,
            author: true,
            coverImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit + 1,
    });

    const hasMore = reflections.length > limit;
    const returnReflections = reflections.slice(0, limit);

    return NextResponse.json({
      reflections: returnReflections.map((ref) => ({
        id: ref.id,
        content: ref.content,
        createdAt: ref.createdAt.toISOString(),
        page: ref.page,
        book: ref.book,
      })),
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching reflections:", error);
    return NextResponse.json(
      { error: "Failed to fetch reflections" },
      { status: 500 }
    );
  }
}
