import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/comments/[id]/like
 * Toggle like on a comment (like if not liked, unlike if already liked)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to like comments" },
        { status: 401 }
      );
    }

    const { id: commentId } = await params;

    // Check if comment exists
    const comment = await prisma.postComment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        authorId: true,
        likeCount: true,
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check if user already liked this comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    });

    let liked: boolean;
    let newLikeCount: number;

    if (existingLike) {
      // Unlike: Remove like and decrement counter
      await prisma.$transaction(async (tx) => {
        await tx.commentLike.delete({
          where: {
            id: existingLike.id,
          },
        });

        await tx.postComment.update({
          where: { id: commentId },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
        });
      });

      liked = false;
      newLikeCount = comment.likeCount - 1;
    } else {
      // Like: Create like and increment counter
      await prisma.$transaction(async (tx) => {
        await tx.commentLike.create({
          data: {
            userId: session.user.id,
            commentId,
          },
        });

        await tx.postComment.update({
          where: { id: commentId },
          data: {
            likeCount: {
              increment: 1,
            },
          },
        });
      });

      liked = true;
      newLikeCount = comment.likeCount + 1;
    }

    return NextResponse.json({
      success: true,
      liked,
      likeCount: newLikeCount,
      message: liked ? "Comment liked" : "Comment unliked",
    });
  } catch (error) {
    console.error("Error toggling comment like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/comments/[id]/like
 * Check if current user has liked this comment
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        liked: false,
      });
    }

    const { id: commentId } = await params;

    const like = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      liked: !!like,
    });
  } catch (error) {
    console.error("Error checking like status:", error);
    return NextResponse.json(
      { error: "Failed to check like status" },
      { status: 500 }
    );
  }
}
