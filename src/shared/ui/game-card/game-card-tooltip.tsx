"use client";

import { useState } from "react";
import type { GameWithCategories } from "@/shared/types";

interface GameCardTooltipProps {
  game: GameWithCategories;
  children: React.ReactNode;
}

export function GameCardTooltip({ game, children }: GameCardTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative"
      >
        {children}
      </div>

      {/* Tooltip Portal */}
      {isVisible && (
        <div
          className="pointer-events-none fixed z-100 -translate-x-1/2 -translate-y-full"
          style={{
            left: `${position.x}px`,
            top: `${position.y - 12}px`,
          }}
        >
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 mb-2 max-w-xs rounded-lg border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            {/* Arrow */}
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />

            {/* Content */}
            <div className="relative">
              <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {game.title}
              </h3>
              <p className="mb-2 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                {game.description}
              </p>

              {/* Categories */}
              {game.categories && game.categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {game.categories.slice(0, 3).map((category) => (
                    <span
                      key={category.id}
                      className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {category.name}
                    </span>
                  ))}
                  {game.categories.length > 3 && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                      +{game.categories.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
