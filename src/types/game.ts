export type GameCategory =
  | "Action"
  | "Puzzle"
  | "Arcade"
  | "Adventure"
  | "Strategy"
  | "Sports"
  | "Racing"
  | "All";

export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  iframeUrl: string;
  category: GameCategory;
}
