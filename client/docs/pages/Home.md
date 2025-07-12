# Home Page

## Overview

The Home page serves as the main landing page for the VISOR application, providing users with a comprehensive view of all available presets and film simulations. It features a content type toggle and a dynamic content grid that loads and displays content based on user preferences.

## File Location

`src/pages/Home.tsx`

## Key Features

### Content Type Toggle

- **Component**: `ContentTypeToggle`
- **Purpose**: Allows users to filter content by type (All, Presets, Film Simulations)
- **Location**: Top of the page, above the content grid
- **Functionality**:
  - Switches between different content types
  - Updates the global content type context
  - Provides visual feedback for the current selection

### Content Grid Loader

- **Component**: `ContentGridLoader`
- **Purpose**: Dynamically loads and displays content based on the selected content type
- **Features**:
  - Responsive grid layout
  - Lazy loading for performance
  - Handles both presets and film simulations
  - Displays content cards with thumbnails and metadata

### Responsive Design

- **Container**: Uses Material-UI's `Container` with `maxWidth="xl"`
- **Responsive Padding**: Adapts padding based on screen size
  - Mobile: `px: 2`
  - Small screens: `px: 3`
  - Medium and larger: `px: 4`
- **Data Attributes**: Includes `data-cy="home-page"` for Cypress testing

## Layout Structure

```tsx
<Container
  maxWidth="xl"
  sx={{ mt: 2, mb: 6, width: "100%", maxWidth: "100vw" }}
>
  <ContentTypeToggle />
  <ContentGridLoader contentType={contentType} />
</Container>
```

## State Management

### Content Type Context

- **Hook**: `useContentType()` from `../context/ContentTypeFilter`
- **Purpose**: Manages the current content type selection globally
- **Values**: "all", "presets", "films"

### Content Loading

- **Component**: `ContentGridLoader`
- **Props**: Receives `contentType` from context
- **Behavior**: Automatically loads appropriate content based on type

## User Experience

### Initial Load

1. Page loads with default content type (usually "all")
2. Content grid displays loading state
3. Content loads and displays in responsive grid

### Content Filtering

1. User clicks content type toggle
2. Context updates with new content type
3. Content grid re-renders with filtered content
4. Smooth transition between content types

### Performance Optimizations

- Lazy loading of content
- Responsive image loading
- Efficient re-rendering based on content type changes

## Integration Points

### Context Dependencies

- `ContentTypeFilter` context for content type management
- Global state management for content preferences

### Component Dependencies

- `ContentTypeToggle`: Handles content type selection
- `ContentGridLoader`: Manages content display and loading

### Testing

- Cypress test selectors included for automated testing
- `data-cy="home-page"` attribute for page identification

## Accessibility Features

- Semantic HTML structure
- Proper heading hierarchy
- Keyboard navigation support
- Screen reader compatibility

## Error Handling

- Graceful handling of content loading failures
- Fallback states for missing content
- Error boundaries for component failures

## Future Enhancements

- Featured content section
- Recently viewed items
- Personalized recommendations
- Quick search functionality
- Content categories and tags
