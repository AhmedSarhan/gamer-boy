import { Suspense } from "react";
import { SearchBar, CategoryFilter } from "@/shared/ui";
import {
  getAllGames,
  searchGames,
  getGamesByCategory,
  getAllCategories,
  getFeaturedGames,
} from "@/modules/games/lib";
import { GamesGridInfinite } from "./games-grid-infinite";
import { FeaturedGamesClient } from "./featured-games-client";

interface HomePageProps {
  searchParams: Promise<{ q?: string; categories?: string }>;
}

const INITIAL_GAMES_LIMIT = 12;

async function GameGrid({
  searchQuery,
  categoryFilter,
}: {
  searchQuery?: string;
  categoryFilter?: string;
}) {
  let allGames;

  // Handle search + category filter combination
  if (searchQuery && categoryFilter) {
    // First get games by category, then filter by search
    const categoryArray = categoryFilter.split(",").filter(Boolean);
    const categoryGames = await getGamesByCategory(categoryArray);
    allGames = categoryGames.filter((game) =>
      game.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  } else if (searchQuery) {
    allGames = await searchGames(searchQuery);
  } else if (categoryFilter) {
    const categoryArray = categoryFilter.split(",").filter(Boolean);
    allGames = await getGamesByCategory(categoryArray);
  } else {
    allGames = await getAllGames();
  }

  // Get initial batch of games for SSR
  const initialGames = allGames.slice(0, INITIAL_GAMES_LIMIT);

  return (
    <GamesGridInfinite
      initialGames={initialGames}
      searchQuery={searchQuery}
      categoryFilter={categoryFilter}
    />
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
  return <FeaturedGamesClient games={featured} />;
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
