import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username: rawUsername } = await params;
    const username = rawUsername.replace("@", "");
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "new";
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

    // Build orderBy based on filter
    let orderBy: any = { createdAt: "desc" };
    if (filter === "top") {
      orderBy = { likeCount: "desc" };
    } else if (filter === "discussed") {
      orderBy = { commentCount: "desc" };
    }

    const posts = await prisma.post.findMany({
      where: {
        authorId: user.id,
        published: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        createdAt: true,
        likeCount: true,
        commentCount: true,
        saveCount: true,
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit + 1,
    });

    const hasMore = posts.length > limit;
    const returnPosts = posts.slice(0, limit);

    return NextResponse.json({
      posts: returnPosts.map((post) => ({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt.toISOString(),
        likesCount: post.likeCount,
        commentsCount: post.commentCount,
        bookmarksCount: post.saveCount,
      })),
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
