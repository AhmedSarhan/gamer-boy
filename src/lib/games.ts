import { Game, GameCategory } from "@/types/game";

/**
 * Sample game data structure
 * Replace with actual games from GameDistribution.com
 * Each game should have an iframe URL from GameDistribution
 */
export const games: Game[] = [
  // Add your games here
  // Example structure:
  // {
  //   id: "game-1",
  //   title: "Game Title",
  //   description: "Game description",
  //   thumbnail: "/images/game-thumbnail.jpg",
  //   iframeUrl: "https://html5.gamedistribution.com/[game-id]",
  //   category: "Action",
  // },
];

/**
 * Get all games
 */
export function getAllGames(): Game[] {
  return games;
}

/**
 * Get game by ID
 */
export function getGameById(id: string): Game | undefined {
  return games.find((game) => game.id === id);
}

/**
 * Get games by category
 */
export function getGamesByCategory(category: GameCategory): Game[] {
  if (category === "All") {
    return games;
  }
  return games.filter((game) => game.category === category);
}

/**
 * Search games by title
 */
export function searchGames(query: string): Game[] {
  const lowerQuery = query.toLowerCase();
  return games.filter((game) => game.title.toLowerCase().includes(lowerQuery));
}

/**
 * Get featured/popular games
 */
export function getFeaturedGames(): Game[] {
  // Return first 6 games as featured (replace with actual logic)
  return games.slice(0, 6);
}

/**
 * Get related games (same category, excluding current game)
 */
export function getRelatedGames(
  currentGameId: string,
  limit: number = 4
): Game[] {
  const currentGame = getGameById(currentGameId);
  if (!currentGame) {
    return [];
  }

  return games
    .filter(
      (game) =>
        game.id !== currentGameId && game.category === currentGame.category
    )
    .slice(0, limit);
}
