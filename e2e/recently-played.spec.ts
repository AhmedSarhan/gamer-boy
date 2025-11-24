import { test, expect } from "@playwright/test";

test.describe("Recently Played Feature", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("should display recently played page", async ({ page }) => {
    // Navigate to recently played
    await page.getByRole("link", { name: /Played|Recently Played/i }).click();

    // Check heading
    await expect(
      page.getByRole("heading", { name: /Recently Played/i })
    ).toBeVisible();
  });

  test("should show empty state when no games played", async ({ page }) => {
    // Navigate to recently played
    await page.getByRole("link", { name: /Played|Recently Played/i }).click();

    // Check empty state message
    await expect(
      page.getByText(
        /You haven't played any games yet|No recently played games/i
      )
    ).toBeVisible();
  });

  test("should track game when viewing detail page", async ({ page }) => {
    // Navigate to a game
    const firstGame = page.locator('a[href^="/games/"]').first();
    const gameTitle = await firstGame.locator("h3").textContent();
    await firstGame.click();
    await page.waitForURL(/\/games\/.+/);

    // Wait for tracking
    await page.waitForTimeout(1000);

    // Navigate to recently played
    await page.getByRole("link", { name: /Played|Recently Played/i }).click();

    // Verify game appears
    const recentGames = page.locator('a[href^="/games/"]');
    await expect(recentGames).toHaveCount(1);

    // Verify it's the correct game
    await expect(page.getByRole("heading", { name: gameTitle! })).toBeVisible();
  });

  test("should track multiple games in order", async ({ page }) => {
    // Play first game
    const firstGame = page.locator('a[href^="/games/"]').nth(0);
    await firstGame.click();
    await page.waitForURL(/\/games\/.+/);
    await page.waitForTimeout(500);

    // Go back and play second game
    await page.goBack();
    const secondGame = page.locator('a[href^="/games/"]').nth(1);
    const secondTitle = await secondGame.locator("h3").textContent();
    await secondGame.click();
    await page.waitForURL(/\/games\/.+/);
    await page.waitForTimeout(500);

    // Navigate to recently played
    await page.getByRole("link", { name: /Played|Recently Played/i }).click();

    // Verify both games appear
    const recentGames = page.locator('a[href^="/games/"]');
    await expect(recentGames).toHaveCount(2);

    // Most recent should be first
    const firstCard = recentGames.nth(0);
    await expect(firstCard.locator("h3")).toHaveText(secondTitle!);
  });

  test("should persist recently played across reloads", async ({ page }) => {
    // Play a game
    const firstGame = page.locator('a[href^="/games/"]').first();
    await firstGame.click();
    await page.waitForURL(/\/games\/.+/);
    await page.waitForTimeout(500);

    // Reload page
    await page.reload();

    // Navigate to recently played
    await page.getByRole("link", { name: /Played|Recently Played/i }).click();

    // Verify game still appears
    const recentGames = page.locator('a[href^="/games/"]');
    await expect(recentGames).toHaveCount(1);
  });

  test("should not duplicate games in recently played", async ({ page }) => {
    // Play same game twice
    const firstGame = page.locator('a[href^="/games/"]').first();
    await firstGame.click();
    await page.waitForURL(/\/games\/.+/);
    await page.waitForTimeout(500);

    // Go back and play again
    await page.goBack();
    await firstGame.click();
    await page.waitForURL(/\/games\/.+/);
    await page.waitForTimeout(500);

    // Navigate to recently played
    await page.getByRole("link", { name: /Played|Recently Played/i }).click();

    // Should only appear once
    const recentGames = page.locator('a[href^="/games/"]');
    await expect(recentGames).toHaveCount(1);
  });

  test("should navigate to game from recently played", async ({ page }) => {
    // Play a game
    const firstGame = page.locator('a[href^="/games/"]').first();
    const gameTitle = await firstGame.locator("h3").textContent();
    await firstGame.click();
    await page.waitForURL(/\/games\/.+/);
    await page.waitForTimeout(500);

    // Go to recently played
    await page.getByRole("link", { name: /Played|Recently Played/i }).click();

    // Click game
    const recentGame = page.locator('a[href^="/games/"]').first();
    await recentGame.click();

    // Verify on game detail page
    await page.waitForURL(/\/games\/.+/);
    await expect(page.getByRole("heading", { name: gameTitle! })).toBeVisible();
  });

  test("should limit recently played to reasonable number", async ({
    page,
  }) => {
    // Play multiple games (more than 10)
    for (let i = 0; i < 12; i++) {
      await page.goto("/");
      const game = page.locator('a[href^="/games/"]').nth(i);
      await game.click();
      await page.waitForURL(/\/games\/.+/);
      await page.waitForTimeout(300);
    }

    // Navigate to recently played
    await page.getByRole("link", { name: /Played|Recently Played/i }).click();

    // Should have at most 10 games (or configured limit)
    const recentGames = page.locator('a[href^="/games/"]');
    const count = await recentGames.count();
    expect(count).toBeLessThanOrEqual(10);
  });
});
