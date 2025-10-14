import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/users/:userId/powerups
 * 
 * Returns power-ups catalog and user's active power-ups:
 * - Available power-ups in shop
 * - Currently active power-ups with timers
 * - User's coin balance
 * - Power-up effects and multipliers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);

    // Only allow users to see their own power-ups
    if (session?.user?.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get user's coin balance
    const userCoins = await prisma.userCoins.findUnique({
      where: { userId },
    });

    const coinBalance = userCoins?.balance || 0;

    // Get all available power-ups
    const allPowerUps = await prisma.powerUp.findMany({
      where: { isActive: true },
      orderBy: [
        { coinCost: "asc" },
        { rarity: "asc" },
      ],
    });

    // Get user's active power-ups
    const now = new Date();
    const activePowerUps = await prisma.userPowerUp.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: now },
      },
      include: {
        powerUp: true,
      },
      orderBy: { expiresAt: "asc" },
    });

    // Clean up expired power-ups
    await prisma.userPowerUp.updateMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { lte: now },
      },
      data: {
        isActive: false,
      },
    });

    // Format active power-ups with time remaining
    const activePowerUpsFormatted = activePowerUps.map(up => {
      const timeRemaining = up.expiresAt.getTime() - now.getTime();
      const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

      return {
        id: up.id,
        powerUp: {
          id: up.powerUp.id,
          key: up.powerUp.key,
          name: up.powerUp.name,
          description: up.powerUp.description,
          type: up.powerUp.type,
          multiplier: up.powerUp.multiplier,
          icon: up.powerUp.icon,
          rarity: up.powerUp.rarity,
        },
        activatedAt: up.activatedAt,
        expiresAt: up.expiresAt,
        timeRemaining: {
          total: timeRemaining,
          hours: hoursRemaining,
          minutes: minutesRemaining,
        },
      };
    });

    // Calculate total XP multiplier from active power-ups
    const totalXpMultiplier = activePowerUps.reduce((total, up) => {
      if (up.powerUp.type === "xp_multiplier" && up.powerUp.multiplier) {
        return total + (up.powerUp.multiplier - 1); // Sum additional multipliers
      }
      return total;
    }, 1); // Start at 1x

    // Check if streak protection is active
    const hasStreakProtection = activePowerUps.some(
      up => up.powerUp.type === "streak_protection"
    );

    return NextResponse.json({
      coinBalance,
      catalog: allPowerUps.map(pu => ({
        id: pu.id,
        key: pu.key,
        name: pu.name,
        description: pu.description,
        type: pu.type,
        multiplier: pu.multiplier,
        duration: pu.duration,
        coinCost: pu.coinCost,
        rarity: pu.rarity,
        icon: pu.icon,
        canAfford: coinBalance >= pu.coinCost,
      })),
      active: activePowerUpsFormatted,
      effects: {
        xpMultiplier: totalXpMultiplier,
        streakProtection: hasStreakProtection,
      },
    });

  } catch (error) {
    console.error("Error fetching power-ups:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/:userId/powerups/purchase
 * 
 * Purchase a power-up with coins
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { powerUpId } = body;

    // Only allow users to purchase for themselves
    if (session?.user?.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (!powerUpId) {
      return NextResponse.json(
        { error: "Power-up ID is required" },
        { status: 400 }
      );
    }

    // Get power-up details
    const powerUp = await prisma.powerUp.findUnique({
      where: { id: powerUpId },
    });

    if (!powerUp || !powerUp.isActive) {
      return NextResponse.json(
        { error: "Power-up not found or not available" },
        { status: 404 }
      );
    }

    // Purchase in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get user's current coin balance
      const userCoins = await tx.userCoins.findUnique({
        where: { userId },
      });

      const currentBalance = userCoins?.balance || 0;

      // Check if user can afford it
      if (currentBalance < powerUp.coinCost) {
        throw new Error("Insufficient coins");
      }

      // Deduct coins
      await tx.userCoins.update({
        where: { userId },
        data: {
          balance: {
            decrement: powerUp.coinCost,
          },
          spent: {
            increment: powerUp.coinCost,
          },
        },
      });

      // Calculate expiry time
      const now = new Date();
      const expiresAt = new Date(now.getTime() + powerUp.duration * 60 * 60 * 1000);

      // Activate power-up
      const activePowerUp = await tx.userPowerUp.create({
        data: {
          userId,
          powerUpId: powerUp.id,
          activatedAt: now,
          expiresAt,
          isActive: true,
        },
        include: {
          powerUp: true,
        },
      });

      return activePowerUp;
    });

    const timeRemaining = result.expiresAt.getTime() - Date.now();
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    return NextResponse.json({
      success: true,
      message: `${powerUp.name} activated!`,
      powerUp: {
        id: result.id,
        name: powerUp.name,
        description: powerUp.description,
        type: powerUp.type,
        multiplier: powerUp.multiplier,
        expiresAt: result.expiresAt,
        timeRemaining: {
          total: timeRemaining,
          hours: hoursRemaining,
          minutes: minutesRemaining,
        },
      },
    });

  } catch (error: any) {
    console.error("Error purchasing power-up:", error);
    
    if (error.message === "Insufficient coins") {
      return NextResponse.json(
        { error: "You don't have enough coins for this power-up" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
