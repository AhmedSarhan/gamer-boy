"use client";

import { use, useSyncExternalStore } from "react";
import { gamesApi } from "@/shared/lib/api-client";
import { getFavoriteIds } from "@/shared/lib";
import { logger } from "@/shared/lib/logger";
import type { GameWithCategories } from "@/shared/types";

// Cache for the wishlist data
let wishlistCache: {
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
 * Fetch wishlist games
 */
async function fetchWishlistGames(): Promise<GameWithCategories[]> {
  const ids = getFavoriteIds();

  if (ids.length === 0) {
    return [];
  }

  try {
    const data = (await gamesApi.getGamesByIds(ids)) as {
      games: GameWithCategories[];
    };

    // Preserve the order from localStorage
    const orderedGames = ids
      .map((id) => data.games.find((g: GameWithCategories) => g.id === id))
      .filter(Boolean) as GameWithCategories[];

    return orderedGames;
  } catch (error) {
    logger.error("Error fetching favorites", error as Error);
    throw error;
  }
}

/**
 * Get or create the wishlist promise
 */
export function getWishlistPromise(): Promise<GameWithCategories[]> {
  if (wishlistCache.data) {
    return Promise.resolve(wishlistCache.data);
  }

  if (!wishlistCache.promise) {
    wishlistCache.promise = fetchWishlistGames().then(
      (data) => {
        wishlistCache.data = data;
        wishlistCache.error = null;
        wishlistCache.promise = null;
        notifySubscribers();
        return data;
      },
      (error) => {
        wishlistCache.error = error;
        wishlistCache.promise = null;
        notifySubscribers();
        throw error;
      }
    );
  }

  return wishlistCache.promise;
}

/**
 * Invalidate the wishlist cache
 */
export function invalidateWishlist() {
  wishlistCache = {
    promise: null,
    data: null,
    error: null,
  };
  notifySubscribers();
}

/**
 * Subscribe to wishlist changes
 */
function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

/**
 * Get the current wishlist snapshot
 */
function getSnapshot() {
  return wishlistCache.data;
}

/**
 * Hook to read wishlist data using React's use() hook
 */
export function useWishlistData(): GameWithCategories[] {
  // Subscribe to cache updates
  const cachedData = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // If we have cached data, return it immediately
  if (cachedData) {
    return cachedData;
  }

  // Otherwise, use the use() hook to suspend until data is ready
  const promise = getWishlistPromise();
  return use(promise);
}
