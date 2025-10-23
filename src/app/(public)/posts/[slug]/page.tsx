import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import PostDetailClient from "./PostDetailClient";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          username: true,
          dynastyScore: true,
          level: true,
          _count: {
            select: {
              posts: true,
              followers: true,
            },
          },
        },
      },
      likes: {
        select: {
          userId: true,
        },
      },
      comments: {
        where: {
          parentId: null, // Only top-level comments
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true,
              level: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  return post;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | Dynasty Academy`,
    description: post.excerpt || post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      images: post.coverImage ? [post.coverImage] : [],
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      authors: [post.author.name || "Anonymous"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const session = await getServerSession(authOptions);
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post || !post.published) {
    notFound();
  }

  // Check if user has liked the post
  const userLiked = session?.user?.id
    ? post.likes.some((like) => like.userId === session.user.id)
    : false;

  // Check if user has saved the post (we'll implement this later)
  const userSaved = false;

  // Increment view count
  await prisma.post.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  });

  return (
    <PostDetailClient
      initialPost={{
        id: post.id,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || "",
        coverImage: post.coverImage,
        tags: post.tags,
        viewCount: post.viewCount + 1,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        saveCount: post.saveCount || 0,
        hotScore: post.hotScore,
        publishedAt:
          post.publishedAt?.toISOString() || post.createdAt.toISOString(),
        author: {
          id: post.author.id,
          name: post.author.name || post.author.username || "Anonymous",
          username: post.author.username || "anonymous",
          image: post.author.image,
          dynastyScore: post.author.dynastyScore,
          level: post.author.level || 1,
          _count: {
            posts: post.author._count.posts,
            followers: post.author._count.followers,
          },
        },
      }}
      initialComments={post.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        likeCount: 0, // We'll implement comment likes later
        author: {
          id: comment.author.id,
          name: comment.author.name || comment.author.username || "Anonymous",
          username: comment.author.username || "anonymous",
          image: comment.author.image,
          level: comment.author.level,
        },
        _count: {
          replies: comment._count.replies,
        },
      }))}
      initialLiked={userLiked}
      initialSaved={userSaved}
    />
  );
}
