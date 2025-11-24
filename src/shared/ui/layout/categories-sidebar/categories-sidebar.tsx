import { getAllCategories } from "@/modules/games/lib";
import { CategoriesSidebarClient } from "./categories-sidebar-client";

export async function CategoriesSidebar() {
  const categories = await getAllCategories();

  return <CategoriesSidebarClient categories={categories} />;
}
