import { getAllCategories } from "@/modules/games/lib";
import { CategoriesSidebarClient } from "./categories-sidebar-client";
import { Category } from "@/shared/types";

export async function CategoriesSidebar() {
  let categories: Category[] = [];
  try {
    categories = await getAllCategories();
  } catch (error) {
    // During build time, database might not be initialized
    // Return empty array to allow build to succeed
    console.warn("Failed to load categories:", error);
    categories = [];
  }

  return <CategoriesSidebarClient categories={categories} />;
}
