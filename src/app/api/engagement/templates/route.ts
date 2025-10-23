import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/engagement/templates - List all templates
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel");
    const type = searchParams.get("type");
    const activeOnly = searchParams.get("active") === "true";

    const templates = await (prisma as any).interventionTemplate.findMany({
      where: {
        ...(channel && { channel }),
        ...(type && { type }),
        ...(activeOnly && { isActive: true }),
      },
      include: {
        variants: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST /api/engagement/templates - Create new template
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      type,
      subject,
      body: templateBody,
      cta,
      ctaUrl,
      channel,
      useAiPersonalization,
      aiPrompt,
    } = body;

    // Validation
    if (
      !name ||
      !type ||
      !subject ||
      !templateBody ||
      !cta ||
      !ctaUrl ||
      !channel
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const template = await (prisma as any).interventionTemplate.create({
      data: {
        name,
        type,
        subject,
        body: templateBody,
        cta,
        ctaUrl,
        channel,
        useAiPersonalization: useAiPersonalization || false,
        aiPrompt: aiPrompt || null,
        isActive: true,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}

// PUT /api/engagement/templates/:id - Update template
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Template ID required" },
        { status: 400 }
      );
    }

    // If body field exists in updateData, rename it to avoid conflict
    if (updateData.body) {
      updateData.body = updateData.body;
    }

    const template = await (prisma as any).interventionTemplate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE /api/engagement/templates/:id
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Template ID required" },
        { status: 400 }
      );
    }

    await (prisma as any).interventionTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
