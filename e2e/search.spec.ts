import { test, expect } from "@playwright/test";

test.describe("Search Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display search bar", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();
  });

  test("should filter games by search query", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);

    // Type search query
    await searchInput.fill("super");

    // Wait for debounce and results
    await page.waitForTimeout(1000);

    // Check URL updated with search param
    await expect(page).toHaveURL(/\?q=super/);

    // Check results heading updated
    await expect(
      page.getByRole("heading", { name: /Search Results for "super"/i })
    ).toBeVisible();

    // Verify games are filtered (should have fewer games)
    const gameCards = page.locator('a[href^="/games/"]');
    const count = await gameCards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(12);
  });

  test("should show no results message for invalid search", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder(/search/i);

    // Type search query that won't match anything
    await searchInput.fill("xyzabc123nonexistent");

    // Wait for debounce and results
    await page.waitForTimeout(1000);

    // Check for "No games found" message
    await expect(page.getByText(/No games found/i)).toBeVisible();
  });

  test("should clear search and show all games", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);

    // Search first
    await searchInput.fill("puzzle");
    await page.waitForTimeout(1000);

    // Get filtered count
    const filteredCount = await page.locator('a[href^="/games/"]').count();

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(1000);

    // Verify URL updated (no search param)
    await expect(page).toHaveURL(/^(?!.*\?q=)/);

    // Verify more games are shown
    const allGamesCount = await page.locator('a[href^="/games/"]').count();
    expect(allGamesCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test("should update results in real-time (debounced)", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);

    // Type partial query
    await searchInput.fill("sup");
    await page.waitForTimeout(1000);

    // Complete the query
    await searchInput.fill("super");
    await page.waitForTimeout(1000);

    const fullCount = await page.locator('a[href^="/games/"]').count();

    // Results should be displayed
    expect(fullCount).toBeGreaterThan(0);
  });

  test("should maintain search when navigating back from game", async ({
    page,
  }) => {
    const searchInput = page.getByPlaceholder(/search/i);

    // Search for games
    await searchInput.fill("action");
    await page.waitForTimeout(1000);

    // Click a game
    const firstGame = page.locator('a[href^="/games/"]').first();
    await firstGame.click();
    await page.waitForURL(/\/games\/.+/);

    // Go back
    await page.goBack();

    // Verify search is still active
    await expect(searchInput).toHaveValue("action");
    await expect(page).toHaveURL(/\?q=action/);
  });
});
