# E2E Testing Guide

This document describes the End-to-End (E2E) testing setup and test suites for the game hosting website.

## Overview

The project uses **Playwright** for E2E testing, covering all major user flows and features. Tests are organized by feature and ensure the application works correctly from a user's perspective.

## Test Suites

### 1. Home Page Tests (`e2e/home-page.spec.ts`)

Tests the main landing page functionality:

- ✅ Homepage loads successfully
- ✅ Featured games section displays
- ✅ All games grid displays with correct count
- ✅ Game cards show proper information (image, title, description)
- ✅ Navigation to game detail page works
- ✅ Favorite toggle appears on hover
- ✅ Infinite scroll loads more games

**Key User Flows:**

- Browse games on home page
- View game card details
- Navigate to game detail page

### 2. Search Tests (`e2e/search.spec.ts`)

Tests the real-time search functionality:

- ✅ Search bar is visible
- ✅ Games filter by search query
- ✅ URL updates with search parameter
- ✅ "No results" message for invalid searches
- ✅ Clear search shows all games
- ✅ Real-time updates with debouncing
- ✅ Search persists when navigating back

**Key User Flows:**

- Search for games by title
- Clear search results
- Navigate with active search

### 3. Category Filter Tests (`e2e/category-filter.spec.ts`)

Tests the category filtering system:

- ✅ Categories sidebar displays
- ✅ Filter by single category
- ✅ Filter by multiple categories (multi-select)
- ✅ Toggle category on/off
- ✅ Clear all filters with "All Games"
- ✅ Combine search and category filters
- ✅ Category count in footer
- ✅ Mobile sidebar toggle

**Key User Flows:**

- Select single category
- Select multiple categories
- Combine with search
- Mobile sidebar interaction

### 4. Game Detail Tests (`e2e/game-detail.spec.ts`)

Tests the game detail/play page:

- ✅ Game title displays
- ✅ Back button navigation
- ✅ Game iframe player loads
- ✅ Fullscreen button visible
- ✅ Game actions (share, favorite) display
- ✅ Categories display and are clickable
- ✅ Game description shows
- ✅ Rating section displays
- ✅ User can submit rating
- ✅ Related games section shows
- ✅ Share menu opens/closes
- ✅ Favorite toggle works
- ✅ Open in new tab works

**Key User Flows:**

- Play a game
- Rate a game
- Share a game
- Add to wishlist
- Navigate via categories

### 5. Wishlist Tests (`e2e/wishlist.spec.ts`)

Tests the wishlist/favorites feature:

- ✅ Wishlist page displays
- ✅ Empty state when no favorites
- ✅ Add game from home page
- ✅ Add game from detail page
- ✅ Remove game from wishlist
- ✅ Wishlist persists across reloads
- ✅ Favorite icon state updates
- ✅ Navigate to game from wishlist

**Key User Flows:**

- Add games to wishlist
- View wishlist
- Remove from wishlist
- Navigate to games

### 6. Recently Played Tests (`e2e/recently-played.spec.ts`)

Tests the recently played tracking:

- ✅ Recently played page displays
- ✅ Empty state when no games played
- ✅ Game tracked when viewing detail page
- ✅ Multiple games tracked in order
- ✅ Persists across reloads
- ✅ No duplicates for same game
- ✅ Navigate to game from list
- ✅ Limit to reasonable number (10)

**Key User Flows:**

- Play games
- View recently played
- Navigate to recent games

### 7. Dark Mode Tests (`e2e/dark-mode.spec.ts`)

Tests the theme toggle functionality:

- ✅ Theme toggle button displays
- ✅ Toggle dark mode on/off
- ✅ Dark mode styles apply
- ✅ Theme persists across reloads
- ✅ Theme persists across navigation
- ✅ Toggle icon updates
- ✅ Dark mode applies to all components
- ✅ Respects system preference

**Key User Flows:**

- Toggle dark mode
- Navigate with dark mode
- System preference detection

### 8. Rating System Tests (`e2e/rating-system.spec.ts`)

Tests the 5-star rating functionality:

- ✅ Rating section displays
- ✅ Rating stars display (5 stars)
- ✅ Stars highlight on hover
- ✅ Submit rating by clicking star
- ✅ Update rating with different star
- ✅ User rating persists across reloads
- ✅ Average rating displays
- ✅ Loading state shows
- ✅ Total ratings count displays
- ✅ Submitting state shows
- ✅ Stars disable while submitting
- ✅ Works across different games

