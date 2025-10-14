import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import PostDetailClient from "./PostDetailClient";

interface PostPageProps {
  params: {
    slug: string;
  };
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
              dynastyScore: true,
            },
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  username: true,
                  dynastyScore: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
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

  // Increment view count
  await prisma.post.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <PostDetailClient
        post={{
          ...post,
          userLiked,
          isAuthor: session?.user?.id === post.authorId,
        }}
        currentUser={session?.user}
      />
    </div>
  );
}
