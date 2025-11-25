import { NextRequest } from "next/server";
import { db } from "@/db";
import { ratings } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import {
  withErrorHandler,
  createSuccessResponse,
  getQueryParam,
} from "@/shared/lib/api-handler";
import { BadRequestError, DatabaseError } from "@/shared/lib/errors";

// API routes must be dynamic (uses searchParams and dynamic params)
export const dynamic = "force-dynamic";

// Cache for 5 minutes - ratings change more frequently
export const revalidate = 300;

/**
 * GET /api/ratings/[gameId]
 * Fetch rating statistics for a specific game
 */
export const GET = withErrorHandler(
  async (
    request: NextRequest,
    context?: { params: Promise<Record<string, string>> }
  ) => {
    if (!context?.params) {
      throw new BadRequestError("Missing route parameters");
    }

    const params = await context.params;
    const gameId = params.gameId;
    const gameIdNum = parseInt(gameId, 10);

    if (isNaN(gameIdNum)) {
      throw new BadRequestError("Invalid game ID format");
    }

    try {
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
      const fingerprint = getQueryParam(request, "fingerprint");
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

      return createSuccessResponse(
        {
          gameId: gameIdNum,
          averageRating: parseFloat(stats.averageRating.toFixed(1)),
          totalRatings: stats.totalRatings,
          userRating,
        },
        200,
        {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        }
      );
    } catch (error) {
      throw new DatabaseError("Failed to fetch ratings", {
        gameId: gameIdNum,
        originalError: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * POST /api/ratings/[gameId]
 * Submit or update a rating for a game
 */
export const POST = withErrorHandler(
  async (
    request: NextRequest,
    context?: { params: Promise<Record<string, string>> }
  ) => {
    if (!context?.params) {
      throw new BadRequestError("Missing route parameters");
    }

    const params = await context.params;
    const gameId = params.gameId;
    const gameIdNum = parseInt(gameId, 10);

    if (isNaN(gameIdNum)) {
      throw new BadRequestError("Invalid game ID format");
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
      throw new BadRequestError("Rating must be a number between 1 and 5", {
        providedRating: ratingValue,
      });
    }

    // Validate fingerprint
    if (!fingerprint || typeof fingerprint !== "string") {
      throw new BadRequestError("User fingerprint is required");
    }

    try {
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

      return createSuccessResponse(
        {
          success: true,
          gameId: gameIdNum,
          averageRating: parseFloat(stats.averageRating.toFixed(1)),
          totalRatings: stats.totalRatings,
          userRating: ratingValue,
        },
        200,
        {
          "Cache-Control": "no-store",
        }
      );
    } catch (error) {
      throw new DatabaseError("Failed to submit rating", {
        gameId: gameIdNum,
        originalError: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);
