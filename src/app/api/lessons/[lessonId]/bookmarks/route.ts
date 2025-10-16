import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

// GET /api/lessons/[lessonId]/bookmarks - Fetch all bookmarks for a lesson
export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Replace with actual Prisma query
    // const bookmarks = await prisma.videoBookmark.findMany({
    //   where: {
    //     lessonId: params.lessonId,
    //     userId: session.user.id,
    //   },
    //   orderBy: { timestamp: 'asc' }
    // });

    // Mock data
    const mockBookmarks = [
      {
        id: "bm1",
        timestamp: 180, // 3:00
        title: "Introduction to hooks",
        note: "Important concept - explains the motivation behind hooks",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "bm2",
        timestamp: 420, // 7:00
        title: "useState example",
        note: "Great example with counter component",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "bm3",
        timestamp: 720, // 12:00
        title: "useEffect cleanup",
        note: "Remember to cleanup subscriptions!",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json({
      bookmarks: mockBookmarks,
    });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}

// POST /api/lessons/[lessonId]/bookmarks - Create a new bookmark
export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { timestamp, title, note } = body;

    if (timestamp === undefined || !title) {
      return NextResponse.json(
        { error: "Timestamp and title are required" },
        { status: 400 }
      );
    }

    // TODO: Replace with actual Prisma query
    // const bookmark = await prisma.videoBookmark.create({
    //   data: {
    //     lessonId: params.lessonId,
    //     userId: session.user.id,
    //     timestamp,
    //     title,
    //     note,
    //   }
    // });

    // Mock response
    const mockBookmark = {
      id: `bm${Date.now()}`,
      timestamp,
      title,
      note,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      bookmark: mockBookmark,
    });
  } catch (error) {
    console.error("Error creating bookmark:", error);
    return NextResponse.json(
      { error: "Failed to create bookmark" },
      { status: 500 }
    );
  }
}
