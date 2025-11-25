"use client";

import { Component, type ReactNode } from "react";
import { logger } from "@/shared/lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GameCardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    logger.error("GameCard error", error, { errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="overflow-hidden rounded-lg border border-red-200 bg-red-50 shadow-sm dark:border-red-900 dark:bg-red-950">
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-red-100 dark:bg-red-900">
            <svg
              className="h-12 w-12 text-red-400 dark:text-red-600"
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
          </div>
          <div className="p-4">
            <h3 className="mb-2 text-sm font-semibold text-red-900 dark:text-red-100">
              Failed to load game
            </h3>
            <p className="text-xs text-red-700 dark:text-red-300">
              This game could not be displayed
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
