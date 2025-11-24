import Link from "next/link";
import { GameCard } from "@/shared/ui/game-card";
import type { GameWithCategories } from "@/shared/types";

interface RelatedGamesProps {
  games: GameWithCategories[];
}

export function RelatedGames({ games }: RelatedGamesProps) {
  if (games.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Related Games
        </h2>
        <Link
          href="/"
          className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View all games →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
