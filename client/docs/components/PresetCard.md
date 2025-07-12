# PresetCard Component

## Overview

The `PresetCard` component is a sophisticated card display for Lightroom presets that provides an interactive, visually appealing way to showcase preset information. It features dynamic color extraction from preset images, responsive design for mobile and desktop, and comprehensive interaction patterns including navigation, list management, and tag filtering.

## File Location

```
src/components/PresetCard.tsx
```

## Props Interface

```typescript
interface PresetCardProps {
  slug: string; // Unique identifier for navigation
  title: string; // Preset title/name
  afterImage?: any; // Processed image URL or object
  tags: { displayName: string }[]; // Array of preset tags
  creator?: {
    // Optional creator information
    username: string;
    avatar?: string;
    id?: string;
  };
  id?: string; // Preset ID for list operations
}
```

## Key Features

### 🎨 Visual Design

- **Aspect Ratio**: 4:5 ratio for consistent card layout
- **Dynamic Color Extraction**: Uses `useImageColor` hook to extract dominant colors from preset images
- **Progressive Color Display**: Smooth color transitions with 800ms easing
- **Responsive Typography**: Bold title with text shadows for readability
- **Gradient Overlays**: Subtle gradients for text readability over images

### 📱 Responsive Interaction

- **Desktop**: Direct navigation on click, hover states for additional options
- **Mobile**: Two-tap interaction (first tap shows options, second tap navigates)
- **Touch Optimization**: Larger touch targets and mobile-specific behavior
- **Auto-hide Options**: Desktop options auto-hide after 3 seconds

### 🔗 Navigation & Actions

- **Preset Detail Navigation**: Click to navigate to `/preset/${slug}`
- **Creator Profile Navigation**: Click avatar to navigate to creator profile
- **Tag Filtering**: Click tags to search for similar presets
- **List Management**: Add preset to user lists via dialog

### 🎯 User Experience

- **Loading States**: Placeholder image handling for missing thumbnails
- **Error Handling**: Graceful fallbacks for missing images or data
- **Accessibility**: Proper ARIA labels and keyboard navigation support
- **Performance**: Optimized image loading with FastImage component

## Usage Examples

### Basic Usage

```tsx
<PresetCard
  slug="vintage-portrait-preset"
  title="Vintage Portrait"
  afterImage="https://cloudinary.com/preset-image.jpg"
  tags={[
    { displayName: "portrait" },
    { displayName: "vintage" },
    { displayName: "warm" },
  ]}
  creator={{
    username: "photographer123",
    avatar: "https://avatar.jpg",
    id: "user123",
  }}
  id="preset123"
/>
```

### Minimal Usage

```tsx
<PresetCard
  slug="simple-preset"
  title="Simple Preset"
  tags={[{ displayName: "landscape" }]}
/>
```

## Component Structure

### State Management

```typescript
const [addToListOpen, setAddToListOpen] = useState(false);
const [showOptions, setShowOptions] = useState(false);
const [isMobile, setIsMobile] = useState(false);
const [showColor, setShowColor] = useState(false);
```

### Key Functions

- **`handleAddToList`**: Opens list management dialog
- **`handleCloseDialog`**: Closes list management dialog
- **`handleCardClick`**: Handles navigation based on device type
- **Mobile Detection**: Uses `window.matchMedia("(hover: none)")`

### Image Processing

```typescript
// Determine correct image URL with fallbacks
let imageUrl = placeholderImage;
if (afterImage) {
  if (typeof afterImage === "string") {
    imageUrl = afterImage;
  } else if (afterImage.url) {
    imageUrl = afterImage.url;
  }
}
```

## Styling & Theming

### Material-UI Integration

- **Card Component**: Primary container with hover effects
- **Typography**: Consistent text hierarchy and styling
- **IconButton**: Add to list functionality
- **Avatar**: Creator profile display
- **Chip**: Tag display with hover effects

### Custom Styling

