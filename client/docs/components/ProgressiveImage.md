# ProgressiveImage Component

## Overview

The `ProgressiveImage` component implements a sophisticated progressive loading technique that displays a blurred, low-quality placeholder image while the high-quality image loads in the background. It uses Intersection Observer for lazy loading and Cloudinary optimization for seamless image delivery, providing an excellent user experience with perceived performance improvements.

## File Location

```
src/components/ProgressiveImage.tsx
```

## Props Interface

```typescript
interface ProgressiveImageProps {
  src: string; // Source image URL
  alt: string; // Alt text for accessibility
  aspectRatio?: "3:4" | "2:3"; // Aspect ratio for optimization (default: "3:4")
  className?: string; // CSS class name
  style?: React.CSSProperties; // Inline styles
  onLoad?: () => void; // Load completion callback
  onError?: () => void; // Error handling callback
}
```

## Key Features

### 🚀 Progressive Loading

- **Blur Effect**: 20px blur effect on low-quality placeholder
- **Scale Effect**: 1.1x scale on placeholder for smooth transition
- **Quality Transition**: Seamless transition from blur to sharp image
- **Perceived Performance**: Immediate visual feedback for users

### 📱 Lazy Loading

- **Intersection Observer**: Efficient viewport detection
- **Early Loading**: Starts loading 100px before entering viewport
- **Memory Management**: Proper cleanup of observers
- **Performance Optimization**: Only loads images when needed

### 🎨 Visual Experience

- **Smooth Transitions**: 0.3s ease-out transitions for all effects
- **Cover Object Fit**: Maintains aspect ratio with cover fitting
- **Absolute Positioning**: Proper positioning within container
- **Responsive Design**: Adapts to container size

### 🔧 Technical Features

- **Cloudinary Integration**: Progressive and optimized image URLs
- **Error Recovery**: Graceful fallback to original image
- **State Management**: Comprehensive loading state tracking
- **Memory Cleanup**: Proper cleanup of observers and images

## Usage Examples

### Basic Usage

```tsx
<ProgressiveImage
  src="https://example.com/image.jpg"
  alt="Description of image"
  aspectRatio="3:4"
/>
```

### With Custom Container

```tsx
<div style={{ width: "300px", height: "400px" }}>
  <ProgressiveImage
    src="https://example.com/image.jpg"
    alt="Custom sized image"
    aspectRatio="2:3"
    className="custom-progressive-image"
  />
</div>
```

### With Event Handlers

```tsx
<ProgressiveImage
  src="https://example.com/image.jpg"
  alt="Image with handlers"
  onLoad={() => console.log("Progressive image loaded")}
  onError={() => console.error("Progressive image failed")}
  style={{ borderRadius: "8px" }}
/>
```

### In Grid Layout

```tsx
<ProgressiveImage
  src={preset.thumbnail}
  alt={preset.title}
  aspectRatio="3:4"
  className="grid-progressive-image"
/>
```

## Component Structure

### State Management

```typescript
const [currentSrc, setCurrentSrc] = useState<string>("");
const [isLoaded, setIsLoaded] = useState(false);
const [isInView, setIsInView] = useState(false);
const [showProgressive, setShowProgressive] = useState(true);
```

### Key Functions

- **Intersection Observer**: Detects when image enters viewport
- **Progressive Loading**: Loads low-quality then high-quality image
- **Error Handling**: Fallback to original image on failure
- **Memory Cleanup**: Proper cleanup of observers and images

### Loading Workflow

```typescript
// 1. Intersection Observer setup
useEffect(() => {
  observerRef.current = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio > 0 || entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.01,
      rootMargin: "100px", // Start loading 100px before entering viewport
    }
  );
}, []);

// 2. Progressive loading when in view
useEffect(() => {
  if (isInView && src) {
    // Start with progressive (blurred) image
    const progressiveUrl = CloudinaryOptimizer.getProgressive(src);
    setCurrentSrc(progressiveUrl);
    setShowProgressive(true);

    // Load the full quality image
    const fullImage = new Image();
    fullImage.onload = () => {
      const optimizedUrl = CloudinaryOptimizer.getThumbnail(src, aspectRatio);
      setCurrentSrc(optimizedUrl);
      setShowProgressive(false);
      setIsLoaded(true);
      onLoad?.();
    };
    fullImage.src = CloudinaryOptimizer.getThumbnail(src, aspectRatio);
  }
}, [isInView, src, aspectRatio, onLoad, onError]);
```

## Styling & Theming

### CSS Properties

```typescript
style={{
  ...style,
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  filter: showProgressive ? "blur(20px)" : "none",
  transform: showProgressive ? "scale(1.1)" : "scale(1)",
  transition: isLoaded
    ? "filter 0.3s ease-out, transform 0.3s ease-out"
    : "none",
}}
```

### Visual States

- **Progressive State**: 20px blur with 1.1x scale
- **Loaded State**: No blur with 1x scale
- **Transition**: Smooth 0.3s ease-out transitions
- **Container**: Relative positioned container with full dimensions

