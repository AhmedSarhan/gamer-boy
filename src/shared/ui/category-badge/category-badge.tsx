import Link from "next/link";
import type { Category } from "@/shared/types";

interface CategoryBadgeProps {
  category: Category;
  variant?: "default" | "compact";
}

export function CategoryBadge({
  category,
  variant = "default",
}: CategoryBadgeProps) {
  const baseClasses =
    "inline-flex items-center rounded-full bg-blue-100 font-medium text-blue-800 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800";

  const sizeClasses =
    variant === "compact" ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm";

  return (
    <Link
      href={`/?categories=${category.slug}`}
      className={`${baseClasses} ${sizeClasses}`}
    >
      {category.name}
    </Link>
  );
}

interface CategoryBadgeListProps {
  categories: Category[];
  maxDisplay?: number;
  variant?: "default" | "compact";
}

export function CategoryBadgeList({
  categories,
  maxDisplay = 3,
  variant = "default",
}: CategoryBadgeListProps) {
  const displayCategories = categories.slice(0, maxDisplay);
  const remainingCount = categories.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-2">
      {displayCategories.map((category) => (
        <CategoryBadge
          key={category.id}
          category={category}
          variant={variant}
        />
      ))}
      {remainingCount > 0 && (
        <span
          className={`inline-flex items-center rounded-full bg-gray-100 font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400 ${variant === "compact" ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm"}`}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
