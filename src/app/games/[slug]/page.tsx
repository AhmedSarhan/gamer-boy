import { notFound } from "next/navigation";
import Link from "next/link";
import {
  GamePlayer,
  RelatedGames,
  GameActions,
} from "@/modules/games/components";
import { getGameBySlug, getRelatedGames } from "@/modules/games/lib";
import type { Metadata } from "next";

interface GamePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: GamePageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    return {
      title: "Game Not Found",
    };
  }

  return {
    title: `${game.title} - Play Free Online | GamerBoy`,
    description: game.description,
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  // Get related games based on categories
  const relatedGames = await getRelatedGames(game.id, 4);

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

      {/* Game Actions (Share & Open in New Tab) */}
      <GameActions
        gameId={game.gameId}
        gameSlug={game.slug}
        gameTitle={game.title}
      />

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
