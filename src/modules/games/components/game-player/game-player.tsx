"use client";

import { useState, useEffect } from "react";
import { logger } from "@/shared/lib/logger";

interface GamePlayerProps {
  gameId: string;
  gameSlug: string;
  title: string;
}

export function GamePlayer({ gameId, gameSlug, title }: GamePlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate iframe URL with proper referrer
  const gamePageUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/games/${gameSlug}`
      : `/games/${gameSlug}`;
  const iframeUrl = `https://html5.gamedistribution.com/${gameId}/?gd_sdk_referrer_url=${encodeURIComponent(gamePageUrl)}`;

  const toggleFullscreen = async () => {
    const container = document.getElementById("game-container");
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      logger.error("Fullscreen error", error as Error);
    }
  };

  // Listen for fullscreen changes with proper cleanup
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div className="w-full">
      {/* Game Container */}
      <div
        id="game-container"
        className="relative mx-auto aspect-video w-full overflow-hidden rounded-lg bg-gray-900 shadow-2xl"
      >
        {/* Loading State */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500" />
              <p className="mt-4 text-sm text-gray-400">Loading game...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <svg
                className="mx-auto h-16 w-16 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-4 text-lg font-semibold text-white">
                Failed to load game
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Please try refreshing the page
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Game Iframe */}
        <iframe
          src={iframeUrl}
          title={title}
          className="h-full w-full"
          allow="autoplay; fullscreen; gamepad; microphone; focus-without-user-activation"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />

        {/* Fullscreen Button */}
        {!isLoading && !hasError && (
          <button
            onClick={toggleFullscreen}
            className="absolute bottom-4 right-4 rounded-lg bg-black/50 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/70"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Tip:</strong> Click the fullscreen button for the best gaming
          experience!
        </p>
      </div>
    </div>
  );
}
