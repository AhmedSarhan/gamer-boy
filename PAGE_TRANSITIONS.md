# Page Transitions Implementation

## Overview

Smooth page transitions have been implemented using **Framer Motion** to enhance the user experience with elegant animations when navigating between pages.

## 📦 Dependencies

- **framer-motion**: ^11.x - Production-ready motion library for React

## 🎬 Animation Types

### 1. Page Transitions

**Location**: `src/shared/ui/page-transition/page-transition.tsx`

Smooth fade and slide transitions when navigating between pages:

```tsx
<PageTransition>{children}</PageTransition>
```

**Animation Details:**

- **Initial**: Opacity 0, Y position +20px (slightly below)
- **Animate**: Opacity 1, Y position 0 (normal)
- **Exit**: Opacity 0, Y position -20px (slightly above)
- **Duration**: 300ms
- **Easing**: easeInOut

**Features:**

- Uses `AnimatePresence` with `mode="wait"` to wait for exit animation before entering
- Tracks route changes via `usePathname()`
- Smooth cross-fade between pages
- Subtle vertical movement for depth

---

### 2. Stagger Animations

**Location**: `src/shared/ui/stagger-container/stagger-container.tsx`

Sequential animations for lists of items (like game cards):

```tsx
<StaggerContainer className="grid...">
  {items.map((item) => (
    <StaggerItem key={item.id}>
      <Component />
    </StaggerItem>
  ))}
</StaggerContainer>
```

**Animation Details:**

- **Container**: Fades in and staggers children
- **Stagger Delay**: 50ms between each child
- **Item Animation**: Fade in + slide up (Y: 20px → 0)
- **Duration**: 400ms per item
- **Easing**: easeOut

**Features:**

- Children animate sequentially, not all at once
- Creates a "cascading" effect
- Smooth and professional appearance
- Customizable via className prop

---

## 🎯 Implementation

### Root Layout Integration

**File**: `src/app/layout.tsx`

```tsx
<main className="flex-1 bg-gray-50 dark:bg-gray-950">
  <PageTransition>{children}</PageTransition>
</main>
```

The `PageTransition` wrapper is applied at the layout level, so all page navigations are automatically animated.

---

### Featured Games Section

**File**: `src/app/featured-games-client.tsx`

```tsx
<StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
  {games.map((game) => (
    <StaggerItem key={game.id}>
      <GameCardErrorBoundary>
        <GameCard game={game} />
      </GameCardErrorBoundary>
    </StaggerItem>
  ))}
</StaggerContainer>
```

Featured games animate in with a stagger effect on page load.

---

## 🎨 Animation Behavior

### Page Navigation Flow

1. **User clicks a link**
2. **Exit animation** starts (fade out + slide up, 300ms)
3. **Wait** for exit to complete
4. **Route changes**
5. **Enter animation** starts (fade in + slide down, 300ms)
6. **New page is visible**

### Featured Games Flow

1. **Page loads**
2. **Container fades in**
3. **First card** animates in (fade + slide up)
4. **Wait 50ms**
5. **Second card** animates in
6. **Wait 50ms**
7. **Third card** animates in
8. **Continue** for all cards

---

## 🔧 Customization

### Adjust Transition Speed

Edit `src/shared/ui/page-transition/page-transition.tsx`:

```tsx
transition={{
  duration: 0.5, // Change from 0.3 to 0.5 for slower
  ease: "easeInOut",
}}
```

### Adjust Stagger Delay

Edit `src/shared/ui/stagger-container/stagger-container.tsx`:

```tsx
transition: {
  staggerChildren: 0.1, // Change from 0.05 to 0.1 for slower
}
```

### Change Animation Direction

For horizontal slide instead of vertical:

```tsx
initial={{ opacity: 0, x: 20 }} // x instead of y
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -20 }}
```

---

## 📁 File Structure

```
src/shared/ui/
├── page-transition/
│   ├── page-transition.tsx  # Main page transition wrapper
│   └── index.ts             # Barrel export
└── stagger-container/
    ├── stagger-container.tsx  # Stagger container & item
    └── index.ts               # Barrel export

src/app/
├── layout.tsx                 # PageTransition integration
└── featured-games-client.tsx  # StaggerContainer usage
```

---

## 🎭 Animation Variants

### Current Variants

**Page Transition:**

- Fade + Slide (vertical)

**Stagger:**

- Sequential fade + slide up

### Potential Future Variants

**Scale:**

```tsx
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
```

**Rotate:**

```tsx
initial={{ opacity: 0, rotate: -5 }}
animate={{ opacity: 1, rotate: 0 }}
```

**Blur:**

```tsx
initial={{ opacity: 0, filter: "blur(10px)" }}
animate={{ opacity: 1, filter: "blur(0px)" }}
```

---

## ⚡ Performance

### Optimization Tips

1. **Use `will-change`** - Framer Motion handles this automatically
2. **Reduce motion for accessibility** - Respects `prefers-reduced-motion`
3. **Keep animations short** - 300-400ms is ideal
4. **Avoid animating expensive properties** - Stick to opacity and transforms

### Performance Characteristics

✅ **GPU Accelerated** - Uses CSS transforms  
✅ **60 FPS** - Smooth on all devices  
✅ **Lightweight** - Minimal bundle size impact  
✅ **Accessible** - Respects user preferences

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Navigate between pages (Home → Game Detail → Wishlist)
- [ ] Check animations are smooth (no jank)
- [ ] Verify stagger effect on featured games
- [ ] Test on mobile devices
- [ ] Test with slow network (animations shouldn't block)
- [ ] Test with reduced motion enabled

### Browser DevTools

1. Open DevTools → Performance
2. Record while navigating
3. Check for 60 FPS during animations
4. Look for layout shifts (should be minimal)

---

## 🎨 Design Principles

1. **Subtle, not distracting** - Animations enhance, don't dominate
2. **Fast but noticeable** - 300ms is the sweet spot
3. **Consistent direction** - Always fade + slide in same direction
4. **Purposeful** - Every animation has a reason
5. **Accessible** - Respects user preferences

---

## 📚 Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [AnimatePresence Guide](https://www.framer.com/motion/animate-presence/)
- [Stagger Children](https://www.framer.com/motion/transition/#orchestration)
- [Performance Best Practices](https://www.framer.com/motion/guide-reduce-bundle-size/)

---

## 🔮 Future Enhancements

Potential additions:

1. **Route-specific transitions** - Different animations for different routes
2. **Shared element transitions** - Game card → Game detail page
3. **Loading state animations** - Skeleton loaders with motion
4. **Gesture animations** - Swipe to navigate
5. **Scroll-triggered animations** - Animate on scroll into view
6. **Micro-interactions** - Button hovers, clicks with spring physics

---

## 🐛 Troubleshooting

### Animations Not Working

1. Check `framer-motion` is installed
2. Verify `PageTransition` is wrapping content
3. Ensure components are client components (`"use client"`)
4. Check browser console for errors

### Animations Too Fast/Slow

Adjust `duration` in transition config (see Customization section)

### Animations Causing Layout Shift

Use `layout` prop on motion components:

```tsx
<motion.div layout>
```

### Performance Issues

1. Reduce number of animated elements
2. Simplify animations (fewer properties)
3. Use `layoutId` for shared elements
4. Check for unnecessary re-renders
