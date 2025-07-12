# StaggeredGrid Component

## Overview

The `StaggeredGrid` component is a high-performance, responsive masonry grid layout that provides optimal content distribution across multiple columns. It features intelligent column calculation, infinite scrolling with intersection observers, smooth animations with Framer Motion, and advanced shuffle functionality for content randomization. This component is the backbone of VISOR's content display system.

## File Location

```
src/components/StaggeredGrid.tsx
```

## Props Interface

```typescript
interface StaggeredGridProps {
  children: React.ReactNode[]; // Array of child components to display
  minWidth?: number; // Minimum width of cards in pixels (default: 200)
  gap?: number; // Gap between cards in pixels (default: 10)
  randomizeOrder?: boolean; // Whether to randomize item order (default: false)
  loading?: boolean; // Whether to show loading skeletons (deprecated)
  onLoadMore?: () => void; // Callback to load more items
  hasMore?: boolean; // Whether there are more items to load (default: false)
  isLoading?: boolean; // Whether more items are being loaded (default: false)
}
```

## Key Features

### 🎯 Responsive Layout

- **Dynamic Column Calculation**: Automatically adjusts columns based on screen size
- **Mobile Optimization**: 2 columns on mobile (< 700px)
- **Tablet Support**: 3 columns on tablet (700-900px)
- **Desktop Layout**: 4 columns on desktop (> 900px)
- **Debounced Resize**: Efficient window resize handling with 100ms debounce

### ♾️ Infinite Scrolling

- **Intersection Observer**: Triggers load more when user approaches bottom
- **Early Loading**: 200px margin to load content before user reaches end
- **Loading States**: Visual feedback during content loading
- **Prevention Logic**: Prevents multiple simultaneous load requests

### 🎨 Animation & Performance

- **Framer Motion**: Smooth entrance animations with staggered delays
- **CSS Containment**: Layout containment for better performance
- **Memoization**: Optimized column distribution calculation
- **Virtual Rendering**: Efficient rendering of large content lists

### 🔀 Content Shuffling

- **Chunk Preservation**: Maintains 10-card chunks for consistent experience
- **Fisher-Yates Shuffle**: Efficient randomization algorithm
- **State Persistence**: Preserves shuffle order across re-renders
- **Context Integration**: Integrates with ContentTypeFilter context

## Usage Examples

### Basic Usage

```tsx
<StaggeredGrid
  children={presetCards}
  gap={16}
  onLoadMore={handleLoadMore}
  hasMore={hasMoreItems}
  isLoading={isLoading}
/>
```

### With Customization

```tsx
<StaggeredGrid
  children={filmSimCards}
  minWidth={250}
  gap={20}
  randomizeOrder={true}
  onLoadMore={loadMoreFilmSims}
  hasMore={hasMoreFilmSims}
  isLoading={isLoadingFilmSims}
/>
```

### Minimal Usage

```tsx
<StaggeredGrid children={contentItems} />
```

## Component Structure

### State Management

```typescript
const [columnCount, setColumnCount] = useState(() => {
  // Calculate initial column count based on window width
  if (typeof window !== "undefined") {
    const windowWidth = window.innerWidth;
    if (windowWidth < 700) return 2;
    if (windowWidth < 900) return 4;
    return 5;
  }
  return 4; // fallback
});
const [isLoadingMore, setIsLoadingMore] = useState(false);
```

### Key Functions

- **`calculateColumnCount`**: Determines optimal column count based on container width
- **`updateColumns`**: Debounced column update on window resize
- **`handleResize`**: Window resize event handler with timeout cleanup

### Intersection Observers

```typescript
const { ref: triggerRef, inView } = useInView({
  triggerOnce: true,
  threshold: 0.1,
});

const { ref: loadMoreRef, inView: loadMoreInView } = useInView({
  threshold: 0.1,
  rootMargin: "200px", // Increased margin to load earlier
});
```

### Column Distribution Logic

```typescript
// Memoized column distribution to avoid recalculation
const columns = useMemo(() => {
  if (!children.length) {
    return Array.from({ length: columnCount }, () => []);
  }

  let itemIndices = Array.from({ length: children.length }, (_, i) => i);

  // Handle shuffle logic with chunk preservation
  if (randomizeOrder) {
    const chunkSize = 10;
    const shuffled: number[] = [];
    // Process items in chunks of 10 for consistent experience
    // ... shuffle logic
  }

  // Distribute items across columns
  const newColumns: number[][] = Array.from({ length: columnCount }, () => []);
  itemIndices.forEach((itemIndex, index) => {
    const columnIndex = index % columnCount;
    newColumns[columnIndex].push(itemIndex);
  });

  return newColumns;
}, [children.length, columnCount, randomizeOrder, shuffleCounter]);
```

## Styling & Theming

### CSS Grid Layout

```typescript
sx={{
  display: "grid",
  gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
  gap: `${gap}px`,
  alignItems: "start", // Ensure columns start from the top
  minHeight: "100vh", // Prevent layout shift
  contain: "layout", // CSS containment for better performance
  width: "100%", // Ensure container takes full available width
  maxWidth: "100vw", // Prevent overflow on mobile
  overflow: "hidden", // Prevent horizontal scroll
}}
```

### Animation Configuration

