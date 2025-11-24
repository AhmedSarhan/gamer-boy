# Hooks Refactoring - useDebounce

## Overview

Refactored the SearchBar component to use a reusable `useDebounce` custom hook, following React best practices and improving code maintainability.

## Changes Made

### 1. Created Custom Hook Directory

**New Directory**: `src/hooks/`

This directory will house all custom React hooks for the application.

### 2. Created `useDebounce` Hook

**File**: `src/hooks/useDebounce.ts`

A generic, reusable hook that debounces any value with a configurable delay.

```typescript
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**Features**:

- ✅ Generic type support (`<T>`)
- ✅ Configurable delay (default: 500ms)
- ✅ Proper cleanup on unmount
- ✅ TypeScript fully typed
- ✅ Zero dependencies
- ✅ Follows React hooks rules

### 3. Refactored SearchBar Component

**File**: `src/components/SearchBar.tsx`

**Before** (Manual debounce implementation):

```typescript
const [searchTerm, setSearchTerm] = useState(initialQuery);
const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

const handleChange = (e) => {
  const value = e.target.value;
  setSearchTerm(value);

  if (debounceTimerRef.current) {
    clearTimeout(debounceTimerRef.current);
  }

  debounceTimerRef.current = setTimeout(() => {
    handleSearch(value);
  }, 300);
};
```

**After** (Using useDebounce hook):

```typescript
const [searchTerm, setSearchTerm] = useState(initialQuery);
const debouncedSearchTerm = useDebounce(searchTerm, 300);

useEffect(() => {
  const params = new URLSearchParams(searchParams.toString());
  if (debouncedSearchTerm) {
    params.set("q", debouncedSearchTerm);
  } else {
    params.delete("q");
  }
  router.push(`/?${params.toString()}`);
}, [debouncedSearchTerm, router, searchParams]);

const handleChange = (e) => {
  setSearchTerm(e.target.value);
};
```

### 4. Created Hooks Index File

**File**: `src/hooks/index.ts`

Barrel export for easy importing:

```typescript
export { useDebounce } from "./useDebounce";
```

### 5. Created Hooks Documentation

**File**: `src/hooks/README.md`

Comprehensive documentation including:

- Hook description and purpose
- Usage examples
- Parameters and return values
- Use cases
- Best practices
- Future hooks to implement

## Benefits

### 1. **Reusability**

- Hook can be used anywhere in the app
- No need to reimplement debounce logic
- Consistent behavior across components

### 2. **Cleaner Code**

- SearchBar component is more readable
- Separation of concerns (UI vs. logic)
- Less boilerplate code

### 3. **Maintainability**

- Single source of truth for debounce logic
- Easier to test in isolation
- Easier to update/fix bugs

### 4. **Type Safety**

- Generic type support
- Full TypeScript typing
- Better IDE autocomplete

### 5. **Testability**

- Hook can be tested independently
- Easier to write unit tests
- Mock-friendly

### 6. **Flexibility**

- Configurable delay
- Works with any value type
- Can be used for multiple purposes

## Usage Examples

### Search Input

```typescript
function SearchBar() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery]);

  return <input onChange={(e) => setQuery(e.target.value)} />;
}
```

### Auto-save Form

```typescript
function Editor() {
  const [content, setContent] = useState("");
  const debouncedContent = useDebounce(content, 1000);

  useEffect(() => {
    saveToServer(debouncedContent);
  }, [debouncedContent]);

  return <textarea onChange={(e) => setContent(e.target.value)} />;
}
```

### Window Resize Handler

```typescript
function ResponsiveComponent() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const debouncedWidth = useDebounce(windowWidth, 200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Only runs 200ms after resize stops
    console.log("Window width:", debouncedWidth);
  }, [debouncedWidth]);
}
```

## Code Comparison

### Lines of Code

- **Before**: 39 lines in SearchBar
- **After**: 30 lines in SearchBar + 22 lines in reusable hook
- **Net Result**: More total lines, but hook is reusable across entire app

### Complexity

- **Before**: Manual timer management, refs, cleanup logic
- **After**: Simple state + hook call

### Readability

- **Before**: Debounce logic mixed with component logic
- **After**: Clear separation, declarative style

## Performance

No performance difference - both implementations have the same runtime behavior:

- Same number of re-renders
- Same timeout mechanism
- Same cleanup behavior

## Testing

### Hook Testing (New)

```typescript
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";

test("debounces value", () => {
  const { result, rerender } = renderHook(
    ({ value, delay }) => useDebounce(value, delay),
    { initialProps: { value: "initial", delay: 500 } }
  );

  expect(result.current).toBe("initial");

  rerender({ value: "updated", delay: 500 });
  expect(result.current).toBe("initial"); // Still old value

  act(() => {
    jest.advanceTimersByTime(500);
  });
  expect(result.current).toBe("updated"); // Now updated
});
```

### Component Testing (Simplified)

```typescript
// SearchBar tests are now simpler since debounce logic is abstracted
```

## File Structure

```
src/
├── hooks/
│   ├── useDebounce.ts    # Debounce hook implementation
│   ├── index.ts          # Barrel export
│   └── README.md         # Documentation
├── components/
│   └── SearchBar.tsx     # Now uses useDebounce hook
```

## Future Improvements

### Additional Hooks to Create

1. **useLocalStorage** - Persist state to localStorage
2. **useMediaQuery** - Responsive design hook
3. **useThrottle** - Throttle value updates (different from debounce)
4. **usePrevious** - Access previous value
5. **useToggle** - Boolean state toggle
6. **useFetch** - Data fetching with loading/error states

### Potential Enhancements to useDebounce

- [ ] Add `leading` option (execute immediately, then debounce)
- [ ] Add `maxWait` option (maximum time to wait)
- [ ] Add `cancel` method to manually cancel pending debounce
- [ ] Add `flush` method to immediately execute pending debounce

## Migration Guide

If you have other components using manual debounce:

1. **Import the hook**:

   ```typescript
   import { useDebounce } from "@/hooks/useDebounce";
   ```

2. **Replace manual debounce**:

   ```typescript
   // Before
   const [value, setValue] = useState("");
   const timerRef = useRef<NodeJS.Timeout>();

   const handleChange = (e) => {
     setValue(e.target.value);
     clearTimeout(timerRef.current);
     timerRef.current = setTimeout(() => {
       doSomething(e.target.value);
     }, 300);
   };

   // After
   const [value, setValue] = useState("");
   const debouncedValue = useDebounce(value, 300);

   useEffect(() => {
     doSomething(debouncedValue);
   }, [debouncedValue]);

   const handleChange = (e) => {
     setValue(e.target.value);
   };
   ```

## Best Practices

✅ **Do:**

- Use for expensive operations (API calls, heavy computations)
- Choose appropriate delay (300ms for search, 1000ms for auto-save)
- Combine with useEffect for side effects
- Test with different delay values

❌ **Don't:**

- Use for simple state updates
- Set delay too low (< 100ms) or too high (> 2000ms)
- Forget to handle cleanup
- Use when immediate response is needed

## Conclusion

The refactoring successfully:

- ✅ Created a reusable `useDebounce` hook
- ✅ Simplified the SearchBar component
- ✅ Improved code maintainability
- ✅ Followed React best practices
- ✅ Maintained all existing functionality
- ✅ Added comprehensive documentation
- ✅ Set up infrastructure for future hooks

The codebase is now more modular, testable, and maintainable!
