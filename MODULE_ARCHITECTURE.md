# Module Architecture: Shared vs Module-Specific

## Overview

This document explains the clear separation between **shared resources** and **module-specific code** in our architecture.

## The Rule

### Shared (`src/shared/`)

**Use for**: Components, hooks, types, and utilities that are **reusable across multiple modules or features**.

### Module-Specific (`src/modules/[module]/`)

**Use for**: Components, logic, and code that is **specific to one feature/domain**.

## Current Structure

```
src/
├── shared/                          # REUSABLE across modules
│   ├── ui/                         # Shared UI components
│   │   ├── layout/header/          # ✅ Used by all pages
│   │   ├── search-bar/             # ✅ Could be used anywhere
│   │   ├── category-filter/        # ✅ Could be used anywhere
│   │   └── game-card/              # ✅ Reusable game display
│   ├── hooks/                      # Shared hooks
│   │   └── use-debounce/           # ✅ Generic, reusable
│   ├── types/                      # Shared types
│   │   └── game.ts                 # ✅ Used across modules
│   └── lib/                        # Shared utilities
│
└── modules/                         # FEATURE-SPECIFIC
    └── games/                       # Games module
        ├── components/              # Game-specific components
        │   ├── game-player/        # ✅ Only for games
        │   └── related-games/      # ✅ Only for games
        ├── lib/                     # Game business logic
        │   └── games.ts            # ✅ Game data operations
        └── types/                   # Game-specific types (if needed)
```

## Why This Separation?

### Example: GamePlayer

**Question**: Why is `GamePlayer` in `modules/games/components/` and not `shared/ui/`?

**Answer**:

- ✅ **It's game-specific**: Only used in the games module
- ✅ **Tightly coupled**: Uses game-specific logic (iframe URLs, GameDistribution.com)
- ✅ **Not reusable**: Other modules won't need a game iframe player
- ✅ **Domain logic**: Contains games domain knowledge

### Example: GameCard

**Question**: Why is `GameCard` in `shared/ui/` and not `modules/games/components/`?

**Answer**:

- ✅ **Reusable**: Could be used in multiple places (home, search results, related games, favorites, etc.)
- ✅ **Generic display**: Just displays game data, no complex logic
- ✅ **Presentation only**: Pure UI component
- ✅ **Could be used by other modules**: A "favorites" module might also need to display game cards

## Decision Tree

When creating a new component, ask yourself:

```
Is this component used by multiple modules/features?
│
├─ YES → Put in shared/ui/
│   └─ Examples: Header, Button, Card, Modal, Input
│
└─ NO → Put in modules/[module]/components/
    └─ Examples: GamePlayer, CheckoutForm, UserProfile
```

## Real Examples

### ✅ Correctly Placed in `shared/ui/`

1. **Header** - Used by all pages
2. **SearchBar** - Could be used in multiple contexts
3. **CategoryFilter** - Could filter other content types
4. **GameCard** - Reusable game display component

### ✅ Correctly Placed in `modules/games/components/`

1. **GamePlayer** - Only for playing games
2. **RelatedGames** - Only for game detail pages

### ❌ Wrong Placement Examples

**Bad**: Putting `GamePlayer` in `shared/ui/`

- **Why**: It's not reusable, it's game-specific
- **Fix**: Move to `modules/games/components/`

**Bad**: Putting `GameCard` in `modules/games/components/`

- **Why**: It's reusable, could be used by favorites, search, etc.
- **Fix**: Keep in `shared/ui/`

## Import Patterns

### Importing Shared Components

```typescript
// From any module or page
import { Header, SearchBar, GameCard } from "@/shared/ui";
import { useDebounce } from "@/shared/hooks";
import type { GameWithCategories } from "@/shared/types";
```

### Importing Module-Specific Components

```typescript
// Only from within the games module or pages that use games
import { GamePlayer, RelatedGames } from "@/modules/games/components";
import { getAllGames, getGameBySlug } from "@/modules/games/lib";
```

## Module Structure

Each module should have:

