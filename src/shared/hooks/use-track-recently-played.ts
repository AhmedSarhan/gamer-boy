import { useEffect } from "react";
import { addRecentlyPlayed } from "@/shared/lib";

/**
 * Custom hook to track when a game is viewed/played
 * Automatically adds the game to recently played list on mount
 */
export function useTrackRecentlyPlayed(gameId: number) {
  useEffect(() => {
    // Add game ID to recently played when component mounts
    addRecentlyPlayed(gameId);
  }, [gameId]);
}
