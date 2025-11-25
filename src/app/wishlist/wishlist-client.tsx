"use client";

import { useEffect } from "react";
import { GamesList } from "@/modules/games/components";
import { useWishlistData, invalidateWishlist } from "./wishlist-data";
import { EmptyState } from "@/shared/ui/empty-state";
import { HeartIcon } from "@/shared/ui/icons";

export function WishlistClient() {
  // Use the use() hook via useWishlistData to fetch data
  const games = useWishlistData();

  useEffect(() => {
    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        invalidateWishlist();
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
