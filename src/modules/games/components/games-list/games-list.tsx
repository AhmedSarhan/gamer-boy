import Link from "next/link";
import { GameCard } from "@/shared/ui/game-card";
import { GameCardErrorBoundary } from "@/shared/ui/game-card/game-card-error-boundary";
import { LAYOUT } from "@/shared/constants";
import type { GameWithCategories } from "@/shared/types";

interface GamesListProps {
  games: GameWithCategories[];
  title: string;
  emptyState?: {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
  };
}

export function GamesList({ games, title, emptyState }: GamesListProps) {
  if (games.length === 0 && emptyState) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            {emptyState.icon}
            <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              {emptyState.title}
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {emptyState.description}
            </p>
            {emptyState.actionLabel && emptyState.actionHref && (
              <Link
                href={emptyState.actionHref}
                className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
              >
                {emptyState.actionLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
        {games.length > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {games.length} {games.length === 1 ? "game" : "games"}
          </p>
        )}
      </div>

      <div className={LAYOUT.GAMES_GRID_CLASSES}>
        {games.map((game) => (
          <GameCardErrorBoundary key={game.id}>
            <GameCard game={game} />
          </GameCardErrorBoundary>
        ))}
      </div>
    </div>
  );
}
