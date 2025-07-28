# ContentGridLoader Component

## Overview

The `ContentGridLoader` component is a sophisticated content management system that handles data fetching, filtering, pagination, and rendering of different content types (presets, film simulations, and promotional cards). It integrates with GraphQL queries, provides infinite scrolling, and supports custom rendering while maintaining optimal performance and user experience.

## File Location

```
src/components/ContentGridLoader.tsx
```

## Props Interface

```typescript
interface ContentGridLoaderProps {
  contentType?: "all" | "presets" | "films"; // Content type filter
  filter?: Record<string, any>; // GraphQL filter parameters
  searchQuery?: string; // Search query for filtering
  customData?: Array<any>; // Custom data array (overrides GraphQL)
  renderItem?: (item: any) => React.ReactNode; // Custom render function
}
```

## Key Features

### 🚀 Data Management

- **GraphQL Integration**: Apollo Client queries for presets and film simulations
- **Content Filtering**: Filter by content type and custom criteria
- **Search Functionality**: Real-time search across content titles
- **Custom Data Support**: Override GraphQL with custom data arrays

### 📱 Infinite Scrolling

- **Pagination**: 10 items per page with infinite scroll
- **Intersection Observer**: Efficient scroll detection
- **Load More**: Automatic loading of additional content
- **Performance Optimization**: Minimal re-renders and efficient state management

### 🎨 Content Rendering

- **Multi-Type Support**: Presets, film simulations, and promotional cards
- **Custom Rendering**: Flexible render function for custom components
- **Staggered Grid**: Masonry-style layout with StaggeredGrid component
- **Responsive Design**: Mobile and desktop optimized layouts

### 🔧 Technical Features

- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Clear loading indicators and progress feedback
- **Memory Management**: Efficient cleanup and state management
- **Mobile Detection**: Responsive behavior based on device type

## Usage Examples

### Basic Usage

```tsx
<ContentGridLoader
  contentType="all"
  filter={{ category: "portrait" }}
  searchQuery="warm tones"
/>
```

### Custom Data Rendering

```tsx
<ContentGridLoader
  customData={myCustomData}
  renderItem={(item) => <CustomCard {...item} />}
/>
```

### Preset-Only View

```tsx
<ContentGridLoader
  contentType="presets"
  filter={{ creator: "photographer123" }}
/>
```

### Film Simulations Only

```tsx
<ContentGridLoader contentType="films" searchQuery="Kodak" />
```

### With Custom Filtering

```tsx
<ContentGridLoader
  contentType="all"
  filter={{
    tags: ["landscape", "warm"],
    creator: "pro_photographer",
  }}
  searchQuery="sunset"
/>
```

## Component Structure

### State Management

```typescript
const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);
const containerRef = useRef<HTMLDivElement>(null);
const [isMobile, setIsMobile] = useState(false);
```

### GraphQL Queries

```typescript
const {
  data: presetData,
  loading: loadingPresets,
  error: presetError,
} = useQuery(GET_ALL_PRESETS, {
  variables: { filter },
  skip: !!customData,
  fetchPolicy: "cache-and-network",
});

const {
  data: filmSimData,
  loading: loadingFilmSims,
  error: filmSimError,
} = useQuery(GET_ALL_FILMSIMS, {
  variables: { filter },
  skip: !!customData,
  fetchPolicy: "cache-and-network",
});
```

### Data Processing

```typescript
const combined = useMemo(() => {
  if (customData) {
    return customData;
  }

  const results: { type: "preset" | "film" | "buymeacoffee"; data: any }[] = [];

  // Process presets
  if (
    (contentType === "all" || contentType === "presets") &&
    presetData?.listPresets
  ) {
    results.push(
      ...presetData.listPresets
        .filter((p: any) => p && p.creator)
        .map((p: any) => ({
          type: "preset" as const,
          data: p,
        }))
    );
  }

  // Process film simulations
  if (
    (contentType === "all" || contentType === "films") &&
    filmSimData?.listFilmSims
  ) {
    results.push(
      ...filmSimData.listFilmSims
        .filter((f: any) => f && f.creator)
        .map((f: any) => ({
          type: "film" as const,
          data: {
            ...f,
            title: f.name,
            thumbnail: f.sampleImages?.[0]?.url || "",
            tags: f.tags || [],
          },
        }))
    );
  }

  // Add promotional card
  const buyMeACoffeeCard = {
    type: "buymeacoffee" as const,
    data: {
      id: "buymeacoffee",
      title: "Buy Me a Coffee",
    },
  };

  if (results.length > 0) {
    results.splice(0, 0, buyMeACoffeeCard);
  } else {
    results.unshift(buyMeACoffeeCard);
  }

  return searchQuery
    ? results.filter((item) =>
        item.data.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : results;
}, [customData, contentType, presetData, filmSimData, searchQuery, isMobile]);
```

## Styling & Theming

### Container Styling

```typescript
sx={{
  width: "100%",
  maxWidth: "100vw",
  overflow: "hidden",
}}
```

### Error Alert Styling

```typescript
sx={{
  my: 2, // Margin for spacing
}}
```

### Grid Integration

