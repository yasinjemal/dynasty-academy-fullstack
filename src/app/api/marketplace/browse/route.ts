/**
 * API ROUTE: Browse Marketplace
 * GET /api/marketplace/browse
 *
 * Browse products with filters, search, sorting, pagination
 * Public endpoint (no auth required to browse)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const type = searchParams.get("type") || undefined;
    const search = searchParams.get("search") || undefined;
    const sort = searchParams.get("sort") || "popular";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Build where clause
    const where: any = {
      status: "active",
    };

    if (type && type !== "all") {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sort) {
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "price_low":
        orderBy = {
          pricingJson: { path: ["prices", "0", "amount"], order: "asc" },
        };
        break;
      case "price_high":
        orderBy = {
          pricingJson: { path: ["prices", "0", "amount"], order: "desc" },
        };
        break;
      case "rating":
        orderBy = { statsJson: { path: ["rating"], order: "desc" } };
        break;
      case "popular":
      default:
        orderBy = { statsJson: { path: ["totalSales"], order: "desc" } };
        break;
    }

    // Get total count
    const total = await prisma.product.count({ where });

    // Get products
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        instructor: {
          select: {
            id: true,
            userId: true,
            name: true,
          },
        },
      },
    });

    // Format products
    const formattedProducts = products.map((p) => {
      const pricing = p.pricingJson as any;
      const content = p.contentJson as any;
      const stats = p.statsJson as any;

      return {
        id: p.id,
        type: p.type,
        title: p.title,
        description: p.description,
        slug: p.slug,
        instructorId: p.instructorId,
        instructorName: p.instructor?.name,
        instructorUserId: p.instructor?.userId,
        pricing: {
          type: pricing?.type || "one_time",
          currency: pricing?.currency || "USD",
          amount: pricing?.prices?.[0]?.amount || 0,
          originalAmount: pricing?.prices?.[0]?.originalAmount,
        },
        content: {
          preview: content?.preview,
          thumbnail: content?.thumbnail,
          features: content?.features || [],
        },
        stats: {
          rating: stats?.rating || 0,
          totalSales: stats?.totalSales || 0,
          totalReviews: stats?.totalReviews || 0,
        },
        createdAt: p.createdAt,
      };
    });

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error: any) {
    console.error("Error browsing marketplace:", error);
    return NextResponse.json(
      { error: error.message || "Failed to browse marketplace" },
      { status: 500 }
    );
  }
}
