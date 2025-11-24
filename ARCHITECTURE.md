# Project Architecture

## Overview

This project follows a modular architecture with clear separation between shared resources and feature-specific modules. The structure promotes reusability, maintainability, and scalability.

## Directory Structure

```
gamer-boy/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home page
│   │   ├── layout.tsx         # Root layout
│   │   ├── loading.tsx        # Loading state
│   │   ├── error.tsx          # Error boundary
│   │   └── not-found.tsx      # 404 page
│   │
│   ├── shared/                 # Shared resources across modules
│   │   ├── ui/                # Shared UI components
│   │   │   ├── layout/        # Layout components
│   │   │   │   └── header/
│   │   │   │       ├── header.tsx
│   │   │   │       └── index.ts
│   │   │   ├── search-bar/
│   │   │   │   ├── search-bar.tsx
│   │   │   │   └── index.ts
│   │   │   ├── category-filter/
│   │   │   │   ├── category-filter.tsx
│   │   │   │   └── index.ts
│   │   │   ├── game-card/
│   │   │   │   ├── game-card.tsx
│   │   │   │   ├── game-card-error-boundary.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts       # Barrel export
│   │   │
│   │   ├── hooks/             # Shared custom hooks
│   │   │   ├── use-debounce.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── types/             # Shared TypeScript types
│   │   │   ├── game.ts
│   │   │   └── index.ts
│   │   │
│   │   └── lib/               # Shared utilities
│   │       └── index.ts
│   │
│   ├── modules/                # Feature modules
│   │   └── games/             # Games module
│   │       ├── components/    # Game-specific components
│   │       └── lib/           # Game-specific logic
│   │           ├── games.ts   # Game data functions
│   │           └── index.ts
│   │
│   ├── db/                     # Database configuration
│   │   ├── schema.ts          # Drizzle schema
│   │   └── index.ts           # DB instance
│   │
│   └── data/                   # Static/fallback data
│       └── games.json
│
├── scripts/                    # Utility scripts
│   └── scrape-games.ts
│
├── e2e/                        # E2E tests
│   └── example.spec.ts
│
└── public/                     # Static assets
```

## Architecture Principles

### 1. Shared Resources (`src/shared/`)

Contains reusable resources that can be used across multiple modules:

#### **UI Components** (`shared/ui/`)

- All UI components follow kebab-case naming
- Each component lives in its own folder
- Related components are grouped together
- Each folder contains:
  - Component file (e.g., `search-bar.tsx`)
  - Index file for exports
  - Related components (e.g., error boundaries, variants)

**Naming Convention:**

- Files: `kebab-case` (e.g., `search-bar.tsx`, `game-card.tsx`)
- Components: `PascalCase` (e.g., `SearchBar`, `GameCard`)
- Folders: `kebab-case` (e.g., `search-bar/`, `game-card/`)

**Example Structure:**

```
shared/ui/
├── search-bar/
│   ├── search-bar.tsx         # Main component
│   └── index.ts               # Export
├── game-card/
│   ├── game-card.tsx          # Main component
│   ├── game-card-error-boundary.tsx  # Related component
│   └── index.ts               # Exports both
└── layout/
    └── header/
        ├── header.tsx
        └── index.ts
```

#### **Hooks** (`shared/hooks/`)

- Custom React hooks
- Reusable across all modules
- Follow `use-*` naming convention
- Files use kebab-case (e.g., `use-debounce.ts`)

#### **Types** (`shared/types/`)

- Shared TypeScript types and interfaces
- Common data structures
- Type utilities

#### **Lib** (`shared/lib/`)

- Shared utility functions
- Helper functions
- Constants

### 2. Feature Modules (`src/modules/`)

Each module is self-contained and represents a specific feature or domain:

#### **Games Module** (`modules/games/`)

```
modules/games/
├── components/        # Game-specific components
├── lib/              # Game business logic
│   ├── games.ts     # Data fetching, CRUD operations
│   └── index.ts     # Exports
└── types/           # Game-specific types (if needed)
```

**Module Principles:**

- Self-contained: Each module can work independently
- Uses shared resources from `src/shared/`
- Exports public API through index files
- Internal implementation details are private

### 3. Database (`src/db/`)

Database configuration and schema:

- `schema.ts`: Drizzle ORM schema definitions
- `index.ts`: Database instance and connection

### 4. App Router (`src/app/`)

Next.js App Router pages and layouts:

- Server Components by default
- Client Components marked with `'use client'`
- Co-located loading and error states

## Import Paths

### TypeScript Path Aliases

Configured in `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/shared/*": ["./src/shared/*"],
    "@/modules/*": ["./src/modules/*"],
    "@/db/*": ["./src/db/*"]
  }
}
```

### Import Examples

```typescript
// Shared UI components
import { Header, SearchBar, GameCard } from "@/shared/ui";

// Shared hooks
import { useDebounce } from "@/shared/hooks";

// Shared types
import type { GameWithCategories, Category } from "@/shared/types";

// Module-specific logic
import { getAllGames, searchGames } from "@/modules/games/lib";

// Database
import { db } from "@/db";
import { games, categories } from "@/db/schema";
```

