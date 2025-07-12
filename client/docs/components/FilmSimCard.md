# FilmSimCard Component

## Overview

The `FilmSimCard` component is a specialized card display for Fujifilm film simulation recipes that provides an interactive, visually appealing way to showcase film simulation settings and metadata. It features dynamic color extraction from thumbnail images, responsive design for mobile and desktop, and comprehensive interaction patterns including navigation, list management, and tag filtering.

## File Location

```
src/components/FilmSimCard.tsx
```

## Props Interface

```typescript
interface FilmSimCardProps {
  id: string; // Unique identifier for list operations
  name: string; // Film simulation name
  slug: string; // URL slug for navigation
  description: string; // Film simulation description
  thumbnail: string; // Thumbnail image URL
  tags?: Array<{
    // Optional array of tags
    id?: string;
    displayName: string;
  }>;
  creator?: {
    // Optional creator information
    username: string;
    avatar?: string;
    id?: string;
  };
  settings?: {
    // Optional film simulation settings
    dynamicRange?: string;
    highlight?: string;
    shadow?: string;
    colour?: string;
    sharpness?: string;
    noiseReduction?: string;
    grainEffect?: string;
    clarity?: string;
    whiteBalance?: string;
    wbShift?: {
      r: number;
      b: number;
    };
  };
}
```

## Key Features

### 🎨 Visual Design

- **Aspect Ratio**: 2:3 ratio for portrait-oriented film simulation cards
- **Dynamic Color Extraction**: Uses `useImageColor` hook to extract dominant colors from thumbnails
- **Progressive Color Display**: Smooth color transitions with 800ms easing
- **Responsive Typography**: Bold title with enhanced text shadows for readability
- **Semi-transparent Overlays**: Subtle overlays for text readability over images

### 📱 Responsive Interaction

- **Desktop**: Direct navigation on click, hover states for additional options
- **Mobile**: Two-tap interaction (first tap shows options, second tap navigates)
- **Touch Optimization**: Larger touch targets and mobile-specific behavior
- **Auto-hide Options**: Desktop options auto-hide after 3 seconds

### 🔗 Navigation & Actions

- **Film Sim Detail Navigation**: Click to navigate to `/filmsim/${slug}`
- **Creator Profile Navigation**: Click avatar to navigate to creator profile
- **Tag Filtering**: Click tags to search for similar film simulations
- **List Management**: Add film simulation to user lists via dialog

### 🎯 User Experience

- **Loading States**: Placeholder image handling for missing thumbnails
- **Error Handling**: Graceful fallbacks for missing images or data
- **Accessibility**: Proper ARIA labels and keyboard navigation support
- **Performance**: Optimized image loading with FastImage component

## Usage Examples

### Basic Usage

```tsx
<FilmSimCard
  id="filmsim123"
  name="Classic Chrome"
  slug="classic-chrome-simulation"
  description="Fujifilm Classic Chrome film simulation"
  thumbnail="https://cloudinary.com/filmsim-thumbnail.jpg"
  tags={[
    { displayName: "classic" },
    { displayName: "chrome" },
    { displayName: "vintage" },
  ]}
  creator={{
    username: "fujifan",
    avatar: "https://avatar.jpg",
    id: "user123",
  }}
/>
```

### With Settings

```tsx
<FilmSimCard
  id="filmsim456"
  name="Provia/Standard"
  slug="provia-standard-simulation"
  description="High contrast, vibrant colors"
  thumbnail="https://cloudinary.com/provia-thumbnail.jpg"
  settings={{
    dynamicRange: "100%",
    highlight: "+1",
    shadow: "+1",
    colour: "+2",
    sharpness: "+1",
    noiseReduction: "-2",
    grainEffect: "Off",
    clarity: "0",
    whiteBalance: "Auto",
    wbShift: { r: 0, b: 0 },
  }}
  tags={[{ displayName: "provia" }]}
/>
```

### Minimal Usage

```tsx
<FilmSimCard
  id="filmsim789"
  name="Simple Film Sim"
  slug="simple-film-sim"
  description="Basic film simulation"
  thumbnail="https://thumbnail.jpg"
/>
```

## Component Structure

### State Management

```typescript
const [loaded, setLoaded] = useState(false);
const [addToListOpen, setAddToListOpen] = useState(false);
const [showOptions, setShowOptions] = useState(false);
const [isMobile, setIsMobile] = useState(false);
const [showColor, setShowColor] = useState(false);
```

### Key Functions

- **`handleClick`**: Handles navigation based on device type
- **`handleAddToList`**: Opens list management dialog
- **`handleCloseDialog`**: Closes list management dialog
- **Mobile Detection**: Uses `window.matchMedia("(hover: none)")`

### Image Processing

```typescript
// Dynamic color extraction with delay
const { offWhiteColor, isAnalyzing } = useImageColor(thumbnail);

React.useEffect(() => {
  if (!isAnalyzing && offWhiteColor) {
    const timer = setTimeout(() => {
      setShowColor(true);
    }, 100);
    return () => clearTimeout(timer);
  } else {
    setShowColor(false);
  }
}, [isAnalyzing, offWhiteColor]);
```

## Styling & Theming

### Material-UI Integration

- **Card Component**: Primary container with hover effects and transitions
- **Typography**: Consistent text hierarchy with enhanced shadows
- **IconButton**: Add to list functionality with hover states
- **Avatar**: Creator profile display with fallback initials
- **Chip**: Tag display with hover effects and navigation

### Custom Styling

