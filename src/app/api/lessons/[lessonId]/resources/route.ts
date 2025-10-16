import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

// GET /api/lessons/[lessonId]/resources - Fetch all resources for a lesson
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
    // const resources = await prisma.lessonResource.findMany({
    //   where: {
    //     lessonId: params.lessonId,
    //   },
    //   include: {
    //     downloads: {
    //       where: { userId: session.user.id },
    //       select: { id: true }
    //     }
    //   },
    //   orderBy: { createdAt: 'asc' }
    // });

    // const formattedResources = resources.map(r => ({
    //   ...r,
    //   hasDownloaded: r.downloads.length > 0,
    //   downloads: undefined, // Remove from response
    // }));

    // Mock data
    const mockResources = [
      {
        id: "res1",
        title: "React Hooks Cheat Sheet",
        description:
          "Comprehensive reference guide for all React hooks with examples and best practices",
        fileUrl: "https://example.com/react-hooks-cheatsheet.pdf",
        fileType: "application/pdf",
        fileSize: 2457600, // 2.4 MB
        downloadCount: 156,
        hasDownloaded: false,
      },
      {
        id: "res2",
        title: "Sample Code Files",
        description: "Complete working examples from this lesson",
        fileUrl: "https://example.com/lesson-code.zip",
        fileType: "application/zip",
        fileSize: 5242880, // 5 MB
        downloadCount: 203,
        hasDownloaded: true,
      },
      {
        id: "res3",
        title: "Advanced Patterns Document",
        description: "In-depth exploration of advanced React patterns",
        fileUrl: "https://example.com/advanced-patterns.pdf",
        fileType: "application/pdf",
        fileSize: 1048576, // 1 MB
        downloadCount: 89,
        hasDownloaded: false,
      },
    ];

    return NextResponse.json({
      resources: mockResources,
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

// POST /api/lessons/[lessonId]/resources - Upload a new resource (Instructor only)
export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Check if user is instructor for this course
    // const isInstructor = await checkIfInstructor(session.user.id, courseId);
    // if (!isInstructor) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const body = await request.json();
    const { title, description, fileUrl, fileType, fileSize } = body;

    if (!title || !fileUrl || !fileType || !fileSize) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Replace with actual Prisma query
    // const resource = await prisma.lessonResource.create({
    //   data: {
    //     lessonId: params.lessonId,
    //     title,
    //     description,
    //     fileUrl,
    //     fileType,
    //     fileSize,
    //   }
    // });

    // Mock response
    const mockResource = {
      id: `res${Date.now()}`,
      title,
      description,
      fileUrl,
      fileType,
      fileSize,
      downloadCount: 0,
      hasDownloaded: false,
    };

    return NextResponse.json({
      resource: mockResource,
    });
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    );
  }
}
