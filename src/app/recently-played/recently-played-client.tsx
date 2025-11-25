"use client";

import { useEffect, useState } from "react";
import { GamesList } from "@/modules/games/components";
import { getRecentlyPlayedIds } from "@/shared/lib";
import { SpinnerFullPage } from "@/shared/ui/spinner";
import { EmptyState } from "@/shared/ui/empty-state";
import { ClockIcon } from "@/shared/ui/icons";
import type { GameWithCategories } from "@/shared/types";

export function RecentlyPlayedClient() {
  const [games, setGames] = useState<GameWithCategories[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      setIsLoading(true);
      const ids = getRecentlyPlayedIds();

      if (ids.length === 0) {
        setGames([]);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/games/by-ids?ids=${ids.join(",")}`);
        const data = await response.json();

        // Preserve the order from localStorage (most recent first)
        const orderedGames = ids
          .map((id) => data.games.find((g: GameWithCategories) => g.id === id))
          .filter(Boolean) as GameWithCategories[];

        setGames(orderedGames);
      } catch (error) {
        console.error("Error fetching recently played:", error);
        setGames([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentlyPlayed();

    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchRecentlyPlayed();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (isLoading) {
    return <SpinnerFullPage label="Loading recently played..." />;
  }

  if (games.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={<ClockIcon className="mx-auto h-16 w-16 text-gray-400" />}
          title="No games played yet"
          description="Your recently played games will appear here"
          actionLabel="Browse Games"
          actionHref="/"
        />
      </div>
    );
  }

  return <GamesList games={games} title="Recently Played" />;
}
