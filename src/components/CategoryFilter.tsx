"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/games";

interface CategoryFilterProps {
  categories: Category[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategories = searchParams.get("categories")?.split(",") || [];

  const toggleCategory = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    let currentCategories = params.get("categories")?.split(",") || [];

    if (currentCategories.includes(categorySlug)) {
      currentCategories = currentCategories.filter((c) => c !== categorySlug);
    } else {
      currentCategories.push(categorySlug);
    }

    if (currentCategories.length > 0 && currentCategories[0] !== "") {
      params.set("categories", currentCategories.join(","));
    } else {
      params.delete("categories");
    }

    router.push(`/?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("categories");
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Categories
        </h2>
        {selectedCategories.length > 0 && selectedCategories[0] !== "" && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.slug);
          return (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.slug)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isSelected
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
