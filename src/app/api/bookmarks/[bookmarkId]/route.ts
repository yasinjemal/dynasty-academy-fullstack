import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

// DELETE /api/bookmarks/[bookmarkId] - Delete a bookmark
export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Replace with actual Prisma query
    // Verify ownership before deleting
    // const bookmark = await prisma.videoBookmark.findUnique({
    //   where: { id: params.bookmarkId }
    // });

    // if (!bookmark || bookmark.userId !== session.user.id) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    // await prisma.videoBookmark.delete({
    //   where: { id: params.bookmarkId }
    // });

    return NextResponse.json({
      success: true,
      message: "Bookmark deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    return NextResponse.json(
      { error: "Failed to delete bookmark" },
      { status: 500 }
    );
  }
}

// PATCH /api/bookmarks/[bookmarkId] - Update a bookmark
export async function PATCH(
  request: NextRequest,
  { params }: { params: { bookmarkId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, note } = body;

    // TODO: Replace with actual Prisma query
    // const bookmark = await prisma.videoBookmark.findUnique({
    //   where: { id: params.bookmarkId }
    // });

    // if (!bookmark || bookmark.userId !== session.user.id) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    // const updated = await prisma.videoBookmark.update({
    //   where: { id: params.bookmarkId },
    //   data: { title, note }
    // });

    // Mock response
    const mockBookmark = {
      id: params.bookmarkId,
      title,
      note,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      bookmark: mockBookmark,
    });
  } catch (error) {
    console.error("Error updating bookmark:", error);
    return NextResponse.json(
      { error: "Failed to update bookmark" },
      { status: 500 }
    );
  }
}