### Aspect Ratio Support

- **3:4 Ratio**: Default aspect ratio for most content
- **2:3 Ratio**: Alternative ratio for specific layouts
- **Cover Fitting**: Maintains aspect ratio with cover object-fit
- **Responsive**: Adapts to container size automatically

## Performance Considerations

### Optimization Strategies

- **Intersection Observer**: Efficient viewport detection
- **Progressive Loading**: Low-quality to high-quality transition
- **Early Loading**: 100px margin for preloading
- **Memory Management**: Proper cleanup of observers and images

### Loading Performance

- **Perceived Performance**: Immediate visual feedback with blur
- **Network Optimization**: Progressive image loading
- **Memory Cleanup**: Efficient cleanup of resources
- **Error Recovery**: Quick fallback on failure

### Memory Management

- **Observer Cleanup**: Proper cleanup of Intersection Observer
- **Image Cleanup**: Cleanup of preloaded images
- **State Reset**: Reset state when source changes
- **Memory Leaks**: Prevention of memory leaks through proper cleanup

## Error Handling

### Cloudinary Errors

- **Progressive Failure**: Fallback to original image
- **Optimization Failure**: Graceful degradation
- **Network Errors**: Handle network connectivity issues
- **Format Errors**: Automatic format fallback

### Loading Errors

- **Image Load Failure**: Fallback to original source
- **Observer Errors**: Graceful handling of observer errors
- **Memory Errors**: Handle memory limitations
- **Timeout Errors**: Handle loading timeouts

### User Experience Errors

- **Missing Alt Text**: Proper accessibility handling
- **Invalid URLs**: Error callback with fallback
- **Style Conflicts**: Proper style merging
- **Event Errors**: Graceful event handler error handling

## Accessibility Features

### ARIA Support

- **Alt Text**: Required alt text for screen readers
- **Loading States**: Proper loading state announcements
- **Error States**: Error state announcements for screen readers
- **Focus Management**: Proper focus handling

### Screen Reader Support

- **Descriptive Alt Text**: Clear descriptions for screen readers
- **Loading Announcements**: Progressive loading announcements
- **Error Announcements**: Error state announcements
- **Context Information**: Proper context for image content

### Visual Accessibility

- **Color Contrast**: Maintains color contrast in all states
- **Focus Indicators**: Visible focus states for keyboard users
- **Loading Indicators**: Clear visual feedback during loading
- **Error Indicators**: Clear visual feedback for errors

## Testing Integration

### Cypress Testing

```typescript
// Test selectors for progressive image functionality
data-cy="progressive-image"        // Main image element
data-cy="progressive-loading"      // Progressive loading state
data-cy="progressive-loaded"       // Loaded state indicator
data-cy="progressive-error"        // Error state indicator
```

### Test Scenarios

1. **Progressive Loading**: Test blur to sharp transition
2. **Lazy Loading**: Test intersection observer functionality
3. **Error Handling**: Test fallback on loading failure
4. **Performance**: Test loading performance and memory usage
5. **Accessibility**: Test screen reader and keyboard navigation
6. **Responsive**: Test different container sizes

### Performance Testing

- **Load Times**: Monitor progressive loading performance
- **Memory Usage**: Check for memory leaks
- **Network Performance**: Test with slow network conditions
- **Observer Performance**: Test intersection observer efficiency

## Dependencies

### Internal Dependencies

- **CloudinaryOptimizer**: Progressive and optimized image utilities
- **React Hooks**: useState, useRef, useEffect for state management
- **Intersection Observer**: Browser API for viewport detection

### External Dependencies

- **Cloudinary**: Progressive image optimization service
- **React**: Core React functionality
- **CSS**: Custom styling and transitions

### Browser Support

- **Intersection Observer**: Modern browser Intersection Observer API
- **CSS Transitions**: CSS transition support
- **Image API**: Browser Image API for preloading
- **Cloudinary**: Cloudinary service integration

## Future Enhancements

### Planned Features

1. **WebP Progressive**: WebP progressive image support
2. **Multiple Qualities**: Multiple quality levels for different networks
3. **Skeleton Loading**: Skeleton loading states
4. **Retina Support**: High-DPI display support
5. **Animation Options**: Customizable transition animations

### Performance Improvements

1. **Service Worker**: Offline progressive image caching
2. **Predictive Loading**: Predictive image preloading
3. **Compression**: Client-side compression options
4. **Bundle Optimization**: Code splitting for progressive components

### UX Enhancements

1. **Custom Blur**: Configurable blur intensity
2. **Custom Scale**: Configurable scale effects
3. **Loading Indicators**: Custom loading indicators
4. **Error Recovery**: Enhanced error recovery options
5. **Gallery Integration**: Gallery view with progressive loading

---

_This component provides an excellent progressive loading experience in the VISOR application, combining performance optimization with smooth visual transitions._
