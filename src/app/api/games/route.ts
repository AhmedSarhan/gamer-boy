import { getGames } from "@/modules/games/lib/games";
import { PAGINATION } from "@/shared/constants";
import {
  withErrorHandler,
  createSuccessResponse,
} from "@/shared/lib/api-handler";
import { DatabaseError } from "@/shared/lib/errors";
import { validateQueryParams, gamesQuerySchema } from "@/shared/lib/validation";
import { rateLimit, rateLimitPresets } from "@/shared/lib/rate-limit";
import { NextRequest } from "next/server";

// API routes must be dynamic (uses searchParams)
export const dynamic = "force-dynamic";

// Cache for 1 hour, revalidate in background
export const revalidate = 3600;

export const GET = withErrorHandler(
  rateLimit(async (request: NextRequest) => {
    // Validate query parameters
    const validatedParams = validateQueryParams(request, gamesQuerySchema);

    const page = validatedParams.page ?? PAGINATION.DEFAULT_PAGE;
    const limit = validatedParams.limit ?? PAGINATION.DEFAULT_PAGE_SIZE;
    const searchQuery = validatedParams.q;
    const categoryFilter = validatedParams.categories;

    try {
      // Use the unified getGames function with database-level pagination
      const { games, totalCount } = await getGames({
        search: searchQuery,
        categories: categoryFilter?.split(",").filter(Boolean),
        page,
        limit,
      });

      const hasMore = page * limit < totalCount;

      return createSuccessResponse(
        {
          games,
          pagination: {
            page,
            limit,
            total: totalCount,
            hasMore,
          },
        },
        200,
        {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        }
      );
    } catch (error) {
      throw new DatabaseError("Failed to fetch games from database", {
        originalError: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, rateLimitPresets.moderate)
);
