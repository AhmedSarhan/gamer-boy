export type GameCategory =
  | "Action"
  | "Puzzle"
  | "Arcade"
  | "Adventure"
  | "Strategy"
  | "Sports"
  | "Racing"
  | "All";

export interface Category {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface GameWithCategories {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  gameId: string;
  createdAt: Date;
  updatedAt: Date;
  categories: Category[];
}
