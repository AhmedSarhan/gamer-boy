import { test, expect } from "@playwright/test";

test.describe("Wishlist Feature", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("should display wishlist page", async ({ page }) => {
    // Navigate to wishlist
    await page.getByRole("link", { name: /Wishlist/i }).click();

    // Check heading
    await expect(
      page.getByRole("heading", { name: /Your Wishlist/i })
    ).toBeVisible();
  });

  test("should show empty state when no favorites", async ({ page }) => {
    // Navigate to wishlist
    await page.getByRole("link", { name: /Wishlist/i }).click();

    // Check empty state message
    await expect(
      page.getByText(/Your wishlist is empty|No games in your wishlist/i)
    ).toBeVisible();
  });

  test("should add game to wishlist from home page", async ({ page }) => {
    // Hover over first game card
    const firstGame = page.locator('a[href^="/games/"]').first();
    await firstGame.hover();

    // Click favorite button
    const favoriteButton = firstGame.locator('button[aria-label*="wishlist"]');
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Navigate to wishlist
    await page.getByRole("link", { name: /Wishlist/i }).click();

    // Verify game appears in wishlist
    const wishlistGames = page.locator('a[href^="/games/"]');
    await expect(wishlistGames).toHaveCount(1);
  });

  test("should add game to wishlist from detail page", async ({ page }) => {
    // Navigate to game detail
    const firstGame = page.locator('a[href^="/games/"]').first();
    await firstGame.click();
    await page.waitForURL(/\/games\/.+/);

    // Click favorite button
    const favoriteButton = page.getByRole("button", {
      name: /Add to wishlist/i,
    });
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Navigate to wishlist
    await page.getByRole("link", { name: /Wishlist/i }).click();

    // Verify game appears in wishlist
    const wishlistGames = page.locator('a[href^="/games/"]');
    await expect(wishlistGames).toHaveCount(1);
  });

  test("should remove game from wishlist", async ({ page }) => {
    // Add a game to wishlist first
    const firstGame = page.locator('a[href^="/games/"]').first();
    await firstGame.hover();
    const favoriteButton = firstGame.locator('button[aria-label*="wishlist"]');
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Navigate to wishlist
    await page.getByRole("link", { name: /Wishlist/i }).click();

    // Verify game is in wishlist
    await expect(page.locator('a[href^="/games/"]')).toHaveCount(1);

    // Hover and click remove
    const wishlistGame = page.locator('a[href^="/games/"]').first();
    await wishlistGame.hover();
    const removeButton = wishlistGame.locator('button[aria-label*="wishlist"]');
    await removeButton.click();
    await page.waitForTimeout(500);

    // Reload to see changes
    await page.reload();

    // Verify empty state
    await expect(
      page.getByText(/Your wishlist is empty|No games in your wishlist/i)
    ).toBeVisible();
  });

  test("should persist wishlist across page reloads", async ({ page }) => {
    // Add game to wishlist
    const firstGame = page.locator('a[href^="/games/"]').first();
    await firstGame.hover();
    const favoriteButton = firstGame.locator('button[aria-label*="wishlist"]');
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Reload page
    await page.reload();

    // Navigate to wishlist
    await page.getByRole("link", { name: /Wishlist/i }).click();

    // Verify game still in wishlist
    const wishlistGames = page.locator('a[href^="/games/"]');
    await expect(wishlistGames).toHaveCount(1);
  });

  test("should show favorite icon state on game cards", async ({ page }) => {
    // Add game to wishlist
    const firstGame = page.locator('a[href^="/games/"]').first();
    await firstGame.hover();
    const favoriteButton = firstGame.locator('button[aria-label*="wishlist"]');
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Reload and hover again
    await page.reload();
    await firstGame.hover();

    // Button should show "Remove from wishlist"
    const updatedButton = firstGame.locator(
      'button[aria-label*="Remove from wishlist"]'
    );
    await expect(updatedButton).toBeVisible();
  });

  test("should navigate to game from wishlist", async ({ page }) => {
    // Add game to wishlist
    const firstGame = page.locator('a[href^="/games/"]').first();
    const gameTitle = await firstGame.locator("h3").textContent();
    await firstGame.hover();
    const favoriteButton = firstGame.locator('button[aria-label*="wishlist"]');
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Go to wishlist
    await page.getByRole("link", { name: /Wishlist/i }).click();

    // Click game
    const wishlistGame = page.locator('a[href^="/games/"]').first();
    await wishlistGame.click();

    // Verify on game detail page
    await page.waitForURL(/\/games\/.+/);
    await expect(page.getByRole("heading", { name: gameTitle! })).toBeVisible();
  });
});
