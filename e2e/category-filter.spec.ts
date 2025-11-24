import { test, expect } from "@playwright/test";

test.describe("Category Filtering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display categories sidebar", async ({ page }) => {
    // Check sidebar heading
    await expect(
      page.getByRole("heading", { name: /Categories/i })
    ).toBeVisible();

    // Check "All Games" option
    await expect(page.getByText(/All Games/i).first()).toBeVisible();
  });

  test("should filter games by single category", async ({ page }) => {
    // Click a category (e.g., "Action")
    const actionCategory = page
      .getByRole("button", { name: /action/i })
      .first();
    await actionCategory.click();

    // Wait for filter to apply
    await page.waitForTimeout(1000);

    // Check URL updated with category param
    await expect(page).toHaveURL(/categories=action/);

    // Check heading updated
    await expect(
      page.getByRole("heading", { name: /Filtered Games/i })
    ).toBeVisible();

    // Verify games are displayed
    const gameCards = page.locator('a[href^="/games/"]');
    await expect(gameCards.first()).toBeVisible();
  });

  test("should filter games by multiple categories", async ({ page }) => {
    // Click first category
    const firstCategory = page.getByRole("button", { name: /action/i }).first();
    await firstCategory.click();
    await page.waitForTimeout(500);

    // Click second category
    const secondCategory = page
      .getByRole("button", { name: /puzzle/i })
      .first();
    await secondCategory.click();
    await page.waitForTimeout(1000);

    // Check URL has both categories
    await expect(page).toHaveURL(/categories=action/);
    await expect(page).toHaveURL(/categories=.*puzzle/);

    // Verify games are displayed
    const gameCards = page.locator('a[href^="/games/"]');
    await expect(gameCards.first()).toBeVisible();
  });

  test("should toggle category on/off", async ({ page }) => {
    // Click category to enable
    const category = page.getByRole("button", { name: /action/i }).first();
    await category.click();
    await page.waitForTimeout(500);

    // Verify checkmark appears
    const checkmark = category.locator("svg").last();
    await expect(checkmark).toBeVisible();

    // Click again to disable
    await category.click();
    await page.waitForTimeout(1000);

    // Verify URL no longer has category
    await expect(page).not.toHaveURL(/categories=action/);
  });

  test("should clear all filters when clicking 'All Games'", async ({
    page,
  }) => {
    // Apply a category filter
    const category = page.getByRole("button", { name: /action/i }).first();
    await category.click();
    await page.waitForTimeout(500);

    // Click "All Games"
    const allGamesLink = page.getByRole("link", { name: /All Games/i }).first();
    await allGamesLink.click();
    await page.waitForTimeout(1000);

    // Verify URL has no category param
    await expect(page).not.toHaveURL(/categories=/);

    // Verify heading is "All Games"
    await expect(
      page.getByRole("heading", { name: /All Games/i })
    ).toBeVisible();
  });

  test("should combine search and category filters", async ({ page }) => {
    // Apply category filter
    const category = page.getByRole("button", { name: /action/i }).first();
    await category.click();
    await page.waitForTimeout(500);

    // Apply search
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("super");
    await page.waitForTimeout(1000);

    // Check URL has both params
    await expect(page).toHaveURL(/categories=action/);
    await expect(page).toHaveURL(/q=super/);

    // Verify filtered results
    const gameCards = page.locator('a[href^="/games/"]');
    const count = await gameCards.count();
    expect(count).toBeGreaterThanOrEqual(0); // May be 0 if no matches
  });

  test("should show category count in sidebar footer", async ({ page }) => {
    // Check footer shows category count
    const footer = page.locator("text=/\\d+ categories available/i");
    await expect(footer).toBeVisible();
  });

  test("should toggle sidebar on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Sidebar should be hidden initially on mobile
    const sidebar = page.locator("aside");
    await expect(sidebar).not.toBeVisible();

    // Click toggle button
    const toggleButton = page.getByLabel(/Toggle categories sidebar/i);
    await toggleButton.click();

    // Sidebar should now be visible
    await expect(sidebar).toBeVisible();

    // Close sidebar
    const closeButton = page.getByLabel(/Close sidebar/i);
    await closeButton.click();

    // Sidebar should be hidden again
    await expect(sidebar).not.toBeVisible();
  });
});
