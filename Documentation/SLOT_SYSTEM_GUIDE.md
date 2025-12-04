# Slot System - Step-by-Step Guide

## How Featured Sections Appear on the Home Page

### Step 1: App Startup (`main.tsx`)
When the app starts, `main.tsx` calls `scanRuntimeFiles()`:

```tsx
scanRuntimeFiles().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(...)
});
```

### Step 2: Scanner Discovers Runtime Files (`lib/plugins/scanner.ts`)
The scanner uses Vite's `import.meta.glob` to find all `*.runtime.tsx` files:

```tsx
const runtimeModules = import.meta.glob(["./src/**/*.runtime.{ts,tsx}"], {
  eager: true  // Loads and executes immediately
});
```

**Files Found:**
- `src/routes/home/home.runtime.tsx` ✅
- `src/plugins/home/home-page-defaults.runtime.tsx` ✅
- `src/routes/filmsim/filmsim-detail.runtime.tsx`
- `src/plugins/cards/filmsim-card-defaults.runtime.tsx`
- etc.

### Step 3: Runtime Files Execute
When `home.runtime.tsx` loads, it immediately executes:

```tsx
// This code runs immediately when the file is imported
HomePageFeaturedSection.plug(
  <Box key="filmsim-section">
    <FeaturedHeroSection type="filmsim" />
  </Box>,
  10  // Priority: lower = renders first
);

HomePageFeaturedSection.plug(
  <Box key="list-section">
    <FeaturedListHero />
  </Box>,
  20
);

HomePageFeaturedSection.plug(
  <Box key="preset-section">
    <FeaturedHeroSection type="preset" />
  </Box>,
  30
);
```

### Step 4: Components Register in Slot Registry
Each `.plug()` call:
1. Creates a unique ID for the component
2. Adds it to the `slotRegistry` Map
3. Sorts by priority (10, 20, 30)
4. **Notifies all listeners** (triggers React re-renders)

```tsx
plug(component, priority) {
  // Add to registry
  slotRegistry.set(name, items);
  
  // Notify React components to re-render
  notifySlotChange(name);
}
```

### Step 5: Home Route Renders (`routes/home/home-route.tsx`)
The HomeRoute component renders:

```tsx
<HomePageFeaturedSection.Slot />
```

### Step 6: Slot Component Fetches Items
The `Slot` component calls `useItems()`:

```tsx
Slot: ({ Container, children, ...props }) => {
  const items = slot.useItems();  // React hook with state!
  
  // items = [
  //   { component: <Box><FeaturedHeroSection type="filmsim" /></Box>, priority: 10 },
  //   { component: <Box><FeaturedListHero /></Box>, priority: 20 },
  //   { component: <Box><FeaturedHeroSection type="preset" /></Box>, priority: 30 }
  // ]
```

### Step 7: Items Are Rendered
The Slot component renders all items in priority order:

```tsx
const renderedComponents = filteredItems.map((item) => {
  return React.cloneElement(item.component, {
    key: item.id,
    ...props,
    ...item.component.props,
  });
});

return (
  <>
    {children}
    {renderedComponents}  // All 3 sections render here!
  </>
);
```

## The Fix: Reactive State Management

**Problem:** `useItems()` was just returning an array, so React didn't know when items were added.

**Solution:** Made `useItems()` a proper React hook with state:

```tsx
useItems(): SlotItem[] {
  const [items, setItems] = React.useState(() => 
    slotRegistry.get(name) || []
  );

  React.useEffect(() => {
    // Subscribe to slot changes
    const updateItems = () => {
      setItems([...(slotRegistry.get(name) || [])]);
    };
    listeners.add(updateItems);
    
    return () => listeners.delete(updateItems);
  }, [name]);

  return items;
}
```

Now when `.plug()` is called:
1. Item is added to registry
2. `notifySlotChange(name)` is called
3. All listeners (including `useItems()`) are notified
4. `setItems()` updates state
5. React re-renders the Slot component
6. New items appear! 🎉

## Debugging Checklist

If slots aren't showing:

1. **Check console for runtime file loading:**
   ```
   ✅ Loaded runtime file: ./src/routes/home/home.runtime.tsx
   ```

2. **Check console for plug registrations:**
   ```
   🔌 Plugged into slot "HomePageFeaturedSection" (priority: 10, total items: 1)
   🔌 Plugged into slot "HomePageFeaturedSection" (priority: 20, total items: 2)
   🔌 Plugged into slot "HomePageFeaturedSection" (priority: 30, total items: 3)
   ```

3. **Verify the Slot component is being used:**
   ```tsx
   <HomePageFeaturedSection.Slot />  // Must be in the JSX!
   ```

4. **Check that runtime files use path aliases:**
   ```tsx
   import { HomePageFeaturedSection } from "lib/slots/slot-definitions";
   // NOT: from "../../lib/slots/slot-definitions"
   ```

5. **Verify scanner pattern matches your files:**
   ```tsx
   // In scanner.ts
   import.meta.glob(["./src/**/*.runtime.{ts,tsx}"], { eager: true })
   ```

## File Structure

```
src/
├── main.tsx                          # Calls scanRuntimeFiles()
├── lib/
│   ├── plugins/
│   │   └── scanner.ts                # Discovers *.runtime.tsx files
│   └── slots/
│       ├── create-slot.tsx          # Core slot implementation
│       └── slot-definitions.ts       # All slot definitions
├── routes/
│   └── home/
│       ├── home-route.tsx            # Uses <HomePageFeaturedSection.Slot />
│       └── home.runtime.tsx          # Registers components
└── plugins/
    └── home/
        └── home-page-defaults.runtime.tsx  # Alternative registration
```

## Summary

1. **Scanner** finds `*.runtime.tsx` files
2. **Runtime files** execute and call `.plug()`
3. **Slot registry** stores components
4. **React hooks** subscribe to changes
5. **Slot component** renders all registered items
6. **Featured sections** appear on the page! ✨

