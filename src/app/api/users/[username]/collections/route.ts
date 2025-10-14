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

    // Fetch collections (only public ones for non-owners)
    const collections = await prisma.collection.findMany({
      where: {
        userId: user.id,
        ...(isOwner ? {} : { isPublic: true }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        itemCount: true,
        coverImage: true,
        isPublic: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      collections: collections.map((col) => ({
        id: col.id,
        name: col.name,
        slug: col.slug,
        description: col.description,
        itemCount: col.itemCount,
        coverImage: col.coverImage,
        isPublic: col.isPublic,
        createdAt: col.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}
