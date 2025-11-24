import { getGames } from "@/modules/games/lib/games";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
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

    return NextResponse.json({
      games,
      pagination: {
        page,
        limit,
        total: totalCount,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
