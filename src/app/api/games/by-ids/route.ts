import { getGamesByIds } from "@/modules/games/lib/games";
import {
  withErrorHandler,
  createSuccessResponse,
} from "@/shared/lib/api-handler";
import { BadRequestError, DatabaseError } from "@/shared/lib/errors";
import {
  validateQueryParams,
  gamesByIdsQuerySchema,
} from "@/shared/lib/validation";
import { NextRequest } from "next/server";

// API routes must be dynamic (uses searchParams)
export const dynamic = "force-dynamic";

// Cache for 2 hours, games data rarely changes
export const revalidate = 7200;

export const GET = withErrorHandler(async (request: NextRequest) => {
  // Validate query parameters
  const validatedParams = validateQueryParams(request, gamesByIdsQuerySchema);
  const idsParam = validatedParams.ids;

  // Parse comma-separated IDs
  const ids = idsParam
    .split(",")
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !isNaN(id));

  if (ids.length === 0) {
    throw new BadRequestError("No valid IDs provided");
  }

  try {
    const games = await getGamesByIds(ids);

    return createSuccessResponse({ games }, 200, {
      "Cache-Control": "public, s-maxage=7200, stale-while-revalidate=14400",
    });
  } catch (error) {
    throw new DatabaseError("Failed to fetch games by IDs", {
      originalError: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
