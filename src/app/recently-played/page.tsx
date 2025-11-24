"use client";

import { useEffect, useState } from "react";
import { GamesList } from "@/modules/games/components";
import { getRecentlyPlayedIds } from "@/shared/lib";
import type { GameWithCategories } from "@/shared/types";

export default function RecentlyPlayedPage() {
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
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Loading recently played...
          </span>
        </div>
      </div>
    );
  }

  return (
    <GamesList
      games={games}
      title="Recently Played"
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        title: "No games played yet",
        description: "Your recently played games will appear here",
        actionLabel: "Browse Games",
        actionHref: "/",
      }}
    />
  );
}
