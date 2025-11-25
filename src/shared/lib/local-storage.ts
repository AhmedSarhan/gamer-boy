/**
 * Utilities for managing favorites and recently played games in localStorage
 * Stores only game IDs for efficiency - full game data is fetched from DB when needed
 */

import { logger } from "./logger";

const FAVORITES_KEY = "gamerboy_favorites";
const RECENTLY_PLAYED_KEY = "gamerboy_recently_played";
const MAX_RECENTLY_PLAYED = 20;

interface RecentlyPlayedItem {
  id: number;
  timestamp: number;
}

// --- Favorites (Store IDs only) ---
export function getFavoriteIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addFavorite(gameId: number): void {
  if (typeof window === "undefined") return;
  const favorites = getFavoriteIds();
  if (!favorites.includes(gameId)) {
    favorites.push(gameId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

export function removeFavorite(gameId: number): void {
  if (typeof window === "undefined") return;
  const favorites = getFavoriteIds().filter((id) => id !== gameId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function isFavorite(gameId: number): boolean {
  return getFavoriteIds().includes(gameId);
}

// --- Recently Played (Store IDs with timestamps) ---
export function getRecentlyPlayedIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENTLY_PLAYED_KEY);
    const items: RecentlyPlayedItem[] = stored ? JSON.parse(stored) : [];
    // Sort by timestamp (most recent first) and return only IDs
    return items
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((item) => item.id);
  } catch {
    return [];
  }
}

export function addRecentlyPlayed(gameId: number): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(RECENTLY_PLAYED_KEY);
    let items: RecentlyPlayedItem[] = stored ? JSON.parse(stored) : [];

    // Remove if already exists
    items = items.filter((item) => item.id !== gameId);

    // Add to beginning with new timestamp
    items.unshift({ id: gameId, timestamp: Date.now() });

    // Keep only the most recent MAX_RECENTLY_PLAYED games
    if (items.length > MAX_RECENTLY_PLAYED) {
      items = items.slice(0, MAX_RECENTLY_PLAYED);
    }

    localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(items));
  } catch (error) {
    logger.error("Error adding to recently played", error as Error);
  }
}
