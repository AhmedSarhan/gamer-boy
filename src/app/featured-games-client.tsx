"use client";

import { GameCard } from "@/shared/ui/game-card";
import { GameCardErrorBoundary } from "@/shared/ui/game-card/game-card-error-boundary";
import { StaggerContainer, StaggerItem } from "@/shared/ui/stagger-container";
import type { GameWithCategories } from "@/shared/types";

interface FeaturedGamesClientProps {
  games: GameWithCategories[];
}

export function FeaturedGamesClient({ games }: FeaturedGamesClientProps) {
  if (games.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Featured Games
      </h2>
      <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {games.map((game) => (
          <StaggerItem key={game.id}>
            <GameCardErrorBoundary>
              <GameCard game={game} />
            </GameCardErrorBoundary>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
