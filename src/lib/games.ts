import { db } from "@/db/index";
import { games, categories, gameCategories } from "@/db/schema";
import { eq, like, and, ne, inArray } from "drizzle-orm";

export interface GameWithCategories {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  gameId: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    createdAt: Date | null;
  }>;
}

/**
 * Generate iframe URL with gd_sdk_referrer_url parameter at runtime
 * This ensures the referrer URL uses the current domain, not a hardcoded one
 */
export function generateIframeUrl(
  gameId: string,
  gameSlug: string,
  baseUrl?: string
): string {
  // Use provided baseUrl or get from environment or window (client-side)
  const gamePageUrl = baseUrl
    ? `${baseUrl}/games/${gameSlug}`
    : typeof window !== "undefined"
      ? `${window.location.origin}/games/${gameSlug}`
      : `/games/${gameSlug}`; // Fallback for server-side without baseUrl

  return `https://html5.gamedistribution.com/${gameId}/?gd_sdk_referrer_url=${encodeURIComponent(gamePageUrl)}`;
}

/**
 * Get all games with their categories
 */
export async function getAllGames(): Promise<GameWithCategories[]> {
  const allGames = await db.select().from(games);

  // Get all game-category relationships
  const allRelations = await db.select().from(gameCategories);
  const allCategories = await db.select().from(categories);

  // Build category map
  const categoryMap = new Map(allCategories.map((cat) => [cat.id, cat]));

  // Build game categories map
  const gameCategoriesMap = new Map<number, typeof allCategories>();
  allRelations.forEach((rel) => {
    const category = categoryMap.get(rel.categoryId);
    if (category) {
      if (!gameCategoriesMap.has(rel.gameId)) {
        gameCategoriesMap.set(rel.gameId, []);
      }
      gameCategoriesMap.get(rel.gameId)!.push(category);
    }
  });

  // Combine games with their categories
  return allGames.map((game) => ({
    ...game,
    categories: gameCategoriesMap.get(game.id) || [],
  }));
}

/**
 * Get game by ID with categories
 */
export async function getGameById(
  id: number
): Promise<GameWithCategories | undefined> {
  const game = await db.select().from(games).where(eq(games.id, id)).limit(1);

  if (game.length === 0) {
    return undefined;
  }

  // Get categories for this game
  const relations = await db
    .select()
    .from(gameCategories)
    .where(eq(gameCategories.gameId, id));

  const categoryIds = relations.map((rel) => rel.categoryId);
  const gameCategoriesList =
    categoryIds.length > 0
      ? await db
          .select()
          .from(categories)
          .where(inArray(categories.id, categoryIds))
      : [];

  return {
    ...game[0],
    categories: gameCategoriesList,
  };
}

/**
 * Get game by slug with categories
 */
export async function getGameBySlug(
  slug: string
): Promise<GameWithCategories | undefined> {
  const game = await db
    .select()
    .from(games)
    .where(eq(games.slug, slug))
    .limit(1);

  if (game.length === 0) {
    return undefined;
  }

  // Get categories for this game
  const relations = await db
    .select()
    .from(gameCategories)
    .where(eq(gameCategories.gameId, game[0].id));

  const categoryIds = relations.map((rel) => rel.categoryId);
  const gameCategoriesList =
    categoryIds.length > 0
      ? await db
          .select()
          .from(categories)
          .where(inArray(categories.id, categoryIds))
      : [];

  return {
    ...game[0],
    categories: gameCategoriesList,
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
  const lowerQuery = `%${query.toLowerCase()}%`;
  const results = await db
    .select()
    .from(games)
    .where(like(games.title, lowerQuery));

  if (results.length === 0) {
    return [];
  }

  const gameIds = results.map((game) => game.id);
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

  return results.map((game) => ({
    ...game,
    categories: gameCategoriesMap.get(game.id) || [],
  }));
}

/**
 * Get featured/popular games (first 6 games)
 */
export async function getFeaturedGames(): Promise<GameWithCategories[]> {
  const featured = await db.select().from(games).limit(6);

  if (featured.length === 0) {
    return [];
  }

  const gameIds = featured.map((game) => game.id);
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

  return featured.map((game) => ({
    ...game,
    categories: gameCategoriesMap.get(game.id) || [],
  }));
}

/**
 * Get related games (same categories, excluding current game)
 */
export async function getRelatedGames(
  currentGameId: number,
  limit: number = 4
): Promise<GameWithCategories[]> {
  const currentGame = await getGameById(currentGameId);
  if (!currentGame || currentGame.categories.length === 0) {
    return [];
  }

  // Get all games that share at least one category with current game
  const categoryIds = currentGame.categories.map((cat) => cat.id);
  const relations = await db
    .select()
    .from(gameCategories)
    .where(
      and(
        inArray(gameCategories.categoryId, categoryIds),
        ne(gameCategories.gameId, currentGameId)
      )
    );

  // Count how many categories each game shares
  const gameCategoryCounts = new Map<number, number>();
  relations.forEach((rel) => {
    gameCategoryCounts.set(
      rel.gameId,
      (gameCategoryCounts.get(rel.gameId) || 0) + 1
    );
  });

  // Sort by number of shared categories and get top games
  const sortedGameIds = Array.from(gameCategoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([gameId]) => gameId);

  if (sortedGameIds.length === 0) {
    return [];
  }

  const relatedGames = await db
    .select()
    .from(games)
    .where(inArray(games.id, sortedGameIds));

  // Get categories for related games
  const allRelations = await db
    .select()
    .from(gameCategories)
    .where(inArray(gameCategories.gameId, sortedGameIds));

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
export async function getAllCategories() {
  return await db.select().from(categories);
}
