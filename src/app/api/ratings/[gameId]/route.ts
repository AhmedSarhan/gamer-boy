import { NextRequest } from "next/server";
import { db } from "@/db";
import { ratings } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import {
  withErrorHandler,
  createSuccessResponse,
} from "@/shared/lib/api-handler";
import { BadRequestError, DatabaseError } from "@/shared/lib/errors";
import {
  validateQueryParams,
  validateParams,
  validateBody,
  ratingsQuerySchema,
  gameIdParamSchema,
  submitRatingSchema,
} from "@/shared/lib/validation";
import { rateLimit, rateLimitPresets } from "@/shared/lib/rate-limit";

// API routes must be dynamic (uses searchParams and dynamic params)
export const dynamic = "force-dynamic";

// Cache for 5 minutes - ratings change more frequently
export const revalidate = 300;

/**
 * GET /api/ratings/[gameId]
 * Fetch rating statistics for a specific game
 */
export const GET = withErrorHandler(
  rateLimit(
    async (
      request: NextRequest,
      context?: { params: Promise<Record<string, string>> }
    ) => {
      if (!context?.params) {
        throw new BadRequestError("Missing route parameters");
      }

      // Validate route parameters
      const params = await context.params;
      const validatedParams = validateParams(params, gameIdParamSchema);
      const gameIdNum = parseInt(validatedParams.gameId, 10);

      // Validate query parameters
      const queryParams = validateQueryParams(request, ratingsQuerySchema);
      const fingerprint = queryParams.fingerprint;

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
          originalError:
            error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    rateLimitPresets.moderate
  )
);

/**
 * POST /api/ratings/[gameId]
 * Submit or update a rating for a game
 */
export const POST = withErrorHandler(
  rateLimit(
    async (
      request: NextRequest,
      context?: { params: Promise<Record<string, string>> }
    ) => {
      if (!context?.params) {
        throw new BadRequestError("Missing route parameters");
      }

      // Validate route parameters
      const params = await context.params;
      const validatedParams = validateParams(params, gameIdParamSchema);
      const gameIdNum = parseInt(validatedParams.gameId, 10);

      // Validate request body
      const body = await validateBody(request, submitRatingSchema);
      const { rating: ratingValue, fingerprint } = body;

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
          originalError:
            error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    rateLimitPresets.strict
  )
);
