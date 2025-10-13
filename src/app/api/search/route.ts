import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type"); // 'all', 'users', 'posts', 'books', 'reflections'
    const limit = parseInt(searchParams.get("limit") || "20");

    if (query.length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const results: any = {
      users: [],
      posts: [],
      books: [],
      reflections: [],
      topics: [],
    };

    // Search Users
    if (!type || type === "all" || type === "users") {
      results.users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          dynastyScore: true,
          _count: {
            select: {
              posts: true,
              followers: true,
            },
          },
        },
        take: limit,
        orderBy: { dynastyScore: "desc" },
      });
    }

    // Search Posts
    if (!type || type === "all" || type === "posts") {
      results.posts = await prisma.post.findMany({
        where: {
          AND: [
            { published: true },
            {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { content: { contains: query, mode: "insensitive" } },
                { excerpt: { contains: query, mode: "insensitive" } },
              ],
            },
          ],
        },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          content: true,
          image: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      });
    }

    // Search Books
    if (!type || type === "all" || type === "books") {
      results.books = await prisma.book.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { author: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          author: true,
          description: true,
          coverImage: true,
          category: true,
          _count: {
            select: {
              reflections: true,
            },
          },
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      });
    }

    // Search Reflections
    if (!type || type === "all" || type === "reflections") {
      results.reflections = await prisma.reflection.findMany({
        where: {
          AND: [
            { published: true },
            {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { content: { contains: query, mode: "insensitive" } },
              ],
            },
          ],
        },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          book: {
            select: {
              id: true,
              title: true,
              coverImage: true,
            },
          },
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      });
    }

    // Search Topics (if query starts with #)
    if (query.startsWith("#")) {
      const topicQuery = query.slice(1);
      results.topics = await prisma.post.groupBy({
        by: ["id"],
        where: {
          published: true,
          content: { contains: `#${topicQuery}`, mode: "insensitive" },
        },
        take: 10,
      });
    }

    // Format results for frontend
    const formattedResults = [
      ...results.users.map((user: any) => ({
        type: "user",
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        dynastyScore: user.dynastyScore,
        postCount: user._count.posts,
        followerCount: user._count.followers,
      })),
      ...results.posts.map((post: any) => ({
        type: "post",
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt || post.content.substring(0, 150) + "...",
        image: post.image,
        author: post.author,
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        createdAt: post.createdAt,
      })),
      ...results.books.map((book: any) => ({
        type: "book",
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        coverImage: book.coverImage,
        category: book.category,
        reflectionCount: book._count.reflections,
      })),
      ...results.reflections.map((reflection: any) => ({
        type: "reflection",
        id: reflection.id,
        title: reflection.title,
        content: reflection.content.substring(0, 150) + "...",
        user: reflection.user,
        book: reflection.book,
        createdAt: reflection.createdAt,
      })),
    ];

    return NextResponse.json({
      query,
      results: formattedResults,
      counts: {
        users: results.users.length,
        posts: results.posts.length,
        books: results.books.length,
        reflections: results.reflections.length,
        topics: results.topics.length,
        total: formattedResults.length,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
