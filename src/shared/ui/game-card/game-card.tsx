"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { GameWithCategories } from "@/shared/types";
import { FavoriteToggle } from "../favorite-toggle/favorite-toggle";
import { GameCardTooltip } from "./game-card-tooltip";

interface GameCardProps {
  game: GameWithCategories;
}

export function GameCard({ game }: GameCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <GameCardTooltip game={game}>
      <Link
        href={`/games/${game.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          {/* Favorite Toggle Button - Top Right Corner */}
          <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <FavoriteToggle gameId={game.id} size="md" />
          </div>
          {imageError ? (
            <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700">
              <svg
                className="h-16 w-16 text-gray-400 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          ) : (
            <Image
              src={game.thumbnail}
              alt={game.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-1 dark:text-gray-100">
            {game.title}
          </h3>
          <p className="mb-3 text-sm text-gray-600 line-clamp-2 dark:text-gray-400">
            {game.description}
          </p>
          {/* Categories - always render container for consistent height */}
          <div className="mt-auto flex min-h-[24px] flex-wrap gap-2">
            {game.categories && game.categories.length > 0 ? (
              <>
                {game.categories.slice(0, 3).map((category) => (
                  <span
                    key={category.id}
                    className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {category.name}
                  </span>
                ))}
                {game.categories.length > 3 && (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    +{game.categories.length - 3}
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-400 dark:text-gray-600">
                Uncategorized
              </span>
            )}
          </div>
        </div>
      </Link>
    </GameCardTooltip>
  );
}