```typescript
// Framer Motion animation settings
initial={{ opacity: 0, y: 20 }}
animate={{
  opacity: 1,
  y: 0,
  transition: {
    delay: 0.01 * itemIndex, // Faster delay
    duration: 0.3, // Shorter duration
    ease: "easeOut", // Simpler easing
  },
}}
exit={{ opacity: 0, y: -10 }}
```

### Responsive Breakpoints

- **Mobile**: < 700px → 2 columns
- **Tablet**: 700-900px → 3 columns
- **Desktop**: > 900px → 4 columns

## Performance Considerations

### Optimization Strategies

- **Memoization**: Column distribution calculation is memoized
- **Debouncing**: Window resize events are debounced (100ms)
- **CSS Containment**: Layout containment for better performance
- **Intersection Observer**: Efficient scroll detection
- **Chunk Preservation**: Maintains shuffle consistency

### Memory Management

- **Cleanup Timers**: Proper cleanup of resize timeouts
- **Event Listeners**: Window resize listener cleanup
- **Ref Management**: Efficient use of refs for DOM access
- **State Optimization**: Minimal state updates

### Rendering Performance

- **Virtual Scrolling**: Only renders visible content
- **Animation Optimization**: Efficient Framer Motion usage
- **Grid Layout**: CSS Grid for optimal layout performance
- **Containment**: CSS containment for layout isolation

## Error Handling

### Layout Errors

- **Container Validation**: Checks for container ref before calculations
- **Window Object**: Safe window object access with fallbacks
- **Column Calculation**: Graceful handling of edge cases
- **Resize Handling**: Proper cleanup of resize listeners

### Content Errors

- **Empty Children**: Graceful handling of empty content arrays
- **Loading States**: Proper loading state management
- **Intersection Observer**: Fallback for unsupported browsers
- **Animation Errors**: Graceful animation failure handling

### Performance Errors

- **Memory Leaks**: Proper cleanup of timers and listeners
- **Infinite Loops**: Prevention of recursive updates
- **Layout Shifts**: Stable layout with proper sizing
- **Scroll Performance**: Optimized scroll handling

## Accessibility Features

### ARIA Support

- **Semantic Structure**: Proper grid layout semantics
- **Loading Indicators**: Accessible loading state announcements
- **Focus Management**: Proper focus handling during updates
- **Screen Reader**: Clear content structure for screen readers

### Keyboard Navigation

- **Tab Order**: Logical tab order through grid items
- **Focus Indicators**: Visible focus states for keyboard users
- **Navigation Support**: Keyboard navigation through content
- **Skip Links**: Consideration for skip link implementation

### Visual Accessibility

- **Layout Stability**: Stable layout to prevent disorientation
- **Loading Feedback**: Clear visual feedback during loading
- **Animation Preferences**: Respect user animation preferences
- **Color Contrast**: Maintains color contrast in loading states

## Testing Integration

### Cypress Testing

```typescript
// Test selectors for grid functionality
data-cy="staggered-grid"     // Main grid container
data-cy="grid-column"        // Individual column elements
data-cy="load-more-trigger"  // Load more trigger element
```

### Test Scenarios

1. **Responsive Testing**: Test column count changes on different screen sizes
2. **Infinite Scroll**: Test load more functionality
3. **Shuffle Testing**: Test content randomization
4. **Animation Testing**: Test entrance animations
5. **Performance Testing**: Test with large content arrays
6. **Accessibility Testing**: Test keyboard navigation and screen readers

### Performance Testing

- **Large Content Arrays**: Test with 1000+ items
- **Memory Usage**: Monitor for memory leaks
- **Scroll Performance**: Test smooth scrolling
- **Animation Performance**: Test animation frame rates

## Dependencies

### Internal Dependencies

- **`useContentType`**: Context for content type filtering
- **React Hooks**: useState, useEffect, useCallback, useMemo, useRef
- **React Router**: Navigation integration (if needed)

### External Dependencies

- **Material-UI**: Box, CircularProgress
- **React Intersection Observer**: useInView hook
- **Framer Motion**: motion, AnimatePresence

### Browser Support

- **CSS Grid**: Modern browser support required
- **Intersection Observer**: Modern browser API
- **CSS Containment**: Performance optimization feature
- **Framer Motion**: Animation library

## Future Enhancements

### Planned Features

1. **Virtual Scrolling**: For extremely large content lists
2. **Advanced Filtering**: Real-time content filtering
3. **Drag & Drop**: Reordering capabilities
4. **Custom Animations**: User-configurable animations
5. **Lazy Loading**: Progressive content loading

### Performance Improvements

1. **Web Workers**: Offload heavy calculations
2. **Intersection Observer Polyfill**: Better browser support
3. **CSS Container Queries**: More responsive layouts
4. **Bundle Optimization**: Code splitting for grid logic

### UX Enhancements

1. **Smooth Scrolling**: Enhanced scroll behavior
2. **Gesture Support**: Touch gestures for mobile
3. **Keyboard Shortcuts**: Enhanced keyboard navigation
4. **Accessibility**: Enhanced screen reader support
5. **Animation Preferences**: User-configurable animations

---

_This component is a critical performance and UX component in the VISOR application, providing the foundation for all content display grids._
