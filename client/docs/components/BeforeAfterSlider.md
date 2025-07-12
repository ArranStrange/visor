# BeforeAfterSlider Component

## Overview

The `BeforeAfterSlider` component is an interactive image comparison tool that allows users to slide between "before" and "after" images to see the effects of photo editing or processing. It provides smooth drag interactions, touch support for mobile devices, and a visually appealing slider interface with placeholder images for demonstration purposes.

## File Location

```
src/components/BeforeAfterSlider.tsx
```

## Props Interface

```typescript
interface BeforeAfterSliderProps {
  beforeImage?: string; // Before image URL (optional)
  afterImage?: string; // After image URL (optional)
  height?: number; // Component height in pixels (default: 400)
}
```

## Key Features

### 🎯 Interactive Slider

- **Drag Interaction**: Smooth mouse drag functionality
- **Touch Support**: Full touch support for mobile devices
- **Position Control**: Precise slider position control (0-100%)
- **Visual Feedback**: Clear slider line with handle indicator

### 🖼️ Image Display

- **Before/After Images**: Side-by-side image comparison
- **Placeholder Images**: Default images for demonstration
- **Cover Object Fit**: Maintains aspect ratio with cover fitting
- **Clipped Display**: Before image clipped based on slider position

### 🎨 Visual Design

- **Slider Line**: White vertical line indicator
- **Handle Circle**: Circular handle with shadow effect
- **Rounded Corners**: Border radius for modern appearance
- **Responsive Design**: Adapts to container width

### 📱 Mobile Support

- **Touch Events**: Full touch event handling
- **Prevent Default**: Prevents unwanted touch behaviors
- **Touch Action**: Optimized touch action handling
- **Mobile Cursor**: Appropriate cursor styling

## Usage Examples

### Basic Usage

```tsx
<BeforeAfterSlider
  beforeImage="https://example.com/before.jpg"
  afterImage="https://example.com/after.jpg"
  height={400}
/>
```

### With Placeholder Images

```tsx
<BeforeAfterSlider
  height={500}
  // Uses default placeholder images
/>
```

### In Preset Detail View

```tsx
<BeforeAfterSlider
  beforeImage={preset.beforeImage}
  afterImage={preset.afterImage}
  height={600}
/>
```

### With Custom Styling

```tsx
<Box sx={{ width: "100%", maxWidth: "800px" }}>
  <BeforeAfterSlider
    beforeImage="https://example.com/before.jpg"
    afterImage="https://example.com/after.jpg"
    height={450}
  />
</Box>
```

## Component Structure

### State Management

```typescript
const [sliderPosition, setSliderPosition] = useState(50);
const containerRef = useRef<HTMLDivElement>(null);
const isDragging = useRef(false);
```

### Key Functions

- **`handleMouseDown`**: Initiates mouse drag interaction
- **`handleMouseUp`**: Ends mouse drag interaction
- **`handleMouseMove`**: Handles mouse movement during drag
- **`handleTouchStart`**: Initiates touch interaction
- **`handleTouchMove`**: Handles touch movement during drag
- **`handleTouchEnd`**: Ends touch interaction

### Event Handling

```typescript
// Mouse event handling
const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.current || !containerRef.current) return;

  const container = containerRef.current;
  const rect = container.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percentage = (x / rect.width) * 100;

  setSliderPosition(Math.min(Math.max(percentage, 0), 100));
};

// Touch event handling
const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.current || !containerRef.current) return;

  e.preventDefault();
  const container = containerRef.current;
  const rect = container.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const percentage = (x / rect.width) * 100;

  setSliderPosition(Math.min(Math.max(percentage, 0), 100));
};
```

## Styling & Theming

### Container Styling

```typescript
sx={{
  position: "relative",
  width: "100%",
  height: height,
  overflow: "hidden",
  borderRadius: 2,
  cursor: "col-resize",
  userSelect: "none",
  touchAction: "none",
}}
```

### Image Styling

```typescript
// After image (background)
sx={{
  position: "absolute",
  width: "100%",
  height: "100%",
  objectFit: "cover",
  top: 0,
  left: 0,
}}

// Before image (clipped)
sx={{
  position: "absolute",
  width: "100%",
  height: "100%",
  objectFit: "cover",
  top: 0,
  left: 0,
  clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
}}
```

### Slider Styling

```typescript
sx={{
  position: "absolute",
  top: 0,
  left: `${sliderPosition}%`,
  width: "2px",
  height: "100%",
  backgroundColor: "white",
  transform: "translateX(-50%)",
  cursor: "col-resize",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "40px",
    height: "40px",
    backgroundColor: "white",
    borderRadius: "50%",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
}}
```

