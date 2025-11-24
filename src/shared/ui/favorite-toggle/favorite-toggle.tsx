"use client";

import { useState, useEffect } from "react";
import { addFavorite, removeFavorite, isFavorite } from "@/shared/lib";

interface FavoriteToggleProps {
  gameId: number;
  size?: "sm" | "md" | "lg";
}

/**
 * Compact favorite toggle button for overlaying on cards
 */
export function FavoriteToggle({ gameId, size = "md" }: FavoriteToggleProps) {
  const [isFav, setIsFav] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Check favorite status after component mounts (client-side only)
  // This prevents hydration mismatch by only checking localStorage after mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    setIsFav(isFavorite(gameId));
  }, [gameId]);

  const toggleFavorite = (e: React.MouseEvent) => {
    // Prevent navigation to game detail page
    e.preventDefault();
    e.stopPropagation();

    if (isFav) {
      removeFavorite(gameId);
      setIsFav(false);
    } else {
      addFavorite(gameId);
      setIsFav(true);
      // Trigger animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <button
        className={`${sizeClasses[size]} cursor-pointer flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-all hover:scale-110 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400`}
        aria-label="Add to wishlist"
        title="Add to wishlist"
        disabled
      >
        <svg
          className={`${iconSizeClasses[size]} fill-none`}
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={toggleFavorite}
      className={`${sizeClasses[size]} cursor-pointer flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-all hover:scale-110 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 ${
        isFav ? "text-red-500" : "text-gray-600 dark:text-gray-400"
      }`}
      aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
      title={isFav ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        className={`${iconSizeClasses[size]} transition-transform ${isAnimating ? "animate-bounce" : ""} ${
          isFav ? "fill-current" : "fill-none"
        }`}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
