import { getGamesByIds } from "@/modules/games/lib/games";
import { NextRequest, NextResponse } from "next/server";

// API routes must be dynamic (uses searchParams)
export const dynamic = "force-dynamic";

// Cache for 2 hours, games data rarely changes
export const revalidate = 7200;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json(
        { error: "Missing 'ids' parameter" },
        { status: 400 }
      );
    }

    // Parse comma-separated IDs
    const ids = idsParam
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id));

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "No valid IDs provided" },
        { status: 400 }
      );
    }

    const games = await getGamesByIds(ids);

    return NextResponse.json(
      { games },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=7200, stale-while-revalidate=14400",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching games by IDs:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