## Performance Considerations

### Optimization Strategies

- **Event Cleanup**: Proper cleanup of global event listeners
- **Ref Usage**: Efficient DOM access with refs
- **State Optimization**: Minimal state updates
- **Memory Management**: Proper cleanup on unmount

### Interaction Performance

- **Smooth Dragging**: Efficient position calculation
- **Touch Optimization**: Optimized touch event handling
- **Visual Feedback**: Immediate visual updates
- **Boundary Handling**: Proper boundary constraints

### Memory Management

- **Event Listeners**: Proper cleanup of global listeners
- **Ref Cleanup**: Efficient ref management
- **State Reset**: Reset state when props change
- **Memory Leaks**: Prevention of memory leaks

## Error Handling

### Image Loading Errors

- **Placeholder Fallback**: Default placeholder images
- **Missing Images**: Graceful handling of missing images
- **Load Failures**: Fallback to placeholder images
- **Invalid URLs**: Safe handling of invalid URLs

### Interaction Errors

- **Touch Errors**: Graceful touch event handling
- **Mouse Errors**: Proper mouse event error handling
- **Position Errors**: Boundary constraint handling
- **Event Errors**: Safe event listener management

### User Experience Errors

- **Missing Props**: Default values for missing props
- **Invalid Heights**: Safe height value handling
- **Style Conflicts**: Proper style merging
- **Accessibility Errors**: Graceful accessibility handling

## Accessibility Features

### ARIA Support

- **Role**: Proper role for interactive slider
- **Labels**: Clear labels for before/after images
- **State**: Proper state announcements
- **Focus Management**: Keyboard focus handling

### Screen Reader Support

- **Descriptive Text**: Clear descriptions for screen readers
- **State Announcements**: Position changes announced
- **Image Descriptions**: Alt text for before/after images
- **Context Information**: Proper context for slider

### Keyboard Navigation

- **Arrow Keys**: Keyboard navigation support
- **Focus Indicators**: Visible focus states
- **Keyboard Shortcuts**: Enhanced keyboard controls
- **Tab Order**: Logical tab order

### Visual Accessibility

- **Color Contrast**: High contrast slider line
- **Touch Targets**: Adequate touch target size
- **Visual Feedback**: Clear visual indicators
- **Focus Indicators**: Visible focus states

## Testing Integration

### Cypress Testing

```typescript
// Test selectors for slider functionality
data-cy="before-after-slider"     // Main slider container
data-cy="slider-line"             // Slider line element
data-cy="slider-handle"           // Slider handle element
data-cy="before-image"            // Before image element
data-cy="after-image"             // After image element
```

### Test Scenarios

1. **Mouse Interaction**: Test mouse drag functionality
2. **Touch Interaction**: Test touch drag functionality
3. **Image Loading**: Test image loading and fallbacks
4. **Position Control**: Test slider position accuracy
5. **Boundary Testing**: Test boundary constraints
6. **Accessibility**: Test keyboard and screen reader support

### Performance Testing

- **Drag Performance**: Test smooth dragging performance
- **Touch Performance**: Test touch interaction responsiveness
- **Memory Usage**: Check for memory leaks
- **Image Loading**: Test image loading performance

## Dependencies

### Internal Dependencies

- **React Hooks**: useState, useRef, useEffect for state management
- **Material-UI**: Box component for layout
- **Event Handling**: Custom event handling logic

### External Dependencies

- **Material-UI**: Box component
- **React**: Core React functionality
- **CSS**: Custom styling and transitions

### Browser Support

- **Mouse Events**: Standard mouse event support
- **Touch Events**: Touch event support for mobile
- **CSS Clip Path**: Modern CSS clip-path support
- **CSS Transforms**: CSS transform support

## Future Enhancements

### Planned Features

1. **Keyboard Controls**: Arrow key navigation
2. **Animation**: Smooth transition animations
3. **Multiple Images**: Support for multiple before/after pairs
4. **Zoom Support**: Image zoom functionality
5. **Export Functionality**: Export comparison images

### Performance Improvements

1. **Virtual Scrolling**: For large image collections
2. **Image Preloading**: Preload images for smooth interaction
3. **Compression**: Image compression for faster loading
4. **Bundle Optimization**: Code splitting for slider components

### UX Enhancements

1. **Haptic Feedback**: Haptic feedback on mobile
2. **Gesture Support**: Pinch to zoom gestures
3. **Auto-play**: Automatic slider movement
4. **Comparison Tools**: Additional comparison features
5. **Social Sharing**: Share comparison results

---

_This component provides an excellent before/after comparison experience in the VISOR application, allowing users to see the effects of photo editing and processing._