```typescript
sx={{
  position: "relative",
  aspectRatio: "2/3",
  borderRadius: 1,
  overflow: "hidden",
  cursor: "pointer",
  transition: "transform 0.2s ease-in-out, boxShadow 0.2s ease-in-out",
  "&:hover .tags-container": { opacity: 1 },
  "&:hover .creator-avatar": { opacity: 1 },
  "&:hover .add-to-list-button": { opacity: 1 },
  "@media (hover: none)": {
    // Mobile-specific styles
  }
}}
```

### Color System

- **Dynamic Colors**: Extracted from thumbnail images using `useImageColor`
- **Fallback Colors**: Default white/transparent when analysis fails
- **Transition Timing**: 800ms ease-in-out for color changes
- **Enhanced Text Shadows**: Improved readability over images

## Performance Considerations

### Image Optimization

- **FastImage Component**: High-performance image loading
- **Aspect Ratio**: Consistent 2:3 ratio for layout stability
- **Object Fit**: Cover mode for consistent image display
- **Placeholder Handling**: Fallback for missing thumbnails

### State Optimization

- **Mobile Detection**: Efficient resize listener with cleanup
- **Color Analysis**: Lightweight color extraction with delays
- **Event Handling**: Proper event propagation control
- **Memory Management**: Cleanup timers and event listeners

### Rendering Optimization

- **Conditional Rendering**: Creator avatar only when data exists
- **Tag Limiting**: Maximum 3 tags displayed for performance
- **Lazy Loading**: Images load only when needed
- **Memoization**: Consider React.memo for list rendering

## Error Handling

### Image Errors

- **Placeholder Fallback**: Default image when thumbnail fails
- **URL Validation**: Safe handling of missing thumbnail URLs
- **Loading States**: Visual feedback during image loading
- **Error Boundaries**: Graceful degradation for image failures

### Data Validation

- **Optional Creator**: Graceful handling of missing creator data
- **Tag Safety**: Safe iteration over tag arrays with defaults
- **Navigation Safety**: Valid slug checking before navigation
- **Settings Validation**: Optional settings object handling

### User Interaction Errors

- **Event Propagation**: Proper stopPropagation for nested clicks
- **Navigation Guards**: Prevent navigation during dialog operations
- **Mobile Fallbacks**: Touch event handling for mobile devices
- **Dialog State**: Proper dialog state management

## Accessibility Features

### ARIA Support

- **Data Attributes**: `data-cy="filmsim-card"` for testing
- **Alt Text**: Descriptive alt text for images
- **Keyboard Navigation**: Tab order and focus management
- **Screen Reader**: Proper semantic structure

### Screen Reader Support

- **Semantic Structure**: Proper heading hierarchy
- **Descriptive Text**: Clear labels for interactive elements
- **State Announcements**: Dynamic content changes announced
- **Navigation Context**: Clear indication of clickable elements

### Visual Accessibility

- **Color Contrast**: Enhanced text shadows for readability
- **Focus Indicators**: Visible focus states for keyboard users
- **Touch Targets**: Adequate size for mobile interaction
- **Visual Hierarchy**: Clear distinction between elements

## Testing Integration

### Cypress Testing

```typescript
// Test selectors
data-cy="filmsim-card"     // Main card container
data-cy="filmsim-image"    // Film simulation image element
```

### Test Scenarios

1. **Navigation Testing**: Verify film simulation detail page navigation
2. **Mobile Interaction**: Test two-tap mobile behavior
3. **List Management**: Test add to list functionality
4. **Tag Filtering**: Test tag click navigation
5. **Creator Navigation**: Test avatar click to profile
6. **Image Loading**: Test placeholder and error states
7. **Settings Display**: Test settings object rendering

### Performance Testing

- **Image Load Times**: Monitor FastImage performance
- **Color Analysis**: Test useImageColor hook efficiency
- **Memory Usage**: Check for memory leaks in event listeners
- **Mobile Performance**: Test touch interaction responsiveness

## Dependencies

### Internal Dependencies

- **`useImageColor`**: Custom hook for color extraction
- **`FastImage`**: High-performance image component
- **`AddToListDialog`**: List management dialog component
- **React Router**: Navigation functionality

### External Dependencies

- **Material-UI**: Card, Typography, Box, Chip, Stack, Avatar, IconButton
- **React Router**: useNavigate hook
- **Material-UI Icons**: AddIcon

### GraphQL Integration

- **Data Structure**: Compatible with film simulation query results
- **Navigation**: Uses slug-based routing
- **List Management**: Integrates with user list mutations
- **Settings Display**: Optional settings object for detailed view

## Future Enhancements

### Planned Features

1. **Settings Preview**: Quick settings overview on hover
2. **Video Support**: Animated previews for film simulations
3. **Advanced Filtering**: Multi-tag selection and filtering
4. **Social Features**: Like, share, and comment integration
5. **Batch Operations**: Multi-select for list management

### Performance Improvements

1. **Virtual Scrolling**: For large film simulation lists
2. **Image Preloading**: Predictive image loading
3. **Color Caching**: Persistent color analysis results
4. **Bundle Optimization**: Code splitting for card components

### UX Enhancements

1. **Gesture Support**: Swipe actions for mobile
2. **Keyboard Shortcuts**: Enhanced keyboard navigation
3. **Animation Refinements**: Smoother transitions
4. **Accessibility**: Enhanced screen reader support
5. **Settings Tooltips**: Hover tooltips for settings values

---

_This component is a core part of the VISOR application's film simulation display system and should be maintained with careful attention to performance and user experience._
