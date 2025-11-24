import { db } from "@/db/index";
import { games, categories, gameCategories } from "@/db/schema";
import { eq, like, and, ne, inArray } from "drizzle-orm";
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