**Key User Flows:**

- Rate a game
- Update rating
- View average ratings

## Running Tests

### Run All Tests

```bash
npm run test:e2e
```

### Run Tests with UI

```bash
npm run test:e2e:ui
```

### Run Specific Test Suite

```bash
npx playwright test e2e/home-page.spec.ts
```

### Run Tests in Headed Mode (See Browser)

```bash
npx playwright test --headed
```

### Run Tests in Debug Mode

```bash
npx playwright test --debug
```

### Run Tests for Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Configuration

Tests are configured in `playwright.config.ts`:

- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit
- **Timeout**: 30 seconds per test
- **Retries**: 2 retries on CI, 0 locally
- **Workers**: 1 worker (sequential execution)
- **Screenshots**: On failure
- **Videos**: On first retry

## Writing New Tests

### Test Structure

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto("/");
  });

  test("should do something", async ({ page }) => {
    // Arrange
    const element = page.getByRole("button", { name: /Click me/i });

    // Act
    await element.click();

    // Assert
    await expect(page).toHaveURL("/new-page");
  });
});
```

### Best Practices

1. **Use Semantic Selectors**: Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
2. **Wait for Elements**: Use `await expect(element).toBeVisible()` instead of `waitForTimeout`
3. **Isolate Tests**: Each test should be independent (use `beforeEach` for setup)
4. **Clear State**: Clear localStorage/cookies when testing persistence features
5. **Descriptive Names**: Test names should clearly describe what they test
6. **Test User Flows**: Focus on real user interactions, not implementation details
7. **Handle Async**: Always `await` Playwright actions and assertions
8. **Use Timeouts Wisely**: Only use `waitForTimeout` when absolutely necessary

### Common Patterns

**Navigate to a page:**

```typescript
await page.goto("/");
await page.waitForURL("/games/some-game");
```

**Find and click an element:**

```typescript
const button = page.getByRole("button", { name: /Submit/i });
await button.click();
```

**Check element visibility:**

```typescript
await expect(page.getByText(/Success/i)).toBeVisible();
```

**Check URL:**

```typescript
await expect(page).toHaveURL(/\?q=search/);
```

**Fill input:**

```typescript
const input = page.getByPlaceholder(/Search/i);
await input.fill("test query");
```

**Hover over element:**

```typescript
const card = page.locator('a[href^="/games/"]').first();
await card.hover();
```

**Wait for network:**

```typescript
await page.waitForLoadState("networkidle");
```

**Clear localStorage:**

```typescript
await page.evaluate(() => localStorage.clear());
```

## CI/CD Integration

Tests run automatically on CI with:

- 2 retries on failure
- Screenshots on failure
- Videos on first retry
- Parallel execution across browsers

## Test Coverage

Current test coverage includes:

- **Core Features**: 100%
  - Home page browsing
  - Search functionality
  - Category filtering
  - Game detail page
  - Game player

- **Bonus Features**: 100%
  - Wishlist (favorites)
  - Recently played
  - Dark mode
  - Rating system
  - Infinite scroll
  - Social sharing

- **User Flows**: 100%
  - Browse → Search → Filter → Play
  - Add to wishlist → View wishlist
  - Play game → View recently played
  - Rate game → View ratings
  - Toggle dark mode → Navigate

## Troubleshooting

### Tests Fail Locally

1. **Ensure dev server is running**: `npm run dev`
2. **Check port**: Tests expect `http://localhost:3000`
3. **Clear browser cache**: `npx playwright test --headed` to see what's happening
4. **Update browsers**: `npx playwright install`

### Flaky Tests

1. **Increase timeouts**: Add `{ timeout: 10000 }` to specific assertions
2. **Wait for network**: Use `page.waitForLoadState("networkidle")`
3. **Add explicit waits**: Use `await expect(element).toBeVisible()` instead of `waitForTimeout`

### Debugging

1. **Run with UI**: `npm run test:e2e:ui`
2. **Run in headed mode**: `npx playwright test --headed`
3. **Debug mode**: `npx playwright test --debug`
4. **Inspect element**: Use Playwright Inspector to find selectors

## Future Improvements

- [ ] Add visual regression testing
- [ ] Add performance testing (Lighthouse)
- [ ] Add accessibility testing (axe-core)
- [ ] Add API mocking for faster tests
- [ ] Add test coverage reporting
- [ ] Add cross-browser screenshot comparisons
