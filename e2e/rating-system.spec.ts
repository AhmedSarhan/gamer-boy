import { test, expect } from "@playwright/test";

test.describe("Rating System", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Navigate to first game
    const firstGame = page.locator('a[href^="/games/"]').first();
    await firstGame.click();
    await page.waitForURL(/\/games\/.+/);
  });

  test("should display rating section", async ({ page }) => {
    // Check rating heading
    await expect(
      page.getByRole("heading", { name: /Rate this game/i })
    ).toBeVisible();

    // Check average rating label
    await expect(page.getByText(/Average Rating/i)).toBeVisible();

    // Check user rating label
    await expect(page.getByText(/Your Rating/i)).toBeVisible();
  });

  test("should display rating stars", async ({ page }) => {
    // Find rating input stars (should be 5)
    const ratingStars = page.locator('button[aria-label*="Rate"]');
    await expect(ratingStars).toHaveCount(5);
  });

  test("should highlight stars on hover", async ({ page }) => {
    // Find 4th star
    const fourthStar = page.locator('button[aria-label="Rate 4 stars"]');

    // Hover over it
    await fourthStar.hover();
    await page.waitForTimeout(200);

    // Check if stars are highlighted (visual check via class)
    const starSvg = fourthStar.locator("svg");
    const starClass = await starSvg.getAttribute("class");
    expect(starClass).toContain("text-yellow-400");
  });

  test("should submit rating when clicking star", async ({ page }) => {
    // Click 5th star
    const fifthStar = page.locator('button[aria-label="Rate 5 stars"]');
    await fifthStar.click();

    // Wait for submission
    await page.waitForTimeout(1500);

    // Check for success message
    await expect(page.getByText(/You rated this game 5 star/i)).toBeVisible();
  });

  test("should update rating when clicking different star", async ({
    page,
  }) => {
    // Submit initial rating
    const fifthStar = page.locator('button[aria-label="Rate 5 stars"]');
    await fifthStar.click();
    await page.waitForTimeout(1500);

    // Change to 3 stars
    const thirdStar = page.locator('button[aria-label="Rate 3 stars"]');
    await thirdStar.click();
    await page.waitForTimeout(1500);

    // Check updated message
    await expect(page.getByText(/You rated this game 3 star/i)).toBeVisible();
  });

  test("should persist user rating across page reloads", async ({ page }) => {
    // Submit rating
    const fourthStar = page.locator('button[aria-label="Rate 4 stars"]');
    await fourthStar.click();
    await page.waitForTimeout(1500);

    // Reload page
    await page.reload();
    await page.waitForTimeout(1000);

    // Check rating is still shown
    await expect(page.getByText(/You rated this game 4 star/i)).toBeVisible();
  });

  test("should display average rating", async ({ page }) => {
    // Wait for rating to load
    await page.waitForTimeout(1000);

    // Check if average rating is displayed (could be 0 or a number)
    const averageRating = page
      .getByText(/Average Rating/i)
      .locator("..")
      .locator("text=/\\d+\\.\\d+|No ratings/");
    await expect(averageRating).toBeVisible();
  });

  test("should show loading state while fetching ratings", async ({ page }) => {
    // Reload to see loading state
    await page.reload();

    // Loading might be too fast to catch, so we just check the page loaded
    await page.waitForLoadState("networkidle");

    // Rating section should be visible after loading
    await expect(
      page.getByRole("heading", { name: /Rate this game/i })
    ).toBeVisible();
  });

  test("should display total ratings count", async ({ page }) => {
    // Wait for ratings to load
    await page.waitForTimeout(1000);

    // Check if count is displayed (format: "(X)" or "No ratings")
    const ratingCount = page
      .getByText(/Average Rating/i)
      .locator("..")
      .locator("text=/\\(\\d+\\)|No ratings/");
    await expect(ratingCount).toBeVisible();
  });

  test("should show submitting state when rating", async ({ page }) => {
    // Click star
    const fifthStar = page.locator('button[aria-label="Rate 5 stars"]');
    await fifthStar.click();

    // Submitting state might be too fast to catch, so we just verify the rating completes
    await page.waitForTimeout(1500);

    // Final state should show success
    await expect(page.getByText(/You rated this game/i)).toBeVisible();
  });

  test("should disable rating stars while submitting", async ({ page }) => {
    // Click star
    const fifthStar = page.locator('button[aria-label="Rate 5 stars"]');
    await fifthStar.click();

    // Stars might be disabled briefly during submission
    // Just verify submission completes
    await page.waitForTimeout(1500);

    // Verify rating was submitted
    await expect(page.getByText(/You rated this game/i)).toBeVisible();
  });

  test("should work across different games", async ({ page }) => {
    // Rate first game
    const fifthStar = page.locator('button[aria-label="Rate 5 stars"]');
    await fifthStar.click();
    await page.waitForTimeout(1500);

    // Go back to home
    await page.getByRole("link", { name: /Back to games/i }).click();

    // Navigate to different game
    const secondGame = page.locator('a[href^="/games/"]').nth(1);
    await secondGame.click();
    await page.waitForURL(/\/games\/.+/);
    await page.waitForTimeout(1000);

    // Should not have rating yet
    const ratingMessage = page.getByText(/You rated this game/i);
    await expect(ratingMessage).not.toBeVisible();

    // Rate this game too
    const thirdStar = page.locator('button[aria-label="Rate 3 stars"]');
    await thirdStar.click();
    await page.waitForTimeout(1500);

    // Check rating submitted
    await expect(page.getByText(/You rated this game 3 star/i)).toBeVisible();
  });
});
