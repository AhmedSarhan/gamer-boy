"use client";

import { useEffect } from "react";
import { GamesList } from "@/modules/games/components";
import {
  useRecentlyPlayedData,
  invalidateRecentlyPlayed,
} from "./recently-played-data";
import { EmptyState } from "@/shared/ui/empty-state";
import { ClockIcon } from "@/shared/ui/icons";

export function RecentlyPlayedClient() {
  // Use the use() hook via useRecentlyPlayedData to fetch data
  const games = useRecentlyPlayedData();

  useEffect(() => {
    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        invalidateRecentlyPlayed();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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
