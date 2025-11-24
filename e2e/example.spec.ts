import { test, expect } from "@playwright/test";

test.describe("Game Hosting Website", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Game Hosting/i);
  });

  // Add more E2E tests here:
  // - Search functionality
  // - Category filtering
  // - Game card navigation
  // - Game player iframe loading
  // - Fullscreen functionality
});
