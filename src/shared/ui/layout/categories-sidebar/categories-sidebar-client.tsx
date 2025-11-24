"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Category } from "@/shared/types";

interface CategoriesSidebarClientProps {
  categories: Category[];
}

export function CategoriesSidebarClient({
  categories,
}: CategoriesSidebarClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategories = searchParams.get("categories")?.split(",") || [];

  const toggleSidebar = () => setIsOpen(!isOpen);

  const toggleCategory = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentCategories = params.get("categories")?.split(",") || [];

    let newCategories: string[];
    if (currentCategories.includes(categorySlug)) {
      // Remove category
      newCategories = currentCategories.filter((c) => c !== categorySlug);
    } else {
      // Add category
      newCategories = [...currentCategories, categorySlug];
    }

    if (newCategories.length > 0) {
      params.set("categories", newCategories.join(","));
    } else {
      params.delete("categories");
    }

    // Keep search query if it exists
    const searchQuery = params.get("q");
    if (searchQuery) {
      params.set("q", searchQuery);
    }

    router.replace(`/?${params.toString()}`, { scroll: false });
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-4 left-4 z-40 rounded-full bg-blue-600 p-4 text-white shadow-lg transition-all hover:bg-blue-700 lg:hidden"
        aria-label="Toggle categories sidebar"
      >
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
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 w-64 transform border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Categories
            </h2>
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden dark:hover:bg-gray-800 dark:hover:text-white"
              aria-label="Close sidebar"
            >
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
            </button>
          </div>

          {/* Categories List */}
          <nav className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            <ul className="space-y-1">
              {/* All Games */}
              <li>
                <Link
                  href="/"
                  className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    selectedCategories.length === 0
                      ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center justify-between">
                    <span>All Games</span>
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </div>
                </Link>
              </li>

              {/* Category Items */}
              {categories.map((category) => {
                const isActive = selectedCategories.includes(category.slug);
                return (
                  <li key={category.id}>
                    <button
                      onClick={() => toggleCategory(category.slug)}
                      className={`block w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{category.name}</span>
                        {isActive && (
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer Info */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {categories.length} categories available
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
