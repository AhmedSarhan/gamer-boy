# Quick Structure Guide

## 📁 Where to Put New Code

### Adding a Shared UI Component

```bash
# 1. Create component folder
mkdir -p src/shared/ui/my-component

# 2. Create component file (kebab-case)
touch src/shared/ui/my-component/my-component.tsx

# 3. Create index file
touch src/shared/ui/my-component/index.ts
```

```typescript
// my-component.tsx
export function MyComponent() {
  return <div>My Component</div>;
}

// index.ts
export { MyComponent } from "./my-component";

// Add to src/shared/ui/index.ts
export { MyComponent } from "./my-component";
```

### Adding a Custom Hook

```bash
# Create hook file (use-* naming)
touch src/shared/hooks/use-my-hook.ts
```

```typescript
// use-my-hook.ts
export function useMyHook() {
  // Hook logic
}

// Add to src/shared/hooks/index.ts
export { useMyHook } from "./use-my-hook";
```

### Adding a Shared Type

```typescript
// src/shared/types/my-type.ts
export interface MyType {
  id: number;
  name: string;
}

// Add to src/shared/types/index.ts
export type { MyType } from "./my-type";
```

### Adding a New Module

```bash
# Create module structure
mkdir -p src/modules/my-feature/{components,lib,types}

# Create lib file
touch src/modules/my-feature/lib/my-feature.ts
touch src/modules/my-feature/lib/index.ts
```

```typescript
// my-feature.ts
export function doSomething() {
  // Feature logic
}

// index.ts
export { doSomething } from "./my-feature";
```

## 📦 Import Patterns

### Shared Resources

```typescript
// UI Components
import { Header, SearchBar, GameCard } from "@/shared/ui";
import { MyComponent } from "@/shared/ui/my-component";

// Hooks
import { useDebounce, useMyHook } from "@/shared/hooks";

// Types
import type { GameWithCategories, Category } from "@/shared/types";

// Utils
import { myUtil } from "@/shared/lib";
```

### Module-Specific Code

```typescript
// Games module
import { getAllGames, searchGames } from "@/modules/games/lib";

// Your module
import { doSomething } from "@/modules/my-feature/lib";
```

### Database

```typescript
import { db } from "@/db";
import { games, categories } from "@/db/schema";
```

## 🎯 Naming Conventions

### Files & Folders

- ✅ `search-bar.tsx` (kebab-case)
- ✅ `use-debounce.ts` (kebab-case)
- ✅ `game-card/` (kebab-case)
- ❌ `SearchBar.tsx` (PascalCase)
- ❌ `useDebounce.ts` (camelCase)

### Components

- ✅ `function SearchBar()` (PascalCase)
- ✅ `export function GameCard()` (PascalCase)
- ❌ `function searchBar()` (camelCase)

### Functions

- ✅ `getAllGames()` (camelCase)
- ✅ `formatDate()` (camelCase)
- ❌ `GetAllGames()` (PascalCase)

### Hooks

- ✅ `useDebounce()` (useCamelCase)
- ✅ `useLocalStorage()` (useCamelCase)
- ❌ `debounce()` (missing 'use')

### Types

- ✅ `interface GameWithCategories` (PascalCase)
- ✅ `type Category` (PascalCase)
- ❌ `interface gameWithCategories` (camelCase)

## 🗂️ Folder Organization

### Component Folder Structure

```
my-component/
├── my-component.tsx           # Main component
├── my-component.test.tsx      # Tests (optional)
├── my-component.module.css    # Styles (optional)
├── my-component-variant.tsx   # Variants (optional)
└── index.ts                   # Exports
```

### Module Folder Structure

```
my-feature/
├── components/                # Feature-specific components
│   ├── my-feature-card/
│   └── my-feature-list/
├── lib/                       # Business logic
│   ├── my-feature.ts
│   └── index.ts
└── types/                     # Feature-specific types (optional)
    ├── my-feature.ts
    └── index.ts
```

## 🚀 Quick Reference

### Shared vs Module-Specific

**Use `src/shared/` when:**

- Component is used in multiple modules
- Hook is reusable across features
- Type is shared across modules
- Utility is general-purpose

**Use `src/modules/` when:**

- Code is specific to one feature
- Logic is domain-specific
- Component is only used in one module
- Type is feature-specific

### Layout Components

Layout components go in `src/shared/ui/layout/`:

```
src/shared/ui/layout/
├── header/
├── footer/
├── sidebar/
└── navigation/
```

### Form Components

Group related form components:

```
src/shared/ui/form-inputs/
├── text-input/
├── select-input/
├── date-picker/
└── autocomplete-field/
```

## 📝 Checklist for New Components

- [ ] Created folder in correct location
- [ ] Used kebab-case for file name
- [ ] Used PascalCase for component name
- [ ] Created index.ts with export
- [ ] Added to parent index.ts (if shared)
- [ ] Used TypeScript with proper types
- [ ] No linting errors
- [ ] Formatted with Prettier

## 🔍 Finding Code

### Where is...?

**UI Components** → `src/shared/ui/[component-name]/`
**Custom Hooks** → `src/shared/hooks/use-[hook-name].ts`
**Types** → `src/shared/types/[type-name].ts`
**Game Logic** → `src/modules/games/lib/games.ts`
**Database Schema** → `src/db/schema.ts`
**Pages** → `src/app/[route]/page.tsx`

## 💡 Tips

1. **Always use barrel exports** (`index.ts`) for clean imports
2. **Keep components small** - split into smaller components if needed
3. **Use TypeScript** - no `any` types
4. **Follow the pattern** - look at existing code for examples
5. **Document complex logic** - add comments for clarity
6. **Test your changes** - run `npm run lint` and `npm run format`

## 📚 More Information

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture documentation
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - What changed and why
- [README.md](./README.md) - Project overview and setup
