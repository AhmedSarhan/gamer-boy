# Layout Pattern Guide

## Overview

This project uses Next.js App Router's layout system to share common UI elements across pages. The `layout.tsx` file wraps all pages and provides consistent structure.

## Current Structure

### Root Layout (`src/app/layout.tsx`)

The root layout contains:

- **Header**: Shared navigation across all pages
- **Main wrapper**: Consistent background and styling
- **Font configuration**: Geist Sans and Geist Mono
- **Metadata**: Default title and description

```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="min-h-screen bg-gray-50 dark:bg-black">
          {children}
        </main>
      </body>
    </html>
  );
}
```

### Pages (`src/app/*/page.tsx`)

Pages contain only page-specific content:

- No `<Header />` - it's in the layout
- No `<main>` wrapper - it's in the layout
- Just the page content wrapped in a container

```typescript
export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page-specific content */}
    </div>
  );
}
```

## Benefits

### 1. **DRY (Don't Repeat Yourself)**

- Header is defined once, used everywhere
- No need to import/render Header on each page
- Consistent layout across all pages

### 2. **Performance**

- Layout doesn't re-render when navigating between pages
- Only page content re-renders
- Better performance and user experience

### 3. **Maintainability**

- Change header once, affects all pages
- Easy to add global UI elements (footer, sidebar, etc.)
- Consistent styling and structure

### 4. **Nested Layouts**

- Can create nested layouts for sections
- Example: `/games/layout.tsx` for games-specific layout
- Layouts compose naturally

## Adding New Pages

### Example: Categories Page

```bash
# Create page file
touch src/app/categories/page.tsx
```

```typescript
// src/app/categories/page.tsx
import { getAllCategories } from "@/modules/games/lib";
import { CategoryCard } from "@/shared/ui";

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Browse by Category</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
```

**No need to add `<Header />` - it's already in the layout!**

### Example: Game Detail Page

```bash
# Create dynamic route
mkdir -p src/app/games/[slug]
touch src/app/games/[slug]/page.tsx
```

```typescript
// src/app/games/[slug]/page.tsx
import { getGameBySlug } from "@/modules/games/lib";
import { GamePlayer } from "@/shared/ui";

export default async function GamePage({ params }) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">{game.title}</h1>
      <GamePlayer game={game} />
    </div>
  );
}
```

## Nested Layouts

You can create section-specific layouts:

```bash
# Games section layout
touch src/app/games/layout.tsx
```

```typescript
// src/app/games/layout.tsx
export default function GamesLayout({ children }) {
  return (
    <div className="games-section">
      <aside className="sidebar">{/* Games sidebar */}</aside>
      <div className="content">{children}</div>
    </div>
  );
}
```

Layout hierarchy:

```
RootLayout (Header + Main)
  └─ GamesLayout (Sidebar)
      └─ GamePage (Content)
```

## Layout vs Template

### Layout (`layout.tsx`)

- **Persists** across navigation
- **Doesn't re-render** when navigating
- Use for: Header, Footer, Navigation

### Template (`template.tsx`)

- **Re-renders** on every navigation
- Creates new instance for each route
- Use for: Animations, per-page state

## Common Patterns

### 1. Global Header/Footer

```typescript
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

### 2. Dashboard Layout

```typescript
// src/app/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

### 3. Auth Layout

```typescript
// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
```

## Best Practices

### ✅ Do

- Put shared UI in layouts (Header, Footer, Nav)
- Use layouts for consistent structure
- Create nested layouts for sections
- Keep pages focused on page-specific content

### ❌ Don't

- Duplicate Header/Footer in every page
- Put page-specific content in layouts
- Create too many nested layouts
- Use layouts for one-off pages

## Current Project Structure

```
src/app/
├── layout.tsx          # Root layout (Header + Main)
├── page.tsx            # Home page (no Header, just content)
├── loading.tsx         # Loading state
├── error.tsx           # Error boundary
├── not-found.tsx       # 404 page
│
└── games/              # Future: Games section
    ├── layout.tsx      # Games-specific layout (optional)
    ├── page.tsx        # Games list page
    └── [slug]/
        └── page.tsx    # Game detail page
```

## Migration Checklist

When creating new pages:

- [ ] Don't import/render `<Header />` in pages
- [ ] Don't wrap content in `<main>` in pages
- [ ] Use `<div className="container mx-auto px-4 py-8">` for page content
- [ ] Focus on page-specific content only
- [ ] Let the layout handle shared UI

## Example: Before vs After

### ❌ Before (Wrong)

```typescript
// page.tsx
export default function Page() {
  return (
    <>
      <Header /> {/* Don't do this! */}
      <main>
        <div className="container">Content</div>
      </main>
    </>
  );
}
```

### ✅ After (Correct)

```typescript
// layout.tsx
export default function Layout({ children }) {
  return (
    <html>
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}

// page.tsx
export default function Page() {
  return <div className="container">Content</div>;
}
```

## Resources

- [Next.js Layouts Documentation](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
- [Next.js Templates Documentation](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#templates)
