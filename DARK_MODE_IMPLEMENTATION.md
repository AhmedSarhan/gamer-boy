# Dark Mode Implementation

## Overview

Dark mode has been successfully implemented using `next-themes` with localStorage persistence and proper hydration handling.

## 📦 Dependencies

- **next-themes**: ^0.4.4 - Provides theme management for Next.js with SSR support

## 🏗️ Architecture

### 1. Theme Provider (`src/shared/ui/theme-provider/`)

Wraps the entire application to provide theme context.

```typescript
// src/shared/ui/theme-provider/theme-provider.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
```

**Features:**

- Uses `class` attribute strategy (adds `dark` class to `<html>`)
- Default theme is `system` (respects OS preference)
- `enableSystem` allows automatic theme switching based on OS

### 2. Theme Toggle (`src/shared/ui/theme-toggle/`)

A button component that toggles between light and dark modes.

```typescript
// src/shared/ui/theme-toggle/theme-toggle.tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <button disabled>...</button>; // Placeholder
  }

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
```

**Features:**

- Prevents hydration mismatch by waiting for mount
- Shows sun icon in dark mode, moon icon in light mode
- Smooth transitions between themes
- Accessible with proper ARIA labels

### 3. Layout Integration (`src/app/layout.tsx`)

The theme provider wraps the entire app in the root layout.

```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Header />
          {/* ... rest of app ... */}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Key Points:**

- `suppressHydrationWarning` on `<html>` prevents warnings from theme class changes
- `ThemeProvider` wraps all content to provide theme context
- Header includes `ThemeToggle` in navigation

## 🎨 Usage in Components

### Using Tailwind Dark Mode Classes

All components can use Tailwind's `dark:` variant:

```tsx
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-gray-100">Hello World</p>
</div>
```

### Programmatic Theme Access

Use the `useTheme` hook in client components:

```tsx
"use client";

import { useTheme } from "next-themes";

export function MyComponent() {
  const { theme, setTheme, systemTheme } = useTheme();

  return (
    <button onClick={() => setTheme("dark")}>Current theme: {theme}</button>
  );
}
```

## 🔧 Configuration

### Tailwind CSS (`tailwind.config.ts`)

Already configured with `darkMode: "class"`:

```typescript
export default {
  darkMode: "class", // Uses class-based dark mode
  // ... rest of config
};
```

### Next.js Config

No special configuration needed - `next-themes` handles SSR automatically.

## 🚀 Features

✅ **Persistent Theme** - Saves preference to localStorage  
✅ **System Theme Support** - Respects OS dark mode preference  
✅ **No Hydration Mismatch** - Properly handles SSR/CSR differences  
✅ **Smooth Transitions** - CSS transitions for theme changes  
✅ **Accessible** - Proper ARIA labels and keyboard support  
✅ **Icon Feedback** - Sun/Moon icons indicate current theme

## 📍 File Locations

```
src/shared/ui/
├── theme-provider/
│   ├── theme-provider.tsx  # Theme context provider
│   └── index.ts            # Barrel export
└── theme-toggle/
    ├── theme-toggle.tsx    # Toggle button component
    └── index.ts            # Barrel export
```

## 🎯 Integration Points

1. **Header** (`src/shared/ui/layout/header/header.tsx`)
   - Theme toggle button in navigation
   - Positioned after "Recently Played" link

2. **Layout** (`src/app/layout.tsx`)
   - Theme provider wraps entire app
   - `suppressHydrationWarning` on `<html>`

3. **Barrel Export** (`src/shared/ui/index.ts`)
   - Exports `ThemeProvider` and `ThemeToggle`

## 🐛 Troubleshooting

### Hydration Mismatch

If you see hydration warnings:

1. Ensure `suppressHydrationWarning` is on `<html>`
2. Use `mounted` state in theme-dependent components
3. Render placeholder content before mount

### Theme Not Persisting

1. Check localStorage is enabled in browser
2. Verify `next-themes` is properly installed
3. Ensure `ThemeProvider` wraps your app

### Flash of Wrong Theme (FOUT)

`next-themes` automatically injects a script to prevent FOUT. If you still see it:

1. Ensure `ThemeProvider` is in the layout
2. Don't use `useTheme` in Server Components
3. Check browser console for errors

## 🔄 Theme Options

The toggle currently switches between:

- **Light Mode** - Default light theme
- **Dark Mode** - Dark theme with adjusted colors

To add more themes or customize:

1. Update `ThemeProvider` with custom themes
2. Add theme-specific CSS classes
3. Update `ThemeToggle` to cycle through themes

## 📚 Resources

- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [Tailwind Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [Next.js App Router](https://nextjs.org/docs/app)
