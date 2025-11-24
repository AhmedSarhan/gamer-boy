import { db } from "@/db/index";
import { games, categories, gameCategories } from "@/db/schema";
import { eq, like, and, ne, inArray, sql } from "drizzle-orm";
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
 * Unified function to get games with pagination, search, and category filtering
 * This is the most efficient way to fetch games as it handles pagination at the database level
 */
export async function getGames({
  search,
  categories: categoryFilter,
  page = 1,
  limit = 12,
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

  // Get categories for these games
  const paginatedGameIds = paginatedGames.map((game) => game.id);
  const relations = await db
    .select()
    .from(gameCategories)
    .where(inArray(gameCategories.gameId, paginatedGameIds));

  const categoryIds = [...new Set(relations.map((rel) => rel.categoryId))];
  const allCategories =
    categoryIds.length > 0
      ? await db
          .select()
          .from(categories)
          .where(inArray(categories.id, categoryIds))
      : [];

  const categoryMap = new Map(allCategories.map((cat) => [cat.id, cat]));
  const gameCategoriesMap = new Map<number, typeof allCategories>();

  relations.forEach((rel) => {
    const cat = categoryMap.get(rel.categoryId);
    if (cat) {
      if (!gameCategoriesMap.has(rel.gameId)) {
        gameCategoriesMap.set(rel.gameId, []);
      }
      gameCategoriesMap.get(rel.gameId)!.push(cat);
    }
  });

  const gamesWithCategories = paginatedGames.map((game) => ({
    ...game,
    categories: gameCategoriesMap.get(game.id) || [],
  }));

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

  // Get all category relationships for these games
  const relations = await db
    .select()
    .from(gameCategories)
    .where(inArray(gameCategories.gameId, ids));

  const categoryIds = [...new Set(relations.map((rel) => rel.categoryId))];
  const allCategories =
    categoryIds.length > 0
      ? await db
          .select()
          .from(categories)
          .where(inArray(categories.id, categoryIds))
      : [];

  // Map games with their categories, preserving the order of input IDs
  const gamesMap = new Map(selectedGames.map((game) => [game.id, game]));
  const categoriesMap = new Map(allCategories.map((cat) => [cat.id, cat]));

  return ids
    .map((id) => {
      const game = gamesMap.get(id);
      if (!game) return null;

      const gameRelations = relations.filter((rel) => rel.gameId === game.id);
      const gameCategories = gameRelations
        .map((rel) => categoriesMap.get(rel.categoryId))
        .filter((cat): cat is Category => cat !== undefined);

      return {
        ...game,
        categories: gameCategories,
      };
    })
    .filter((game): game is GameWithCategories => game !== null);
}

/**
 * Get all games from the database
 */
export async function getAllGames(): Promise<GameWithCategories[]> {
  const allGames = await db.select().from(games);

  // Get all game IDs
  const gameIds = allGames.map((game) => game.id);
  if (gameIds.length === 0) {
    return [];
  }

  // Get all category relationships
  const allRelations = await db
    .select()
    .from(gameCategories)
    .where(inArray(gameCategories.gameId, gameIds));

  const allCategoryIds = [
    ...new Set(allRelations.map((rel) => rel.categoryId)),
  ];
  const allCategories =
    allCategoryIds.length > 0
      ? await db
          .select()
          .from(categories)
          .where(inArray(categories.id, allCategoryIds))
      : [];

  const categoryMap = new Map(allCategories.map((cat) => [cat.id, cat]));
  const gameCategoriesMap = new Map<number, typeof allCategories>();

  allRelations.forEach((rel) => {
    const cat = categoryMap.get(rel.categoryId);
    if (cat) {
      if (!gameCategoriesMap.has(rel.gameId)) {
        gameCategoriesMap.set(rel.gameId, []);
      }
      gameCategoriesMap.get(rel.gameId)!.push(cat);
    }
  });

  return allGames.map((game) => ({
    ...game,
    categories: gameCategoriesMap.get(game.id) || [],
  }));
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

  // Get categories for this game
  const relations = await db
    .select()
    .from(gameCategories)
    .where(eq(gameCategories.gameId, id));

  const categoryIds = relations.map((rel) => rel.categoryId);
  const gameCategories_list =
    categoryIds.length > 0
      ? await db
          .select()
          .from(categories)
          .where(inArray(categories.id, categoryIds))
      : [];

  return {
    ...game[0],
    categories: gameCategories_list,
  };
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

  // Get categories for this game
  const relations = await db
    .select()
    .from(gameCategories)
    .where(eq(gameCategories.gameId, game[0].id));

  const categoryIds = relations.map((rel) => rel.categoryId);
  const gameCategories_list =
    categoryIds.length > 0
      ? await db
          .select()
          .from(categories)
          .where(inArray(categories.id, categoryIds))
      : [];

  return {
    ...game[0],
    categories: gameCategories_list,
  };
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

  // Get all categories for these games
  const allRelations = await db
    .select()
    .from(gameCategories)
    .where(inArray(gameCategories.gameId, gameIds));

  const allCategoryIds = [
    ...new Set(allRelations.map((rel) => rel.categoryId)),
  ];
  const allCategories =
    allCategoryIds.length > 0
      ? await db
          .select()
          .from(categories)
          .where(inArray(categories.id, allCategoryIds))
      : [];

  const categoryMap = new Map(allCategories.map((cat) => [cat.id, cat]));
  const gameCategoriesMap = new Map<number, typeof allCategories>();

  allRelations.forEach((rel) => {
    const cat = categoryMap.get(rel.categoryId);
    if (cat) {
      if (!gameCategoriesMap.has(rel.gameId)) {
        gameCategoriesMap.set(rel.gameId, []);
      }
      gameCategoriesMap.get(rel.gameId)!.push(cat);
    }
  });

  return categoryGames.map((game) => ({
    ...game,
    categories: gameCategoriesMap.get(game.id) || [],
  }));
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

  if (searchResults.length === 0) {
    return [];
  }

  const gameIds = searchResults.map((game) => game.id);

  // Get all category relationships
  const allRelations = await db
    .select()
    .from(gameCategories)
    .where(inArray(gameCategories.gameId, gameIds));

  const allCategoryIds = [
    ...new Set(allRelations.map((rel) => rel.categoryId)),
  ];
  const allCategories =
    allCategoryIds.length > 0
      ? await db
          .select()
          .from(categories)
          .where(inArray(categories.id, allCategoryIds))
      : [];

  const categoryMap = new Map(allCategories.map((cat) => [cat.id, cat]));
  const gameCategoriesMap = new Map<number, typeof allCategories>();

  allRelations.forEach((rel) => {
    const cat = categoryMap.get(rel.categoryId);
    if (cat) {
      if (!gameCategoriesMap.has(rel.gameId)) {
        gameCategoriesMap.set(rel.gameId, []);
      }
      gameCategoriesMap.get(rel.gameId)!.push(cat);
    }
  });

  return searchResults.map((game) => ({
    ...game,
    categories: gameCategoriesMap.get(game.id) || [],
  }));
}

/**
 * Get featured games (first N games)
 */
export async function getFeaturedGames(
  limit: number = 10
): Promise<GameWithCategories[]> {
  const featuredGames = await db.select().from(games).limit(limit);

  if (featuredGames.length === 0) {
    return [];
  }

  const gameIds = featuredGames.map((game) => game.id);

  // Get all category relationships
  const allRelations = await db
    .select()
    .from(gameCategories)
    .where(inArray(gameCategories.gameId, gameIds));

  const allCategoryIds = [
    ...new Set(allRelations.map((rel) => rel.categoryId)),
  ];
  const allCategories =
    allCategoryIds.length > 0
      ? await db
          .select()
          .from(categories)
          .where(inArray(categories.id, allCategoryIds))
      : [];

  const categoryMap = new Map(allCategories.map((cat) => [cat.id, cat]));
  const gameCategoriesMap = new Map<number, typeof allCategories>();

  allRelations.forEach((rel) => {
    const cat = categoryMap.get(rel.categoryId);
    if (cat) {
      if (!gameCategoriesMap.has(rel.gameId)) {
        gameCategoriesMap.set(rel.gameId, []);
      }
      gameCategoriesMap.get(rel.gameId)!.push(cat);
    }
  });

  return featuredGames.map((game) => ({
    ...game,
    categories: gameCategoriesMap.get(game.id) || [],
  }));
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

  // Get all category relationships for related games
  const allRelations = await db
    .select()
    .from(gameCategories)
    .where(inArray(gameCategories.gameId, relatedGameIds));

  const allCategoryIds = [
    ...new Set(allRelations.map((rel) => rel.categoryId)),
  ];
  const allCategories =
    allCategoryIds.length > 0
      ? await db
          .select()
          .from(categories)
          .where(inArray(categories.id, allCategoryIds))
      : [];

  const categoryMap = new Map(allCategories.map((cat) => [cat.id, cat]));
  const gameCategoriesMap = new Map<number, typeof allCategories>();

  allRelations.forEach((rel) => {
    const cat = categoryMap.get(rel.categoryId);
    if (cat) {
      if (!gameCategoriesMap.has(rel.gameId)) {
        gameCategoriesMap.set(rel.gameId, []);
      }
      gameCategoriesMap.get(rel.gameId)!.push(cat);
    }
  });

  return relatedGames.map((game) => ({
    ...game,
    categories: gameCategoriesMap.get(game.id) || [],
  }));
}

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<Category[]> {
  return db.select().from(categories);
}
