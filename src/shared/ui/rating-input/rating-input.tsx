"use client";

import { useState } from "react";

interface RatingInputProps {
  gameId: number;
  initialRating?: number;
  onRatingSubmit?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

/**
 * Interactive rating input component (allows users to rate)
 */
export function RatingInput({
  gameId,
  initialRating = 0,
  onRatingSubmit,
  size = "md",
}: RatingInputProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const handleClick = async (value: number) => {
    if (isSubmitting) return;

    setRating(value);
    setIsSubmitting(true);

    try {
      const { getUserFingerprint } = await import("@/shared/lib");
      const fingerprint = getUserFingerprint();

      const response = await fetch(`/api/ratings/${gameId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: value,
          fingerprint,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onRatingSubmit?.(data.averageRating);
      } else {
        console.error("Failed to submit rating");
        // Revert on error
        setRating(initialRating);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      setRating(initialRating);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => handleClick(value)}
            onMouseEnter={() => setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
            disabled={isSubmitting}
            className="cursor-pointer transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Rate ${value} stars`}
          >
            <svg
              className={`${sizeClasses[size]} ${
                value <= displayRating
                  ? "text-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              } transition-colors`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
      {rating > 0 && (
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {isSubmitting
            ? "Submitting..."
            : `You rated this game ${rating} star${rating !== 1 ? "s" : ""}`}
        </p>
      )}
    </div>
  );
}
