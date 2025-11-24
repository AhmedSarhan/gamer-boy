# Wishlist & Recently Played Implementation

## Overview

This document describes the implementation of the Wishlist (Favorites) and Recently Played features using localStorage for data persistence.

## Components Created

### 1. **FavoriteButton** (`src/modules/games/components/favorite-button/`)

A client component that allows users to add/remove games from their wishlist.

**Features:**

- ✅ Toggle favorite status with visual feedback
- ✅ Heart icon animation on add
- ✅ Filled heart when favorited, outline when not
- ✅ Persists to localStorage
- ✅ Color changes based on favorite status (red when favorited)

**Usage:**

```tsx
<FavoriteButton
  game={{
    id: game.id,
    slug: game.slug,
    title: game.title,
    thumbnail: game.thumbnail,
  }}
/>
```

**Location:** Game detail page (`/games/[slug]`)

---

### 2. **TrackRecentlyPlayed** (`src/modules/games/components/track-recently-played/`)

An invisible client component that automatically tracks when a user views/plays a game.

**Features:**

- ✅ Automatically adds game to recently played on page load
- ✅ Stores timestamp for sorting
- ✅ Limits to 20 most recent games
- ✅ Removes duplicates (updates timestamp if already exists)
- ✅ Renders nothing (invisible component)

**Usage:**

```tsx
<TrackRecentlyPlayed
  game={{
    id: game.id,
    slug: game.slug,
    title: game.title,
    thumbnail: game.thumbnail,
  }}
/>
```

**Location:** Game detail page (`/games/[slug]`)

---

### 3. **GamesList** (`src/modules/games/components/games-list/`)

A reusable component for displaying grids of games with empty states.

**Features:**

- ✅ Responsive grid layout (1→2→3→4 columns)
- ✅ Customizable empty state (icon, title, description, CTA)
- ✅ Game count display
- ✅ Error boundaries for each card
- ✅ Used in Wishlist and Recently Played pages

**Usage:**

```tsx
<GamesList
  games={gamesArray}
  title="My Wishlist"
  emptyState={{
    icon: <HeartIcon />,
    title: "No favorites yet",
    description: "Start adding games...",
    actionLabel: "Browse Games",
    actionHref: "/",
  }}
/>
```

---

## Pages Updated

### 1. **Game Detail Page** (`/games/[slug]`)

**Changes:**

- ✅ Added `TrackRecentlyPlayed` component (invisible, tracks on mount)
- ✅ Added `FavoriteButton` in the actions section
- ✅ Refactored `GameActions` to not include wrapper div (moved to page)

### 2. **Wishlist Page** (`/wishlist`)

**Changes:**

- ✅ Refactored to use `GamesList` component
- ✅ Fetches favorites from localStorage
- ✅ Converts `StoredGame` to `GameWithCategories` format
- ✅ Updates when page becomes visible (tab switching)
- ✅ Empty state with heart icon

### 3. **Recently Played Page** (`/recently-played`)

**Changes:**

- ✅ Refactored to use `GamesList` component
- ✅ Fetches recently played from localStorage
- ✅ Sorts by timestamp (most recent first)
- ✅ Converts `StoredGame` to `GameWithCategories` format
- ✅ Updates when page becomes visible (tab switching)
- ✅ Empty state with clock icon

---

## localStorage Utilities

### Functions in `src/shared/lib/local-storage.ts`

#### **Favorites**

- `getFavorites()` - Get all favorite games
- `addFavorite(game)` - Add game to favorites
- `removeFavorite(gameId)` - Remove game from favorites
- `isFavorite(gameId)` - Check if game is favorited

#### **Recently Played**

- `getRecentlyPlayed()` - Get recently played games (sorted by timestamp)
- `addRecentlyPlayed(game)` - Add game to recently played (max 20)

#### **Data Structure**

```typescript
interface StoredGame {
  id: number;
  slug: string;
  title: string;
  thumbnail: string;
  timestamp?: number; // For recently played
}
```

