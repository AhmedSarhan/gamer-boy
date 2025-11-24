"use client";

import { useEffect, useState } from "react";
import { GamesList } from "@/modules/games/components";
import { getFavoriteIds } from "@/shared/lib";
import type { GameWithCategories } from "@/shared/types";

export default function WishlistPage() {
  const [games, setGames] = useState<GameWithCategories[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);
      const ids = getFavoriteIds();

      if (ids.length === 0) {
        setGames([]);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/games/by-ids?ids=${ids.join(",")}`);
        const data = await response.json();

        // Preserve the order from localStorage
        const orderedGames = ids
          .map((id) => data.games.find((g: GameWithCategories) => g.id === id))
          .filter(Boolean) as GameWithCategories[];

        setGames(orderedGames);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setGames([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();

    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchFavorites();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Loading favorites...
          </span>
        </div>
      </div>
    );
  }

  return (
    <GamesList
      games={games}
      title="My Wishlist"
      emptyState={{
        icon: (
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        ),
        title: "No favorites yet",
        description:
          "Start adding games to your wishlist by clicking the heart icon on game cards",
        actionLabel: "Browse Games",
        actionHref: "/",
      }}
    />
  );
}
