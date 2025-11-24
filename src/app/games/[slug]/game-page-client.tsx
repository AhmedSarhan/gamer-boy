"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  GamePlayer,
  RelatedGames,
  GameActions,
} from "@/modules/games/components";
import { useTrackRecentlyPlayed } from "@/shared/hooks";
import { RatingDisplay } from "@/shared/ui/rating-display";
import { RatingInput } from "@/shared/ui/rating-input";
import type { GameWithCategories } from "@/shared/types";

interface GamePageClientProps {
  game: GameWithCategories;
  relatedGames: GameWithCategories[];
}

export function GamePageClient({ game, relatedGames }: GamePageClientProps) {
  // Track this game as recently played
  useTrackRecentlyPlayed(game.id);

  // Rating state
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    userRating: null as number | null,
  });
  const [isLoadingRating, setIsLoadingRating] = useState(true);

  // Fetch rating stats
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const { getUserFingerprint } = await import("@/shared/lib");
        const fingerprint = getUserFingerprint();

        const response = await fetch(
          `/api/ratings/${game.id}?fingerprint=${fingerprint}`
        );
        if (response.ok) {
          const data = await response.json();
          setRatingStats({
            averageRating: data.averageRating,
            totalRatings: data.totalRatings,
            userRating: data.userRating,
          });
        }
      } catch (error) {
        console.error("Error fetching rating:", error);
      } finally {
        setIsLoadingRating(false);
      }
    };

    fetchRating();
  }, [game.id]);

  const handleRatingUpdate = (newAverage: number) => {
    setRatingStats((prev) => ({
      ...prev,
      averageRating: newAverage,
      totalRatings: prev.totalRatings + (prev.userRating ? 0 : 1),
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to games
      </Link>

      {/* Game Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl dark:text-gray-100">
          {game.title}
        </h1>
      </div>

      {/* Game Player */}
      <GamePlayer
        gameId={game.gameId}
        gameSlug={game.slug}
        title={game.title}
      />

      {/* Game Actions (Share, Open in New Tab, Favorite) */}
      <div className="mt-6 flex flex-wrap gap-3">
        <GameActions
          gameId={game.gameId}
          gameDbId={game.id}
          gameSlug={game.slug}
          gameTitle={game.title}
        />
      </div>

      {/* Rating Section */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
          Rate this game
        </h3>
        {isLoadingRating ? (
          <div className="flex items-center gap-2">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Average Rating Display */}
            <div>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                Average Rating
              </p>
              <RatingDisplay
                averageRating={ratingStats.averageRating}
                totalRatings={ratingStats.totalRatings}
                size="lg"
                showCount={true}
              />
            </div>

            {/* User Rating Input */}
            <div>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                Your Rating
              </p>
              <RatingInput
                gameId={game.id}
                initialRating={ratingStats.userRating || 0}
                onRatingSubmit={handleRatingUpdate}
                size="lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* Categories */}
      {game.categories && game.categories.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {game.categories.map((category) => (
              <Link
                key={category.id}
                href={`/?categories=${category.slug}`}
                className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 transition-all hover:bg-blue-200 hover:shadow-md dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Game Description */}
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          About this game
        </h2>
        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          {game.description}
        </p>
      </div>

      {/* Related Games */}
      <RelatedGames games={relatedGames} />
    </div>
  );
}