---

## User Flow

### Adding to Wishlist

1. User visits game detail page
2. Clicks "Add to Wishlist" button
3. Button animates (heart bounces)
4. Button changes to filled heart with red styling
5. Game is saved to localStorage
6. Button text changes to "Remove from Wishlist"

### Viewing Wishlist

1. User clicks "Wishlist" in header
2. Page displays all favorited games in grid
3. If empty, shows empty state with "Browse Games" CTA
4. User can click any game card to view details

### Recently Played Tracking

1. User visits any game detail page
2. `TrackRecentlyPlayed` component automatically adds game to list
3. Timestamp is recorded
4. If game already exists, timestamp is updated
5. List is limited to 20 most recent games

### Viewing Recently Played

1. User clicks "Played" in header
2. Page displays recently played games (newest first)
3. If empty, shows empty state with "Browse Games" CTA
4. User can click any game card to view details

---

## Technical Details

### localStorage Keys

- `gamerboy_favorites` - Stores favorite games
- `gamerboy_recently_played` - Stores recently played games

### Performance Optimizations

- ✅ State initialization with lazy function to avoid re-reading localStorage
- ✅ `visibilitychange` event listener to sync data across tabs
- ✅ Error handling for localStorage access (try-catch blocks)
- ✅ Deduplication to prevent duplicate entries

### Browser Compatibility

- Works in all modern browsers that support localStorage
- Gracefully handles localStorage being unavailable (returns empty arrays)

---

## Future Enhancements (Optional)

1. **Sync Across Devices** - Use backend API to sync favorites/history
2. **Export/Import** - Allow users to export their data
3. **Clear History** - Add button to clear recently played
4. **Favorite Count Badge** - Show count in header
5. **Quick Add from Cards** - Add favorite button to game cards on home page
6. **Sorting Options** - Sort favorites by name, date added, etc.
7. **Favorite Categories** - Filter favorites by category

---

## Testing Checklist

- [x] Add game to wishlist from detail page
- [x] Remove game from wishlist from detail page
- [x] View wishlist page with games
- [x] View wishlist page when empty
- [x] Recently played auto-tracks on game view
- [x] View recently played page with games
- [x] View recently played page when empty
- [x] Data persists across page reloads
- [x] Data syncs across tabs (visibilitychange)
- [x] No infinite re-render loops
- [x] No console errors
- [x] Responsive on mobile/tablet/desktop
- [x] Animations work smoothly

---

## Files Modified/Created

### Created

- `src/modules/games/components/favorite-button/favorite-button.tsx`
- `src/modules/games/components/favorite-button/index.ts`
- `src/modules/games/components/track-recently-played/track-recently-played.tsx`
- `src/modules/games/components/track-recently-played/index.ts`
- `src/modules/games/components/games-list/games-list.tsx`
- `src/modules/games/components/games-list/index.ts`
- `src/shared/lib/local-storage.ts`
- `src/app/wishlist/page.tsx`
- `src/app/recently-played/page.tsx`

### Modified

- `src/modules/games/components/index.ts` - Added exports
- `src/shared/lib/index.ts` - Added exports
- `src/shared/ui/layout/header/header.tsx` - Added Wishlist/Played links
- `src/app/games/[slug]/page.tsx` - Added FavoriteButton and TrackRecentlyPlayed
- `src/modules/games/components/game-actions/game-actions.tsx` - Removed wrapper div

---

## Summary

✅ **Wishlist Feature** - Fully implemented with add/remove functionality and dedicated page
✅ **Recently Played Feature** - Fully implemented with auto-tracking and dedicated page
✅ **Reusable Components** - GamesList component for code reuse
✅ **localStorage Persistence** - Data persists across sessions
✅ **Responsive Design** - Works on all screen sizes
✅ **Error Handling** - Graceful fallbacks for localStorage issues
✅ **Performance** - Optimized state management and updates
✅ **User Experience** - Smooth animations and visual feedback
