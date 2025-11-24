"use client";

import { ReactNode } from "react";

export type ActionButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "ghost";

interface ActionButtonProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: ActionButtonVariant;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  title?: string;
  type?: "button" | "submit" | "reset";
}

const variantClasses: Record<ActionButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl",
  secondary:
    "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700",
  success:
    "border border-green-400 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-700 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800",
  danger:
    "border border-red-400 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-700 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800",
  ghost:
    "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800",
};

/**
 * Flexible action button component for consistent styling across the app
 */
export function ActionButton({
  children,
  onClick,
  variant = "secondary",
  icon,
  disabled = false,
  className = "",
  ariaLabel,
  title,
  type = "button",
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all ${
        variantClasses[variant]
      } ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}
      aria-label={ariaLabel}
      title={title}
    >
      {icon && <span className="h-5 w-5">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
