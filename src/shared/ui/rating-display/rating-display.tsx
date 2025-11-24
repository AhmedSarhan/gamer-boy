"use client";

interface RatingDisplayProps {
  averageRating: number;
  totalRatings: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

/**
 * Display average rating with stars (read-only)
 */
export function RatingDisplay({
  averageRating,
  totalRatings,
  size = "md",
  showCount = true,
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const fillPercentage = Math.min(Math.max(averageRating - (i - 1), 0), 1);

      stars.push(
        <div key={i} className="relative">
          {/* Empty star (background) */}
          <svg
            className={`${sizeClasses[size]} text-gray-300 dark:text-gray-600`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>

          {/* Filled star (overlay) */}
          {fillPercentage > 0 && (
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercentage * 100}%` }}
            >
              <svg
                className={`${sizeClasses[size]} text-yellow-400`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          )}
        </div>
      );
    }
    return stars;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">{renderStars()}</div>
      {showCount && (
        <span
          className={`${textSizeClasses[size]} font-medium text-gray-700 dark:text-gray-300`}
        >
          {averageRating > 0 ? averageRating.toFixed(1) : "No ratings"}
          {totalRatings > 0 && (
            <span className="ml-1 text-gray-500 dark:text-gray-400">
              ({totalRatings})
            </span>
          )}
        </span>
      )}
    </div>
  );
}
