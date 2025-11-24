import { test, expect } from "@playwright/test";

test.describe("Game Detail Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Navigate to first game
    const firstGame = page.locator('a[href^="/games/"]').first();
    await firstGame.click();
    await page.waitForURL(/\/games\/.+/);
  });

  test("should display game title", async ({ page }) => {
    // Check game title is visible
    const title = page.locator("h1").first();
    await expect(title).toBeVisible();
    await expect(title).not.toBeEmpty();
  });

  test("should display back button", async ({ page }) => {
    const backButton = page.getByRole("link", { name: /Back to games/i });
    await expect(backButton).toBeVisible();
  });

  test("should navigate back when clicking back button", async ({ page }) => {
    const backButton = page.getByRole("link", { name: /Back to games/i });
    await backButton.click();

    // Should be back on home page
    await expect(page).toHaveURL("/");
  });

  test("should display game iframe player", async ({ page }) => {
    // Check iframe exists
    const iframe = page.frameLocator("iframe").first();
    await expect(iframe.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("should display fullscreen button", async ({ page }) => {
    const fullscreenButton = page.getByRole("button", {
      name: /fullscreen/i,
    });
    await expect(fullscreenButton).toBeVisible();
  });

  test("should display game actions", async ({ page }) => {
    // Check share button
    const shareButton = page.getByRole("button", { name: /Share/i });
    await expect(shareButton).toBeVisible();

    // Check favorite button
    const favoriteButton = page.getByRole("button", {
      name: /Add to wishlist|Remove from wishlist/i,
    });
    await expect(favoriteButton).toBeVisible();
  });

  test("should display game categories", async ({ page }) => {
    // Check categories heading
    await expect(
      page.getByRole("heading", { name: /Categories/i })
    ).toBeVisible();

    // Check at least one category badge exists
    const categoryBadges = page.locator('a[href*="categories="]');
    await expect(categoryBadges.first()).toBeVisible();
  });

  test("should navigate to category filter when clicking category", async ({
    page,
  }) => {
    // Click first category badge
    const firstCategory = page.locator('a[href*="categories="]').first();

    await firstCategory.click();

    // Should navigate to home with category filter
    await expect(page).toHaveURL(/\?categories=/);
    await expect(
      page.getByRole("heading", { name: /Filtered Games/i })
    ).toBeVisible();
  });

  test("should display game description", async ({ page }) => {
    // Check "About this game" heading
    await expect(
      page.getByRole("heading", { name: /About this game/i })
    ).toBeVisible();

    // Check description text exists
    const description = page.locator("text=/./").first();
    await expect(description).toBeVisible();
  });

  test("should display rating section", async ({ page }) => {
    // Check rating heading
    await expect(
      page.getByRole("heading", { name: /Rate this game/i })
    ).toBeVisible();

    // Check average rating display
    await expect(page.getByText(/Average Rating/i)).toBeVisible();

    // Check user rating input
    await expect(page.getByText(/Your Rating/i)).toBeVisible();
  });

  test("should allow user to submit rating", async ({ page }) => {
    // Find rating stars
    const ratingStars = page
      .getByLabel(/Your Rating/i)
      .locator("..")
      .locator('button[aria-label*="Rate"]');

    // Click 5th star
    await ratingStars.nth(4).click();

    // Wait for submission
    await page.waitForTimeout(1000);

    // Check for success message or updated rating
    await expect(page.getByText(/You rated this game 5 star/i)).toBeVisible();
  });

  test("should display related games section", async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check related games heading
    await expect(
      page.getByRole("heading", { name: /Related Games|You might also like/i })
    ).toBeVisible();

    // Check related game cards exist
    const relatedGames = page.locator('a[href^="/games/"]');
    await expect(relatedGames.first()).toBeVisible();
  });

  test("should open share menu", async ({ page }) => {
    const shareButton = page.getByRole("button", { name: /Share/i });
    await shareButton.click();

    // Check share options are visible
    await expect(page.getByText(/Share on Twitter/i)).toBeVisible();
    await expect(page.getByText(/Share on Facebook/i)).toBeVisible();
    await expect(page.getByText(/Copy Link/i)).toBeVisible();
  });

  test("should close share menu when clicking outside", async ({ page }) => {
    const shareButton = page.getByRole("button", { name: /Share/i });
    await shareButton.click();

    // Verify menu is open
    await expect(page.getByText(/Share on Twitter/i)).toBeVisible();

    // Click outside
    await page.locator("h1").click();

    // Menu should be closed
    await expect(page.getByText(/Share on Twitter/i)).not.toBeVisible();
  });

  test("should toggle favorite status", async ({ page }) => {
    const favoriteButton = page.getByRole("button", {
      name: /Add to wishlist|Remove from wishlist/i,
    });

    // Get initial state
    const initialLabel = await favoriteButton.getAttribute("aria-label");

    // Click to toggle
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Check state changed
    const newLabel = await favoriteButton.getAttribute("aria-label");
    expect(newLabel).not.toBe(initialLabel);
  });

  test("should open game in new tab", async ({ page, context }) => {
    const shareButton = page.getByRole("button", { name: /Share/i });
    await shareButton.click();

    // Click "Open in New Tab"
    const newTabButton = page.getByText(/Open in New Tab/i);

    // Listen for new page
    const pagePromise = context.waitForEvent("page");
    await newTabButton.click();

    const newPage = await pagePromise;
    await newPage.waitForLoadState();

    // Verify new page has iframe
    await expect(newPage.locator("iframe")).toBeVisible();
  });
});
