"use client";

import { useEffect, useState } from "react";
import type { GameWithCategories } from "@/shared/types";
import { GameCard } from "./game-card";
import { RatingDisplay } from "../rating-display";

interface GameCardWithRatingProps {
  game: GameWithCategories;
}

interface RatingStats {
  averageRating: number;
  totalRatings: number;
}

/**
 * Game card with rating display overlay
 */
export function GameCardWithRating({ game }: GameCardWithRatingProps) {
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await fetch(`/api/ratings/${game.id}`);
        if (response.ok) {
          const data = await response.json();
          setRatingStats({
            averageRating: data.averageRating,
            totalRatings: data.totalRatings,
          });
        }
      } catch (error) {
        console.error("Error fetching rating:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRating();
  }, [game.id]);

  return (
    <div className="relative h-full">
      <GameCard game={game} />
      {/* Rating overlay - bottom left */}
      {!isLoading && ratingStats && ratingStats.totalRatings > 0 && (
        <div className="pointer-events-none absolute bottom-20 left-2 rounded-lg bg-white/90 px-2 py-1 shadow-md backdrop-blur-sm dark:bg-gray-900/90">
          <RatingDisplay
            averageRating={ratingStats.averageRating}
            totalRatings={ratingStats.totalRatings}
            size="sm"
            showCount={false}
          />
        </div>
      )}
    </div>
  );
}
