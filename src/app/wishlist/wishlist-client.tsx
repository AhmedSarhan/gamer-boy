"use client";

import { useEffect, useState } from "react";
import { GamesList } from "@/modules/games/components";
import { getFavoriteIds } from "@/shared/lib";
import { SpinnerFullPage } from "@/shared/ui/spinner";
import { EmptyState } from "@/shared/ui/empty-state";
import { HeartIcon } from "@/shared/ui/icons";
import type { GameWithCategories } from "@/shared/types";

export function WishlistClient() {
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
    return <SpinnerFullPage label="Loading favorites..." />;
  }

  if (games.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={<HeartIcon className="mx-auto h-16 w-16 text-gray-400" />}
          title="No favorites yet"
          description="Start adding games to your wishlist by clicking the heart icon on game cards"
          actionLabel="Browse Games"
          actionHref="/"
        />
      </div>
    );
  }

  return <GamesList games={games} title="My Wishlist" />;
}
