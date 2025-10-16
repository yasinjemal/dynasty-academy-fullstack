import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

// POST /api/resources/[resourceId]/download - Track resource download
export async function POST(
  request: NextRequest,
  { params }: { params: { resourceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Replace with actual Prisma query
    // Check if already downloaded
    // const existingDownload = await prisma.resourceDownload.findUnique({
    //   where: {
    //     resourceId_userId: {
    //       resourceId: params.resourceId,
    //       userId: session.user.id,
    //     }
    //   }
    // });

    // if (!existingDownload) {
    //   // Create download record
    //   await prisma.resourceDownload.create({
    //     data: {
    //       resourceId: params.resourceId,
    //       userId: session.user.id,
    //     }
    //   });

    //   // Increment download count
    //   await prisma.lessonResource.update({
    //     where: { id: params.resourceId },
    //     data: { downloadCount: { increment: 1 } }
    //   });
    // }

    return NextResponse.json({
      success: true,
      message: "Download tracked successfully",
    });
  } catch (error) {
    console.error("Error tracking download:", error);
    return NextResponse.json(
      { error: "Failed to track download" },
      { status: 500 }
    );
  }
}
