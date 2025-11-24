import { notFound } from "next/navigation";
import { getGameBySlug, getRelatedGames } from "@/modules/games/lib";
import type { Metadata } from "next";
import { GamePageClient } from "./game-page-client";

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

  const relatedGames = await getRelatedGames(game.id, 4);

  return <GamePageClient game={game} relatedGames={relatedGames} />;
}
