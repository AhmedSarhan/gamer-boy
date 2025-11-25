import { db } from "@/db/index";
import { games, categories, gameCategories, type Game } from "@/db/schema";
import { eq, like, and, ne, inArray, sql } from "drizzle-orm";
import { PAGINATION } from "@/shared/constants";
import type { GameWithCategories, Category } from "@/shared/types";

/**
 * Generate iframe URL with gd_sdk_referrer_url parameter at runtime
 */
export function generateIframeUrl(
  gameId: string,
  gameSlug: string,
  baseUrl?: string
): string {
  const gamePageUrl = baseUrl
    ? `${baseUrl}/games/${gameSlug}`
    : typeof window !== "undefined"
      ? `${window.location.origin}/games/${gameSlug}`
      : `/games/${gameSlug}`;
  return `https://html5.gamedistribution.com/${gameId}/?gd_sdk_referrer_url=${encodeURIComponent(gamePageUrl)}`;
}

/**
 * Helper function to attach categories to games efficiently using a single JOIN query
 * This eliminates the N+1 query problem by fetching all categories in one go
 */
async function attachCategoriesToGames(
  gamesList: Game[]
): Promise<GameWithCategories[]> {
  if (gamesList.length === 0) {
    return [];
  }

  const gameIds = gamesList.map((game) => game.id);

  // Single JOIN query to get all categories for all games at once
  const result = await db
    .select({
      gameId: gameCategories.gameId,
      category: categories,
    })
    .from(gameCategories)
    .leftJoin(categories, eq(gameCategories.categoryId, categories.id))
    .where(inArray(gameCategories.gameId, gameIds));

  // Group categories by game ID
  const categoryMap = new Map<number, Category[]>();
  result.forEach(({ gameId, category }) => {
    if (category) {
      if (!categoryMap.has(gameId)) {
        categoryMap.set(gameId, []);
      }
      categoryMap.get(gameId)!.push(category);
    }
  });

  // Map games with their categories
  return gamesList.map((game) => ({
    ...game,
    categories: categoryMap.get(game.id) || [],
  }));
}

/**
 * Unified function to get games with pagination, search, and category filtering
 * This is the most efficient way to fetch games as it handles pagination at the database level
 */
export async function getGames({
  search,
  categories: categoryFilter,
  page = PAGINATION.DEFAULT_PAGE,
  limit = PAGINATION.DEFAULT_PAGE_SIZE,
}: {
  search?: string;
  categories?: string[];
  page?: number;
  limit?: number;
}): Promise<{ games: GameWithCategories[]; totalCount: number }> {
  const offset = (page - 1) * limit;

  // Build the base query conditions
  let gameIds: number[] | null = null;

  // Handle category filtering first
  if (categoryFilter && categoryFilter.length > 0) {
    const foundCategories = await db
      .select()
      .from(categories)
      .where(inArray(categories.slug, categoryFilter));

    if (foundCategories.length === 0) {
      return { games: [], totalCount: 0 };
    }

    const categoryIds = foundCategories.map((cat) => cat.id);
    const relations = await db
      .select()
      .from(gameCategories)
      .where(inArray(gameCategories.categoryId, categoryIds));

    gameIds = [...new Set(relations.map((rel) => rel.gameId))];

    if (gameIds.length === 0) {
      return { games: [], totalCount: 0 };
    }
  }

  // Build the WHERE conditions
  const conditions = [];
  if (search) {
    conditions.push(like(games.title, `%${search}%`));
  }
  if (gameIds !== null) {
    conditions.push(inArray(games.id, gameIds));
  }

  const whereClause =
    conditions.length === 0
      ? undefined
      : conditions.length === 1
        ? conditions[0]
        : and(...conditions);

  // Get total count
  const countQuery = whereClause
    ? db
        .select({ count: sql<number>`count(*)` })
        .from(games)
        .where(whereClause)
    : db.select({ count: sql<number>`count(*)` }).from(games);

  const [{ count: totalCount }] = await countQuery;

  // Get paginated games
  const gamesQuery = whereClause
    ? db.select().from(games).where(whereClause).limit(limit).offset(offset)
    : db.select().from(games).limit(limit).offset(offset);

  const paginatedGames = await gamesQuery;

  if (paginatedGames.length === 0) {
    return { games: [], totalCount: 0 };
  }

  // Attach categories using the optimized helper (1 JOIN query instead of 3 separate queries)
  const gamesWithCategories = await attachCategoriesToGames(paginatedGames);

  return { games: gamesWithCategories, totalCount };
}

/**
 * Get games by their IDs
 * Used for fetching favorites and recently played games
 */