```
modules/[module-name]/
├── components/          # Module-specific components
│   ├── [component-name]/
│   │   ├── [component-name].tsx
│   │   └── index.ts
│   └── index.ts        # Barrel export
│
├── lib/                # Module business logic
│   ├── [module-name].ts
│   └── index.ts
│
└── types/              # Module-specific types (optional)
    ├── [type-name].ts
    └── index.ts
```

## Games Module Example

```
modules/games/
├── components/
│   ├── game-player/           # Iframe player with fullscreen
│   │   ├── game-player.tsx
│   │   └── index.ts
│   ├── related-games/         # Related games section
│   │   ├── related-games.tsx
│   │   └── index.ts
│   └── index.ts               # Export all game components
│
├── lib/
│   ├── games.ts               # Game CRUD operations
│   └── index.ts
│
└── types/                     # (Optional) Game-specific types
    └── index.ts
```

## Future Modules

When adding new features, create new modules:

### Example: User Module

```
modules/user/
├── components/
│   ├── user-profile/          # User profile display
│   ├── user-settings/         # Settings form
│   └── user-avatar/           # Avatar component
├── lib/
│   └── user.ts                # User operations
└── types/
    └── user.ts                # User types
```

### Example: Favorites Module

```
modules/favorites/
├── components/
│   ├── favorites-list/        # List of favorite games
│   ├── favorite-button/       # Add/remove favorite
│   └── favorites-grid/        # Grid display
├── lib/
│   └── favorites.ts           # Favorites operations (localStorage)
└── types/
    └── favorite.ts            # Favorite types
```

**Note**: Both would **reuse** `GameCard` from `shared/ui/`!

## Benefits of This Approach

### 1. **Clear Ownership**

- Easy to know where code belongs
- No confusion about placement
- Clear module boundaries

### 2. **Reusability**

- Shared components are truly reusable
- Module components are focused
- No unnecessary coupling

### 3. **Scalability**

- Easy to add new modules
- Modules don't interfere with each other
- Clear dependencies

### 4. **Maintainability**

- Changes to module components don't affect others
- Shared components have clear contracts
- Easy to refactor

### 5. **Team Collaboration**

- Different teams can own different modules
- Shared components have clear owners
- Less merge conflicts

## Guidelines

### When to Create a Module

Create a new module when:

- ✅ You have a distinct feature/domain
- ✅ The feature has its own business logic
- ✅ The feature has specific components
- ✅ The feature could be developed independently

### When to Add to Shared

Add to shared when:

- ✅ Component is used in 2+ modules
- ✅ Component is generic/reusable
- ✅ Component has no business logic
- ✅ Component is presentation-only

### When to Keep in Module

Keep in module when:

- ✅ Component is feature-specific
- ✅ Component has domain logic
- ✅ Component is only used in one module
- ✅ Component is tightly coupled to module

## Anti-Patterns to Avoid

### ❌ Everything in Shared

**Problem**: Shared becomes a dumping ground
**Solution**: Only put truly reusable code in shared

### ❌ Everything in Modules

**Problem**: Lots of code duplication
**Solution**: Extract reusable components to shared

### ❌ Circular Dependencies

**Problem**: Module A imports from Module B, Module B imports from Module A
**Solution**: Extract common code to shared

### ❌ Shared Importing from Modules

**Problem**: Shared components depend on module code
**Solution**: Shared should never import from modules

## Dependency Flow

```
┌─────────────────┐
│   App Pages     │ ← Can import from anywhere
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│ Shared │ │ Modules  │ ← Can import from shared
└────────┘ └──────────┘
    │
    └─► Cannot import from modules
```

**Rules**:

1. ✅ Pages can import from shared and modules
2. ✅ Modules can import from shared
3. ❌ Shared cannot import from modules
4. ❌ Modules should not import from other modules (use shared instead)

## Summary

### Shared (`src/shared/`)

- **Purpose**: Reusable across the entire app
- **Examples**: Header, Button, Input, useDebounce
- **Rule**: If 2+ modules need it, it goes here

### Modules (`src/modules/[module]/`)

- **Purpose**: Feature-specific code
- **Examples**: GamePlayer, CheckoutForm, UserProfile
- **Rule**: If only one module needs it, it goes here

### The Golden Rule

> "If in doubt, start in the module. Move to shared when you need it elsewhere."

This prevents premature abstraction and keeps code focused.
