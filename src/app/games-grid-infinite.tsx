"use client";

import { useTransition, useEffect } from "react";
import { InfiniteScroll } from "@/shared/ui/infinite-scroll";
import { GameCard } from "@/shared/ui/game-card";
import { GameCardErrorBoundary } from "@/shared/ui/game-card/game-card-error-boundary";
import type { GameWithCategories } from "@/shared/types";

interface GamesGridInfiniteProps {
  initialGames: GameWithCategories[];
  searchQuery?: string;
  categoryFilter?: string;
}

export function GamesGridInfinite({
  initialGames,
  searchQuery,
  categoryFilter,
}: GamesGridInfiniteProps) {
  const [isPending, startTransition] = useTransition();

  // Trigger transition when filters change to show loading state
  useEffect(() => {
    startTransition(() => {
      // Empty transition just to trigger isPending state
    });
  }, [searchQuery, categoryFilter]);
  const fetchMoreGames = async (page: number) => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", "12");

    if (searchQuery) {
      params.set("q", searchQuery);
    }
    if (categoryFilter) {
      params.set("categories", categoryFilter);
    }

    const response = await fetch(`/api/games?${params.toString()}`);
    const data = await response.json();

    return {
      items: data.games || [],
      hasMore: data.pagination?.hasMore || false,
    };
  };

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isPending && (
        <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/50 pt-8 backdrop-blur-sm dark:bg-gray-950/50">
          <div className="flex items-center gap-3 rounded-lg bg-white px-6 py-3 shadow-lg dark:bg-gray-800">
            <svg
              className="h-5 w-5 animate-spin text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Loading games...
            </span>
          </div>
        </div>
      )}

      <InfiniteScroll
        initialItems={initialGames}
        fetchMore={fetchMoreGames}
        emptyState={
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                No games found
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        }
      >
        {(games) => (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {games.map((game) => (
              <GameCardErrorBoundary key={game.id}>
                <GameCard game={game} />
              </GameCardErrorBoundary>
            ))}
          </div>
        )}
      </InfiniteScroll>
    </div>
  );
}
