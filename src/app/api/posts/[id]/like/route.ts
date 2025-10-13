import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db/prisma';
import { grantDynastyScore } from '@/lib/dynasty-score';
import { calculateHotScore } from '@/lib/hot-score';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * POST /api/posts/[id]/like
 * Toggle like on a post (like if not liked, unlike if already liked)
 */
export async function POST(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to like posts' },
        { status: 401 }
      );
    }

    const { id: postId } = params;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { 
        id: true, 
        authorId: true,
        likeCount: true,
        commentCount: true,
        viewCount: true,
        publishedAt: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user already liked this post
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    let liked: boolean;
    let newLikeCount: number;

    if (existingLike) {
      // Unlike: Remove like and decrement counter
      await prisma.$transaction(async (tx) => {
        await tx.postLike.delete({
          where: {
            id: existingLike.id,
          },
        });

        await tx.post.update({
          where: { id: postId },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
        });
      });

      liked = false;
      newLikeCount = post.likeCount - 1;

    } else {
      // Like: Create like, increment counter, award DS, send notification, update hot score
      const result = await prisma.$transaction(async (tx) => {
        // Create the like
        await tx.postLike.create({
          data: {
            userId: session.user.id,
            postId,
          },
        });

        // Increment like count
        const updatedPost = await tx.post.update({
          where: { id: postId },
          data: {
            likeCount: {
              increment: 1,
            },
          },
        });

        // Calculate and update hot score
        if (post.publishedAt) {
          const newHotScore = calculateHotScore({
            likes: updatedPost.likeCount,
            comments: updatedPost.commentCount,
            views: updatedPost.viewCount,
            publishedAt: post.publishedAt,
          });

          await tx.post.update({
            where: { id: postId },
            data: { hotScore: newHotScore },
          });

          // Update feed item hot score
          await tx.feedItem.updateMany({
            where: { postId },
            data: { hotScore: newHotScore },
          });
        }

        // Award Dynasty Score to post author (not the liker)
        if (post.authorId !== session.user.id) {
          await grantDynastyScore({
            userId: post.authorId,
            action: 'LIKE_RECEIVED',
            points: 1,
            entityType: 'POST_LIKE',
            entityId: postId,
            metadata: {
              likedBy: session.user.id,
              likedByName: session.user.name,
            },
          });

          // Create notification for post author
          await tx.notification.create({
            data: {
              userId: post.authorId,
              actorId: session.user.id,
              type: 'LIKE',
              entityType: 'POST',
              entityId: postId,
              message: `${session.user.name} liked your post`,
              seen: false,
            },
          });
        }

        return updatedPost;
      });

      liked = true;
      newLikeCount = result.likeCount;
    }

    return NextResponse.json({
      success: true,
      liked,
      likeCount: newLikeCount,
      message: liked ? 'Post liked' : 'Post unliked',
    });

  } catch (error) {
    console.error('Error toggling post like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/posts/[id]/like
 * Check if current user has liked this post
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        liked: false,
      });
    }

    const { id: postId } = params;

    const like = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      liked: !!like,
    });

  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json(
      { error: 'Failed to check like status' },
      { status: 500 }
    );
  }
}
