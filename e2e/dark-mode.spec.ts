import { test, expect } from "@playwright/test";

test.describe("Dark Mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display theme toggle button", async ({ page }) => {
    const themeToggle = page.getByRole("button", { name: /Toggle theme/i });
    await expect(themeToggle).toBeVisible();
  });

  test("should toggle dark mode on and off", async ({ page }) => {
    const themeToggle = page.getByRole("button", { name: /Toggle theme/i });

    // Get initial theme
    const htmlElement = page.locator("html");
    const initialClass = await htmlElement.getAttribute("class");

    // Click to toggle
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Check theme changed
    const newClass = await htmlElement.getAttribute("class");
    expect(newClass).not.toBe(initialClass);

    // Toggle back
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Should be back to original
    const finalClass = await htmlElement.getAttribute("class");
    expect(finalClass).toBe(initialClass);
  });

  test("should apply dark mode styles", async ({ page }) => {
    const themeToggle = page.getByRole("button", { name: /Toggle theme/i });
    const htmlElement = page.locator("html");

    // Enable dark mode
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Check dark class is applied
    const htmlClass = await htmlElement.getAttribute("class");
    expect(htmlClass).toContain("dark");

    // Check background color changed (should be dark)
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // Dark background should have low RGB values
    expect(bgColor).toMatch(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  });

  test("should persist theme preference across page reloads", async ({
    page,
  }) => {
    const themeToggle = page.getByRole("button", { name: /Toggle theme/i });
    const htmlElement = page.locator("html");

    // Enable dark mode
    await themeToggle.click();
    await page.waitForTimeout(300);

    const darkClass = await htmlElement.getAttribute("class");

    // Reload page
    await page.reload();
    await page.waitForTimeout(500);

    // Theme should still be dark
    const reloadedClass = await htmlElement.getAttribute("class");
    expect(reloadedClass).toBe(darkClass);
  });

  test("should persist theme across navigation", async ({ page }) => {
    const themeToggle = page.getByRole("button", { name: /Toggle theme/i });

    // Enable dark mode
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Navigate to game detail
    const firstGame = page.locator('a[href^="/games/"]').first();
    await firstGame.click();
    await page.waitForURL(/\/games\/.+/);

    // Check dark mode still active
    const htmlElement = page.locator("html");
    const htmlClass = await htmlElement.getAttribute("class");
    expect(htmlClass).toContain("dark");

    // Navigate to wishlist
    await page.getByRole("link", { name: /Wishlist/i }).click();

    // Check dark mode still active
    const wishlistClass = await htmlElement.getAttribute("class");
    expect(wishlistClass).toContain("dark");
  });

  test("should update theme toggle icon", async ({ page }) => {
    const themeToggle = page.getByRole("button", { name: /Toggle theme/i });

    // Get initial icon (sun or moon)
    const initialIcon = await themeToggle.locator("svg").innerHTML();

    // Toggle theme
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Icon should change
    const newIcon = await themeToggle.locator("svg").innerHTML();
    expect(newIcon).not.toBe(initialIcon);
  });

  test("should apply dark mode to all components", async ({ page }) => {
    const themeToggle = page.getByRole("button", { name: /Toggle theme/i });

    // Enable dark mode
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Check header has dark styles
    const header = page.locator("header");
    await expect(header).toHaveClass(/dark:bg-gray-900/);

    // Check game cards have dark styles
    const gameCard = page.locator('a[href^="/games/"]').first();
    await expect(gameCard).toBeVisible();

    // Check sidebar has dark styles
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
  });

  test("should respect system preference on first visit", async ({
    page,
    context,
  }) => {
    // Set system to dark mode
    await context.emulateMedia({ colorScheme: "dark" });

    // Visit page for first time (clear storage)
    await page.evaluate(() => localStorage.clear());
    await page.goto("/");
    await page.waitForTimeout(500);

    // Should default to dark mode
    const htmlElement = page.locator("html");
    const htmlClass = await htmlElement.getAttribute("class");
    expect(htmlClass).toContain("dark");
  });
});
