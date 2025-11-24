import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load homepage successfully", async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/GamerBoy/i);

    // Check hero section
    await expect(
      page.getByRole("heading", { name: /Play Free Online Games/i })
    ).toBeVisible();
  });

  test("should display featured games section", async ({ page }) => {
    // Wait for featured games to load
    const featuredSection = page.getByRole("heading", {
      name: /Featured Games/i,
    });
    await expect(featuredSection).toBeVisible();

    // Check if game cards are present
    const gameCards = page.locator('a[href^="/games/"]').first();
    await expect(gameCards).toBeVisible();
  });

  test("should display all games grid", async ({ page }) => {
    // Check "All Games" heading
    await expect(
      page.getByRole("heading", { name: /All Games/i })
    ).toBeVisible();

    // Verify multiple game cards are displayed
    const gameCards = page.locator('a[href^="/games/"]');
    await expect(gameCards).toHaveCount(12, { timeout: 10000 }); // Initial load shows 12 games
  });

  test("should display game card information", async ({ page }) => {
    // Wait for first game card
    const firstGameCard = page.locator('a[href^="/games/"]').first();
    await expect(firstGameCard).toBeVisible();

    // Check game card has image
    const gameImage = firstGameCard.locator("img").first();
    await expect(gameImage).toBeVisible();

    // Check game card has title
    const gameTitle = firstGameCard.locator("h3").first();
    await expect(gameTitle).toBeVisible();
    await expect(gameTitle).not.toBeEmpty();
  });

  test("should navigate to game detail page when clicking card", async ({
    page,
  }) => {
    // Click first game card
    const firstGameCard = page.locator('a[href^="/games/"]').first();
    const gameTitle = await firstGameCard.locator("h3").first().textContent();

    await firstGameCard.click();

    // Wait for navigation
    await page.waitForURL(/\/games\/.+/);

    // Verify we're on the game detail page
    await expect(page.getByRole("heading", { name: gameTitle! })).toBeVisible();
  });

  test("should show favorite toggle on hover", async ({ page }) => {
    // Hover over first game card
    const firstGameCard = page.locator('a[href^="/games/"]').first();
    await firstGameCard.hover();

    // Check if favorite button appears (it has opacity-0 by default, opacity-100 on hover)
    const favoriteButton = firstGameCard.locator(
      'button[aria-label*="wishlist"]'
    );
    await expect(favoriteButton).toBeVisible();
  });

  test("should load more games on scroll (infinite scroll)", async ({
    page,
  }) => {
    // Get initial game count
    const initialCards = await page.locator('a[href^="/games/"]').count();

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Wait for more games to load
    await page.waitForTimeout(2000);

    // Check if more games loaded
    const newCards = await page.locator('a[href^="/games/"]').count();
    expect(newCards).toBeGreaterThan(initialCards);
  });
});
