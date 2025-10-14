import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

/**
 * POST /api/posts/[id]/save
 * Toggle save on a post (save/unsave)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to save posts" },
        { status: 401 }
      );
    }

    const { id: postId } = await params;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, saveCount: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user has already saved this post
    const existingSave = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (existingSave) {
      // Unsave: Delete save and decrement counter
      await prisma.$transaction(async (tx) => {
        await tx.savedPost.delete({
          where: { id: existingSave.id },
        });

        await tx.post.update({
          where: { id: postId },
          data: {
            saveCount: {
              decrement: 1,
            },
          },
        });
      });

      return NextResponse.json({
        success: true,
        saved: false,
        message: "Post unsaved",
      });
    } else {
      // Save: Create save and increment counter
      await prisma.$transaction(async (tx) => {
        await tx.savedPost.create({
          data: {
            userId: session.user.id,
            postId,
          },
        });

        await tx.post.update({
          where: { id: postId },
          data: {
            saveCount: {
              increment: 1,
            },
          },
        });
      });

      return NextResponse.json({
        success: true,
        saved: true,
        message: "Post saved successfully",
      });
    }
  } catch (error) {
    console.error("Error toggling post save:", error);
    return NextResponse.json(
      { error: "Failed to toggle post save" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/posts/[id]/save
 * Check if user has saved the post
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ saved: false });
    }

    const { id: postId } = await params;

    const save = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    return NextResponse.json({ saved: !!save });
  } catch (error) {
    console.error("Error checking save status:", error);
    return NextResponse.json({ saved: false });
  }
}
