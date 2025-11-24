# Game Hosting Website

A modern game hosting website built with Next.js 15+, React, TypeScript, and Tailwind CSS. Browse and play games embedded from GameDistribution.com.

## Features

- 🎮 Browse games in a responsive grid layout
- 🔍 Real-time search functionality
- 🏷️ Filter games by category
- 🎯 Featured/popular games section
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🎮 Game detail pages with embedded iframe players
- 🔍 Fullscreen game mode
- ⚡ Optimized performance with Next.js Image optimization
- 🧪 E2E testing with Playwright

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: SQLite with Drizzle ORM
- **Styling**: Tailwind CSS
- **Code Quality**: ESLint + Prettier
- **Testing**: Playwright (E2E)
- **State Management**: React Context API / Zustand

## Project Structure

```
gamer-boy/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── games/        # Game detail pages
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/        # React components
│   │   └── games/        # Game-specific components
│   ├── lib/              # Utilities and helpers
│   │   └── games.ts      # Game data and functions
│   ├── types/            # TypeScript type definitions
│   │   └── game.ts       # Game types
│   └── data/             # Static data (optional)
├── e2e/                  # E2E tests (Playwright)
├── public/               # Static assets
└── ...
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd gamer-boy
```

2. Install dependencies:

```bash
npm install
```

3. Set up Playwright browsers (for E2E testing):

```bash
npx playwright install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run test:e2e` - Run E2E tests
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:e2e:headed` - Run E2E tests in headed mode
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio to view/edit database
- `npm run scrape:games` - Scrape games from GameDistribution.com

## Database

This project uses **SQLite** with **Drizzle ORM** for data management. The database file (`games.db`) is created automatically when you run migrations.

### Viewing the Database

To view and edit the database using Drizzle Studio (visual database browser):

```bash
npm run db:studio
```

This will open a web interface at `http://localhost:4983` where you can:

- Browse all games and categories
- View relationships between tables
- Edit data directly
- Run queries

### Database Schema

- **categories** table: Stores game categories (Action, Puzzle, Arcade, etc.)
- **games** table: Stores game data with foreign key to categories

### Adding Games

#### Option 1: Using the Scraper Script (Recommended)

The scraper has two modes:

**Load from JSON (default - fast):**

```bash
npm run scrape:games
```

This loads games from `src/data/games.json` if it exists. Perfect for quick setup!

**Fresh scrape from GameDistribution.com:**

```bash
npm run scrape:games:fresh
```

This will:

1. Visit GameDistribution.com and scrape game listings
2. Visit each game's individual page to extract genres
3. Create categories from the official genre list (26 genres)
4. Save scraped data to `src/data/games.json` for future use
5. Insert games into the database

**Note:** Fresh scraping visits individual game pages, so it takes longer but provides accurate genre data. The JSON file serves as fallback/starter data so you don't need to scrape every time.

#### Option 2: Manual Addition via Drizzle Studio

1. Run `npm run db:studio`
2. Navigate to the `games` table
3. Click "Add row" and fill in the game data
4. Make sure to select an existing `category_id`

#### Option 3: Programmatically

You can add games programmatically by importing the database:

```typescript
import { db } from "@/db/index";
import { games } from "@/db/schema";

await db.insert(games).values({
  id: "unique-game-id",
  title: "Game Title",
  description: "Game description",
  thumbnail: "https://example.com/thumbnail.jpg",
  iframeUrl: "https://html5.gamedistribution.com/[game-id]",
  categoryId: "action", // Must match an existing category id
});
```

## Game Categories/Genres

Games are categorized using the official GameDistribution.com genres:

- Casual, Puzzle, Adventure, Dress-up, Racing & Driving, Shooter, Agility, Simulation, Battle, Art, Match-3, .IO, Mahjong & Connect, Strategy, Care, Sports, Cards, Football, Cooking, Bubble Shooter, Educational, Jigsaw, Merge, Boardgames, Basketball, Quiz

Games can have multiple genres/categories.

## E2E Testing

E2E tests are located in the `e2e/` directory and use Playwright.

Run tests:

```bash
npm run test:e2e
```

Run tests with UI:

```bash
npm run test:e2e:ui
```

## Code Quality

This project uses:

- **ESLint** for linting (Next.js config + Prettier integration)
- **Prettier** for code formatting
- **TypeScript** strict mode (no `any` types)

Format code:

```bash
npm run format
```

Check linting:

```bash
npm run lint
```

## Features Implemented

- ✅ Next.js 15+ with App Router
- ✅ TypeScript (strict mode)
- ✅ Tailwind CSS
- ✅ ESLint + Prettier
- ✅ E2E testing setup (Playwright)
- ✅ Project structure with `src/` directory
- ✅ Type definitions for games
- ✅ Game data utilities

## Features to Implement

- [ ] Home page with game grid
- [ ] Search functionality
- [ ] Category filtering
- [ ] Game detail/play page
- [ ] Responsive iframe player
- [ ] Fullscreen mode
- [ ] Related games section
- [ ] Error handling
- [ ] Loading states
- [ ] Navigation header
- [ ] (Optional) Dark mode
- [ ] (Optional) Favorites (localStorage)
- [ ] (Optional) Recently played games

## Contributing

1. Follow the code style (ESLint + Prettier)
2. Write TypeScript with strict types (no `any`)
3. Write E2E tests for new features
4. Keep components small and focused
5. Use Server Components by default, Client Components only when needed

## License

MIT
