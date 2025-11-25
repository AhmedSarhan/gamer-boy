import { getGames } from "@/modules/games/lib/games";
import { PAGINATION } from "@/shared/constants";
import { NextRequest, NextResponse } from "next/server";

// API routes must be dynamic (uses searchParams)
export const dynamic = "force-dynamic";

// Cache for 1 hour, revalidate in background
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(
      searchParams.get("page") || String(PAGINATION.DEFAULT_PAGE),
      10
    );
    const limit = parseInt(
      searchParams.get("limit") || String(PAGINATION.DEFAULT_PAGE_SIZE),
      10
    );
    const searchQuery = searchParams.get("q") || undefined;
    const categoryFilter = searchParams.get("categories") || undefined;

    // Use the unified getGames function with database-level pagination
    const { games, totalCount } = await getGames({
      search: searchQuery,
      categories: categoryFilter?.split(",").filter(Boolean),
      page,
      limit,
    });

    const hasMore = page * limit < totalCount;

    return NextResponse.json(
      {
        games,
        pagination: {
          page,
          limit,
          total: totalCount,
          hasMore,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