export async function getGamesByIds(
  ids: number[]
): Promise<GameWithCategories[]> {
  if (ids.length === 0) {
    return [];
  }

  const selectedGames = await db
    .select()
    .from(games)
    .where(inArray(games.id, ids));

  if (selectedGames.length === 0) {
    return [];
  }

  // Attach categories using the optimized helper
  const gamesWithCategories = await attachCategoriesToGames(selectedGames);

  // Preserve the order of input IDs
  const gamesMap = new Map(gamesWithCategories.map((game) => [game.id, game]));
  return ids
    .map((id) => gamesMap.get(id))
    .filter((game): game is GameWithCategories => game !== undefined);
}

/**
 * Get all games from the database
 */
export async function getAllGames(): Promise<GameWithCategories[]> {
  const allGames = await db.select().from(games);
  return attachCategoriesToGames(allGames);
}

/**
 * Get a game by ID
 */
export async function getGameById(
  id: number
): Promise<GameWithCategories | null> {
  const game = await db.select().from(games).where(eq(games.id, id)).limit(1);

  if (game.length === 0) {
    return null;
  }

  const gamesWithCategories = await attachCategoriesToGames(game);
  return gamesWithCategories[0];
}

/**
 * Get a game by slug
 */
export async function getGameBySlug(
  slug: string
): Promise<GameWithCategories | null> {
  const game = await db
    .select()
    .from(games)
    .where(eq(games.slug, slug))
    .limit(1);

  if (game.length === 0) {
    return null;
  }

  const gamesWithCategories = await attachCategoriesToGames(game);
  return gamesWithCategories[0];
}

/**
 * Get games by category slug (supports multiple categories)
 */
export async function getGamesByCategory(
  categorySlugs: string | string[]
): Promise<GameWithCategories[]> {
  const slugArray = Array.isArray(categorySlugs)
    ? categorySlugs
    : [categorySlugs];

  if (
    slugArray.length === 0 ||
    slugArray.includes("all") ||
    slugArray[0] === ""
  ) {
    return getAllGames();
  }

  // Find categories by slugs
  const foundCategories = await db
    .select()
    .from(categories)
    .where(inArray(categories.slug, slugArray));

  if (foundCategories.length === 0) {
    return [];
  }

  const categoryIds = foundCategories.map((cat) => cat.id);

  // Get all game-category relationships for these categories
  const relations = await db
    .select()
    .from(gameCategories)
    .where(inArray(gameCategories.categoryId, categoryIds));

  const gameIds = [...new Set(relations.map((rel) => rel.gameId))];
  if (gameIds.length === 0) {
    return [];
  }

  // Get all games
  const categoryGames = await db
    .select()
    .from(games)
    .where(inArray(games.id, gameIds));

  return attachCategoriesToGames(categoryGames);
}

/**
 * Search games by title
 */
export async function searchGames(
  query: string
): Promise<GameWithCategories[]> {
  if (!query || query.trim() === "") {
    return getAllGames();
  }

  const searchPattern = `%${query}%`;
  const searchResults = await db
    .select()
    .from(games)
    .where(like(games.title, searchPattern));

  return attachCategoriesToGames(searchResults);
}

/**
 * Get featured games (first N games)
 */
export async function getFeaturedGames(
  limit: number = 10
): Promise<GameWithCategories[]> {
  const featuredGames = await db.select().from(games).limit(limit);
  return attachCategoriesToGames(featuredGames);
}

/**
 * Get related games (same categories, excluding current game)
 */
export async function getRelatedGames(
  gameId: number,
  limit: number = 4
): Promise<GameWithCategories[]> {
  // Get current game's categories
  const gameRelations = await db
    .select()
    .from(gameCategories)
    .where(eq(gameCategories.gameId, gameId));

  if (gameRelations.length === 0) {
    return [];
  }

  const categoryIds = gameRelations.map((rel) => rel.categoryId);

  // Get other games with same categories
  const relatedRelations = await db
    .select()
    .from(gameCategories)
    .where(
      and(
        inArray(gameCategories.categoryId, categoryIds),
        ne(gameCategories.gameId, gameId)
      )
    );

  const relatedGameIds = [
    ...new Set(relatedRelations.map((rel) => rel.gameId)),
  ].slice(0, limit);

  if (relatedGameIds.length === 0) {
    return [];
  }

  const relatedGames = await db
    .select()
    .from(games)
    .where(inArray(games.id, relatedGameIds));

  return attachCategoriesToGames(relatedGames);
}

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<Category[]> {
  return db.select().from(categories);
}
