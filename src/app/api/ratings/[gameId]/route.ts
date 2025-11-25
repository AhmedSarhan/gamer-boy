import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ratings } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// API routes must be dynamic (uses searchParams and dynamic params)
export const dynamic = "force-dynamic";

// Cache for 5 minutes - ratings change more frequently
export const revalidate = 300;

/**
 * GET /api/ratings/[gameId]
 * Fetch rating statistics for a specific game
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const gameIdNum = parseInt(gameId, 10);

    if (isNaN(gameIdNum)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
    }

    // Get average rating and total count
    const result = await db
      .select({
        averageRating: sql<number>`COALESCE(AVG(${ratings.rating}), 0)`,
        totalRatings: sql<number>`COUNT(*)`,
      })
      .from(ratings)
      .where(eq(ratings.gameId, gameIdNum));

    const stats = result[0] || { averageRating: 0, totalRatings: 0 };

    // Get user's rating if fingerprint is provided
    const fingerprint = request.nextUrl.searchParams.get("fingerprint");
    let userRating = null;

    if (fingerprint) {
      const userRatingResult = await db
        .select({ rating: ratings.rating })
        .from(ratings)
        .where(
          and(
            eq(ratings.gameId, gameIdNum),
            eq(ratings.userFingerprint, fingerprint)
          )
        )
        .limit(1);

      userRating = userRatingResult[0]?.rating || null;
    }

    return NextResponse.json(
      {
        gameId: gameIdNum,
        averageRating: parseFloat(stats.averageRating.toFixed(1)),
        totalRatings: stats.totalRatings,
        userRating,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ratings/[gameId]
 * Submit or update a rating for a game
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const gameIdNum = parseInt(gameId, 10);

    if (isNaN(gameIdNum)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
    }

    const body = await request.json();
    const { rating: ratingValue, fingerprint } = body;

    // Validate rating
    if (
      !ratingValue ||
      typeof ratingValue !== "number" ||
      ratingValue < 1 ||
      ratingValue > 5
    ) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Validate fingerprint
    if (!fingerprint || typeof fingerprint !== "string") {
      return NextResponse.json(
        { error: "User fingerprint is required" },
        { status: 400 }
      );
    }

    // Check if user already rated this game
    const existingRating = await db
      .select()
      .from(ratings)
      .where(
        and(
          eq(ratings.gameId, gameIdNum),
          eq(ratings.userFingerprint, fingerprint)
        )
      )
      .limit(1);

    if (existingRating.length > 0) {
      // Update existing rating
      await db
        .update(ratings)
        .set({
          rating: ratingValue,
          updatedAt: new Date(),
        })
        .where(eq(ratings.id, existingRating[0].id));
    } else {
      // Insert new rating
      await db.insert(ratings).values({
        gameId: gameIdNum,
        userFingerprint: fingerprint,
        rating: ratingValue,
      });
    }

    // Fetch updated stats
    const result = await db
      .select({
        averageRating: sql<number>`AVG(${ratings.rating})`,
        totalRatings: sql<number>`COUNT(*)`,
      })
      .from(ratings)
      .where(eq(ratings.gameId, gameIdNum));

    const stats = result[0];

    return NextResponse.json(
      {
        success: true,
        gameId: gameIdNum,
        averageRating: parseFloat(stats.averageRating.toFixed(1)),
        totalRatings: stats.totalRatings,
        userRating: ratingValue,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Error submitting rating:", error);
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    );
  }
}