## Component Organization

### Folder-per-Component Pattern

Each component gets its own folder, allowing for:

1. **Related Files Together**

   ```
   form-inputs/
   ├── text-input.tsx
   ├── autocomplete-field.tsx
   ├── date-picker.tsx
   └── index.ts
   ```

2. **Component Variants**

   ```
   button/
   ├── button.tsx
   ├── button-variants.ts
   ├── icon-button.tsx
   └── index.ts
   ```

3. **Component + Tests + Styles**
   ```
   modal/
   ├── modal.tsx
   ├── modal.test.tsx
   ├── modal.module.css
   └── index.ts
   ```

### Barrel Exports

Each folder includes an `index.ts` for clean imports:

```typescript
// shared/ui/game-card/index.ts
export { GameCard } from "./game-card";
export { GameCardErrorBoundary } from "./game-card-error-boundary";
```

Usage:

```typescript
import { GameCard, GameCardErrorBoundary } from "@/shared/ui/game-card";
```

## Naming Conventions

### Files and Folders

- **Folders**: `kebab-case` (e.g., `search-bar/`, `game-card/`)
- **Component Files**: `kebab-case.tsx` (e.g., `search-bar.tsx`)
- **Hook Files**: `use-*.ts` (e.g., `use-debounce.ts`)
- **Type Files**: `kebab-case.ts` (e.g., `game.ts`)
- **Utility Files**: `kebab-case.ts` (e.g., `format-date.ts`)

### Code

- **Components**: `PascalCase` (e.g., `SearchBar`, `GameCard`)
- **Functions**: `camelCase` (e.g., `getAllGames`, `formatDate`)
- **Hooks**: `useCamelCase` (e.g., `useDebounce`, `useLocalStorage`)
- **Types/Interfaces**: `PascalCase` (e.g., `GameWithCategories`, `Category`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RESULTS`, `API_URL`)

## Data Flow

```
┌─────────────────────────────────────────────────┐
│                   App Router                     │
│              (src/app/page.tsx)                  │
└────────────────┬────────────────────────────────┘
                 │
                 ├─► Shared UI Components
                 │   (Header, SearchBar, GameCard)
                 │
                 ├─► Module Business Logic
                 │   (getAllGames, searchGames)
                 │
                 └─► Database Layer
                     (Drizzle ORM + SQLite)
```

## Adding New Features

### 1. Shared Component

```bash
# Create folder
mkdir -p src/shared/ui/my-component

# Create files
touch src/shared/ui/my-component/my-component.tsx
touch src/shared/ui/my-component/index.ts
```

```typescript
// my-component.tsx
export function MyComponent() {
  return <div>My Component</div>;
}

// index.ts
export { MyComponent } from "./my-component";
```

### 2. New Module

```bash
# Create module structure
mkdir -p src/modules/my-feature/{components,lib,types}

# Create files
touch src/modules/my-feature/lib/index.ts
touch src/modules/my-feature/components/index.ts
```

### 3. Custom Hook

```bash
# Create hook
touch src/shared/hooks/use-my-hook.ts
```

```typescript
// use-my-hook.ts
export function useMyHook() {
  // Hook logic
}

// Add to shared/hooks/index.ts
export { useMyHook } from "./use-my-hook";
```

## Best Practices

### ✅ Do

- Use barrel exports (`index.ts`) for clean imports
- Keep components in their own folders
- Use kebab-case for files and folders
- Use PascalCase for component names
- Export types from shared/types
- Keep modules self-contained
- Use path aliases for imports

### ❌ Don't

- Mix PascalCase and kebab-case in file names
- Create deeply nested folder structures
- Put unrelated components in the same folder
- Import directly from internal module files
- Duplicate code between modules
- Create circular dependencies

## Migration from Old Structure

Old structure → New structure:

```
src/components/Header.tsx
  → src/shared/ui/layout/header/header.tsx

src/components/SearchBar.tsx
  → src/shared/ui/search-bar/search-bar.tsx

src/components/games/GameCard.tsx
  → src/shared/ui/game-card/game-card.tsx

src/hooks/useDebounce.ts
  → src/shared/hooks/use-debounce.ts

src/types/game.ts
  → src/shared/types/game.ts

src/lib/games.ts
  → src/modules/games/lib/games.ts
```

## Benefits of This Architecture

1. **Scalability**: Easy to add new modules and features
2. **Maintainability**: Clear organization and separation of concerns
3. **Reusability**: Shared components and hooks across modules
4. **Testability**: Isolated modules are easier to test
5. **Developer Experience**: Intuitive structure and clean imports
6. **Type Safety**: Centralized type definitions
7. **Consistency**: Standardized naming conventions

## Future Considerations

- Add `shared/utils/` for utility functions
- Add `shared/constants/` for app-wide constants
- Add module-specific types when needed
- Consider adding `shared/styles/` for shared CSS
- Add `shared/config/` for configuration
- Consider feature flags in modules
