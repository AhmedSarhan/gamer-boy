"use client";

import { use, useSyncExternalStore } from "react";
import { gamesApi } from "@/shared/lib/api-client";
import { getRecentlyPlayedIds } from "@/shared/lib";
import { logger } from "@/shared/lib/logger";
import type { GameWithCategories } from "@/shared/types";

// Cache for the recently played data
let recentlyPlayedCache: {
  promise: Promise<GameWithCategories[]> | null;
  data: GameWithCategories[] | null;
  error: Error | null;
} = {
  promise: null,
  data: null,
  error: null,
};

// Subscribers for cache updates
const subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach((callback) => callback());
}

/**
 * Fetch recently played games
 */
async function fetchRecentlyPlayedGames(): Promise<GameWithCategories[]> {
  const ids = getRecentlyPlayedIds();

  if (ids.length === 0) {
    return [];
  }

  try {
    const data = (await gamesApi.getGamesByIds(ids)) as {
      games: GameWithCategories[];
    };

    // Preserve the order from localStorage (most recent first)
    const orderedGames = ids
      .map((id) => data.games.find((g: GameWithCategories) => g.id === id))
      .filter(Boolean) as GameWithCategories[];

    return orderedGames;
  } catch (error) {
    logger.error("Error fetching recently played", error as Error);
    throw error;
  }
}

/**
 * Get or create the recently played promise
 */
export function getRecentlyPlayedPromise(): Promise<GameWithCategories[]> {
  if (recentlyPlayedCache.data) {
    return Promise.resolve(recentlyPlayedCache.data);
  }

  if (!recentlyPlayedCache.promise) {
    recentlyPlayedCache.promise = fetchRecentlyPlayedGames().then(
      (data) => {
        recentlyPlayedCache.data = data;
        recentlyPlayedCache.error = null;
        recentlyPlayedCache.promise = null;
        notifySubscribers();
        return data;
      },
      (error) => {
        recentlyPlayedCache.error = error;
        recentlyPlayedCache.promise = null;
        notifySubscribers();
        throw error;
      }
    );
  }

  return recentlyPlayedCache.promise;
}

/**
 * Invalidate the recently played cache
 */
export function invalidateRecentlyPlayed() {
  recentlyPlayedCache = {
    promise: null,
    data: null,
    error: null,
  };
  notifySubscribers();
}

/**
 * Subscribe to recently played changes
 */
function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

/**
 * Get the current recently played snapshot
 */
function getSnapshot() {
  return recentlyPlayedCache.data;
}

/**
 * Hook to read recently played data using React's use() hook
 */
export function useRecentlyPlayedData(): GameWithCategories[] {
  // Subscribe to cache updates
  const cachedData = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // If we have cached data, return it immediately
  if (cachedData) {
    return cachedData;
  }

  // Otherwise, use the use() hook to suspend until data is ready
  const promise = getRecentlyPlayedPromise();
  return use(promise);
}
