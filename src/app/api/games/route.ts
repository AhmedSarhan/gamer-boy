import { NextRequest, NextResponse } from "next/server";
import {
  getAllGames,
  searchGames,
  getGamesByCategory,
} from "@/modules/games/lib";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const searchQuery = searchParams.get("q");
    const categoryFilter = searchParams.get("categories");

    // Calculate offset
    const offset = (page - 1) * limit;

    let allGames;

    // Handle search + category filter combination
    if (searchQuery && categoryFilter) {
      const categoryArray = categoryFilter.split(",").filter(Boolean);
      const categoryGames = await getGamesByCategory(categoryArray);
      allGames = categoryGames.filter((game) =>
        game.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (searchQuery) {
      allGames = await searchGames(searchQuery);
    } else if (categoryFilter) {
      const categoryArray = categoryFilter.split(",").filter(Boolean);
      allGames = await getGamesByCategory(categoryArray);
    } else {
      allGames = await getAllGames();
    }

    // Apply pagination
    const games = allGames.slice(offset, offset + limit);
    const total = allGames.length;
    const hasMore = offset + limit < total;

    return NextResponse.json({
      games,
      pagination: {
        page,
        limit,
        total,
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
