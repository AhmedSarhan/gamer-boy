import { Suspense } from "react";
import {
  GameCard,
  GameCardErrorBoundary,
  SearchBar,
  CategoryFilter,
} from "@/shared/ui";
import {
  getAllGames,
  searchGames,
  getGamesByCategory,
  getAllCategories,
  getFeaturedGames,
} from "@/modules/games/lib";

interface HomePageProps {
  searchParams: Promise<{ q?: string; categories?: string }>;
}

async function GameGrid({
  searchQuery,
  categoryFilter,
}: {
  searchQuery?: string;
  categoryFilter?: string;
}) {
  let games;

  // Handle search + category filter combination
  if (searchQuery && categoryFilter) {
    // First get games by category, then filter by search
    const categoryArray = categoryFilter.split(",").filter(Boolean);
    const categoryGames = await getGamesByCategory(categoryArray);
    games = categoryGames.filter((game) =>
      game.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  } else if (searchQuery) {
    games = await searchGames(searchQuery);
  } else if (categoryFilter) {
    const categoryArray = categoryFilter.split(",").filter(Boolean);
    games = await getGamesByCategory(categoryArray);
  } else {
    games = await getAllGames();
  }

  if (games.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {games.map((game) => (
        <GameCardErrorBoundary key={game.id}>
          <GameCard game={game} />
        </GameCardErrorBoundary>
      ))}
    </div>
  );
}

function GameGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="aspect-4/3 w-full animate-pulse bg-gray-200 dark:bg-gray-800" />
          <div className="p-4">
            <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mb-3 h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="flex gap-2">
              <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function FeaturedGames() {
  const featured = await getFeaturedGames(4);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Featured Games
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((game) => (
          <GameCardErrorBoundary key={game.id}>
            <GameCard game={game} />
          </GameCardErrorBoundary>
        ))}
      </div>
    </section>
  );
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const searchQuery = params.q;
  const categoryFilter = params.categories;
  const categories = await getAllCategories();

  const showFeatured = !searchQuery && !categoryFilter;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-gray-100">
          Play Free Online Games
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Discover thousands of exciting games across all genres. No downloads,
          no registration - just pure fun!
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 flex justify-center">
        <Suspense fallback={<div className="h-12 w-full max-w-xl" />}>
          <SearchBar />
        </Suspense>
      </div>

      {/* Category Filter */}
      <div className="mb-12">
        <Suspense
          fallback={
            <div className="h-20 w-full animate-pulse bg-gray-200 dark:bg-gray-800" />
          }
        >
          <CategoryFilter categories={categories} />
        </Suspense>
      </div>

      {/* Featured Games */}
      {showFeatured && (
        <Suspense fallback={<GameGridSkeleton />}>
          <FeaturedGames />
        </Suspense>
      )}

      {/* All Games Grid */}
      <section>
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          {searchQuery
            ? `Search Results for "${searchQuery}"`
            : categoryFilter
              ? "Filtered Games"
              : "All Games"}
        </h2>
        <Suspense fallback={<GameGridSkeleton />}>
          <GameGrid searchQuery={searchQuery} categoryFilter={categoryFilter} />
        </Suspense>
      </section>
    </div>
  );
}