```typescript
sx={{
  position: "relative",
  aspectRatio: "4/5",
  borderRadius: 1,
  cursor: "pointer",
  overflow: "hidden",
  "&:hover .tags-overlay": { opacity: 1 },
  "&:hover .title-overlay": { backgroundColor: "rgba(0, 0, 0, 0.5)" },
  "&:hover .creator-avatar": { opacity: 1 },
  "&:hover .add-to-list-button": { opacity: 1 },
  "@media (hover: none)": {
    // Mobile-specific styles
  }
}}
```

### Color System

- **Dynamic Colors**: Extracted from preset images using `useImageColor`
- **Fallback Colors**: Default white/transparent when analysis fails
- **Transition Timing**: 800ms ease-in-out for color changes
- **Text Shadows**: Enhanced readability over images

## Performance Considerations

### Image Optimization

- **FastImage Component**: High-performance image loading
- **Aspect Ratio**: Consistent 4:5 ratio for layout stability
- **Object Fit**: Cover mode for consistent image display
- **Placeholder Handling**: Fallback for missing images

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

- **Placeholder Fallback**: Default image when preset image fails
- **URL Validation**: Checks for string vs object image formats
- **Loading States**: Visual feedback during image loading

### Data Validation

- **Optional Creator**: Graceful handling of missing creator data
- **Tag Safety**: Safe iteration over tag arrays
- **Navigation Safety**: Valid slug checking before navigation

### User Interaction Errors

- **Event Propagation**: Proper stopPropagation for nested clicks
- **Navigation Guards**: Prevent navigation during dialog operations
- **Mobile Fallbacks**: Touch event handling for mobile devices

## Accessibility Features

### ARIA Support

- **Data Attributes**: `data-cy="preset-card"` for testing
- **Alt Text**: Descriptive alt text for images
- **Keyboard Navigation**: Tab order and focus management

### Screen Reader Support

- **Semantic Structure**: Proper heading hierarchy
- **Descriptive Text**: Clear labels for interactive elements
- **State Announcements**: Dynamic content changes announced

### Visual Accessibility

- **Color Contrast**: Text shadows for readability
- **Focus Indicators**: Visible focus states for keyboard users
- **Touch Targets**: Adequate size for mobile interaction

## Testing Integration

### Cypress Testing

```typescript
// Test selectors
data-cy="preset-card"     // Main card container
data-cy="preset-image"    // Preset image element
```

### Test Scenarios

1. **Navigation Testing**: Verify preset detail page navigation
2. **Mobile Interaction**: Test two-tap mobile behavior
3. **List Management**: Test add to list functionality
4. **Tag Filtering**: Test tag click navigation
5. **Creator Navigation**: Test avatar click to profile
6. **Image Loading**: Test placeholder and error states

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

- **Material-UI**: Card, Typography, Chip, Box, Avatar, IconButton
- **React Router**: useNavigate hook
- **Material-UI Icons**: AddIcon

### GraphQL Integration

- **Data Structure**: Compatible with preset query results
- **Navigation**: Uses slug-based routing
- **List Management**: Integrates with user list mutations

## Future Enhancements

### Planned Features

1. **Video Support**: Animated previews for presets
2. **Advanced Filtering**: Multi-tag selection and filtering
3. **Social Features**: Like, share, and comment integration
4. **Batch Operations**: Multi-select for list management
5. **Offline Support**: Cached preset data for offline viewing

### Performance Improvements

1. **Virtual Scrolling**: For large preset lists
2. **Image Preloading**: Predictive image loading
3. **Color Caching**: Persistent color analysis results
4. **Bundle Optimization**: Code splitting for card components

### UX Enhancements

1. **Gesture Support**: Swipe actions for mobile
2. **Keyboard Shortcuts**: Enhanced keyboard navigation
3. **Animation Refinements**: Smoother transitions
4. **Accessibility**: Enhanced screen reader support

---

_This component is a core part of the VISOR application's content display system and should be maintained with careful attention to performance and user experience._
