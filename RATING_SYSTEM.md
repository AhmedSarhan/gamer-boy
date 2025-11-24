# Rating System Implementation

This document describes the rating system implementation for the game hosting website.

## Overview

The rating system allows users to rate games on a scale of 1-5 stars. Ratings are anonymous but tracked using browser fingerprinting to prevent duplicate ratings from the same user.

## Architecture

### Database Schema

**`ratings` Table:**

```typescript
{
  id: integer (auto-increment primary key)
  gameId: integer (foreign key to games.id)
  userFingerprint: text (anonymous user identifier)
  rating: integer (1-5 stars)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### User Identification

Instead of requiring authentication, we use browser fingerprinting:

- **Fingerprint Components**: User agent, language, screen dimensions, color depth, timezone
- **Storage**: Fingerprints are hashed and stored in localStorage for consistency
- **Privacy**: No personally identifiable information is collected

**File**: `src/shared/lib/fingerprint.ts`

### API Routes

#### GET `/api/ratings/[gameId]`

Fetch rating statistics for a game:

```typescript
Response: {
  gameId: number;
  averageRating: number; // 0-5, rounded to 1 decimal
  totalRatings: number;
  userRating: number | null; // User's rating if fingerprint provided
}
```

#### POST `/api/ratings/[gameId]`

Submit or update a rating:

```typescript
Request: {
  rating: number; // 1-5
  fingerprint: string;
}

Response: {
  success: boolean;
  gameId: number;
  averageRating: number;
  totalRatings: number;
  userRating: number;
}
```

**File**: `src/app/api/ratings/[gameId]/route.ts`

## UI Components

### 1. RatingDisplay (Read-Only)

Displays average rating with visual stars.

**Props:**

- `averageRating: number` - Average rating (0-5)
- `totalRatings: number` - Total number of ratings
- `size?: "sm" | "md" | "lg"` - Star size
- `showCount?: boolean` - Show rating count text

**Features:**

- Partial star fills for decimal ratings (e.g., 3.7 stars)
- Responsive sizing
- Dark mode support

**File**: `src/shared/ui/rating-display/rating-display.tsx`

### 2. RatingInput (Interactive)

Allows users to submit ratings.

**Props:**

- `gameId: number` - Game database ID
- `initialRating?: number` - User's existing rating
- `onRatingSubmit?: (rating: number) => void` - Callback on successful submission
- `size?: "sm" | "md" | "lg"` - Star size

**Features:**

- Hover preview
- Optimistic UI updates
- Loading states
- Error handling with rollback

**File**: `src/shared/ui/rating-input/rating-input.tsx`

### 3. GameCardWithRating

Game card with rating overlay (optional enhancement).

**Features:**

- Fetches rating on mount
- Displays rating badge on card
- Non-blocking (doesn't affect card loading)

**File**: `src/shared/ui/game-card/game-card-with-rating.tsx`

## Integration

### Game Detail Page

The game detail page includes a dedicated rating section:

```tsx
<div className="rating-section">
  {/* Average Rating Display */}
  <RatingDisplay
    averageRating={ratingStats.averageRating}
    totalRatings={ratingStats.totalRatings}
    size="lg"
  />

  {/* User Rating Input */}
  <RatingInput
    gameId={game.id}
    initialRating={ratingStats.userRating || 0}
    onRatingSubmit={handleRatingUpdate}
    size="lg"
  />
</div>
```

**File**: `src/app/games/[slug]/game-page-client.tsx`

### Optional: Game Cards

To show ratings on game cards in the grid:

```tsx
// Replace GameCard with GameCardWithRating
<GameCardWithRating game={game} />
```

## Features

✅ **Anonymous Rating**: No login required, uses browser fingerprinting  
✅ **Duplicate Prevention**: One rating per user per game  
✅ **Real-time Updates**: Ratings update immediately after submission  
✅ **Visual Feedback**: Interactive hover states and loading indicators  
✅ **Partial Stars**: Accurate visual representation of decimal ratings  
✅ **Dark Mode**: Full support for light and dark themes  
✅ **Responsive**: Works on all screen sizes  
✅ **Error Handling**: Graceful fallbacks and retry logic

## Usage Examples

### Display Average Rating

```tsx
import { RatingDisplay } from "@/shared/ui";

<RatingDisplay
  averageRating={4.3}
  totalRatings={127}
  size="md"
  showCount={true}
/>;
```

### Allow User to Rate

```tsx
import { RatingInput } from "@/shared/ui";

<RatingInput
  gameId={42}
  initialRating={0}
  onRatingSubmit={(newAverage) => {
    console.log("New average:", newAverage);
  }}
  size="lg"
/>;
```

### Fetch Rating Data

```tsx
const response = await fetch(
  `/api/ratings/${gameId}?fingerprint=${fingerprint}`
);
const data = await response.json();
// { averageRating: 4.3, totalRatings: 127, userRating: 5 }
```

### Submit Rating

```tsx
const response = await fetch(`/api/ratings/${gameId}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    rating: 5,
    fingerprint: getUserFingerprint(),
  }),
});
```

## Database Migration

The ratings table was added via Drizzle ORM:

```bash
npm run db:push
```

This creates the `ratings` table and establishes the foreign key relationship with the `games` table.

## Future Enhancements

- **Rating Distribution**: Show histogram of 1-5 star ratings
- **Recent Ratings**: Display latest ratings with timestamps
- **Trending Games**: Sort by recent rating activity
- **Rating Filters**: Filter games by minimum rating
- **Review Comments**: Add optional text reviews alongside ratings
- **Moderation**: Flag inappropriate ratings
- **Analytics**: Track rating trends over time

## Privacy & Security

- **No PII**: No personally identifiable information is collected
- **Fingerprint Hashing**: User fingerprints are hashed for anonymity
- **Rate Limiting**: Consider adding rate limiting to prevent abuse
- **Validation**: All ratings are validated (1-5 range) server-side
- **SQL Injection**: Drizzle ORM provides protection against SQL injection

## Performance Considerations

- **Lazy Loading**: Ratings on cards are fetched after initial render
- **Caching**: Consider caching average ratings for popular games
- **Indexing**: Database indexes on `gameId` and `userFingerprint` for fast lookups
- **Aggregation**: Average ratings are calculated on-demand (consider pre-computing for scale)