- **StaggeredGrid**: Masonry-style layout component
- **Responsive Columns**: Adaptive column count
- **Gap Management**: Consistent spacing between items
- **Loading States**: Integrated loading indicators

## Performance Considerations

### Optimization Strategies

- **Memoization**: useMemo for expensive data processing
- **Pagination**: Efficient pagination with 10 items per page
- **GraphQL Caching**: Apollo Client cache-and-network policy
- **Component Keys**: Proper React keys for efficient rendering

### Data Loading Performance

- **Query Skipping**: Skip queries when custom data is provided
- **Filter Optimization**: Efficient filtering and search
- **Memory Management**: Proper cleanup of event listeners
- **State Optimization**: Minimal state updates

### Rendering Performance

- **Virtual Rendering**: Only render visible items
- **Component Optimization**: Efficient component rendering
- **Image Loading**: Optimized image loading strategies
- **Event Handling**: Efficient event handling

## Error Handling

### GraphQL Errors

- **Query Errors**: Graceful handling of GraphQL query errors
- **Network Errors**: Network connectivity error handling
- **Data Errors**: Safe handling of malformed data
- **Cache Errors**: Apollo Client cache error handling

### User Experience Errors

- **Empty States**: Clear messaging for no content
- **Loading Errors**: Proper loading state management
- **Filter Errors**: Safe filter parameter handling
- **Search Errors**: Graceful search error handling

### Component Errors

- **Render Errors**: Safe custom render function handling
- **Key Errors**: Proper React key generation
- **Memory Errors**: Memory leak prevention
- **Event Errors**: Safe event listener management

## Accessibility Features

### ARIA Support

- **Grid Role**: Proper grid role for content layout
- **Loading States**: Loading state announcements
- **Error States**: Error state announcements
- **Content Labels**: Clear content labels

### Screen Reader Support

- **Loading Announcements**: Loading state announcements
- **Error Announcements**: Error state announcements
- **Content Descriptions**: Clear content descriptions
- **Navigation**: Proper navigation structure

### Keyboard Navigation

- **Tab Order**: Logical tab order through content
- **Focus Management**: Proper focus handling
- **Keyboard Shortcuts**: Enhanced keyboard controls
- **Focus Indicators**: Visible focus states

### Visual Accessibility

- **Color Contrast**: Maintains color contrast in all states
- **Loading Indicators**: Clear loading indicators
- **Error Indicators**: Clear error indicators
- **Content Hierarchy**: Clear visual hierarchy

## Testing Integration

### Cypress Testing

```typescript
// Test selectors for content grid functionality
data-cy="content-grid"             // Main content grid container
data-cy="content-item"             // Individual content item
data-cy="loading-indicator"        // Loading indicator
data-cy="error-message"            // Error message element
data-cy="empty-state"              // Empty state message
data-cy="load-more-trigger"        // Load more trigger element
```

### Test Scenarios

1. **Data Loading**: Test GraphQL data loading
2. **Content Filtering**: Test content type filtering
3. **Search Functionality**: Test search query filtering
4. **Infinite Scrolling**: Test pagination and load more
5. **Error Handling**: Test error states and recovery
6. **Custom Rendering**: Test custom render functions
7. **Accessibility**: Test screen reader and keyboard navigation
8. **Responsive**: Test different screen sizes

### Performance Testing

- **Load Times**: Monitor data loading performance
- **Memory Usage**: Check for memory leaks
- **Scroll Performance**: Test infinite scroll performance
- **Query Performance**: Test GraphQL query performance

## Dependencies

### Internal Dependencies

- **GraphQL Queries**: GET_ALL_PRESETS, GET_ALL_FILMSIMS
- **ContentTypeFilter**: Context for content type management
- **Component Cards**: PresetCard, FilmSimCard, BuyMeACoffeeCard
- **StaggeredGrid**: Layout component

### External Dependencies

- **Apollo Client**: GraphQL client for data fetching
- **Material-UI**: Alert, Box components
- **React**: Core React functionality and hooks
- **TypeScript**: Type definitions and interfaces

### Browser Support

- **Intersection Observer**: Modern browser intersection observer
- **CSS Grid**: Modern CSS grid support
- **GraphQL**: GraphQL query support
- **ES6+**: Modern JavaScript features

## Future Enhancements

### Planned Features

1. **Advanced Filtering**: More sophisticated filter options
2. **Sorting Options**: Multiple sorting algorithms
3. **Virtual Scrolling**: For very large content lists
4. **Offline Support**: Offline content caching
5. **Real-time Updates**: Live content updates

### Performance Improvements

1. **Query Optimization**: Optimized GraphQL queries
2. **Image Preloading**: Predictive image loading
3. **Bundle Splitting**: Code splitting for large components
4. **Service Worker**: Offline caching and background sync

### UX Enhancements

1. **Skeleton Loading**: Skeleton loading states
2. **Smooth Animations**: Content transition animations
3. **Advanced Search**: Full-text search capabilities
4. **Content Recommendations**: AI-powered content suggestions
5. **Social Features**: Social sharing and interaction

---

_This component provides the core content management functionality in the VISOR application, handling complex data operations while maintaining excellent performance and user experience._
