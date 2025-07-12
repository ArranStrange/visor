# LazyImage Component

## Overview

The `LazyImage` component is a lightweight, efficient image component that implements lazy loading using Intersection Observer API. It provides optimized image loading with Cloudinary integration, smooth fade-in transitions, and comprehensive error handling. This component is designed for performance-critical scenarios where memory and bandwidth optimization are essential.

## File Location

```
src/components/LazyImage.tsx
```

## Props Interface

```typescript
interface LazyImageProps {
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

### 🚀 Lazy Loading

- **Intersection Observer**: Efficient viewport detection
- **Early Loading**: Starts loading 50px before entering viewport
- **Memory Management**: Proper cleanup of observers
- **Performance Optimization**: Only loads images when needed

### 🎨 Visual Experience

- **Fade-in Effect**: Smooth opacity transition from 0 to 1
- **Blur Effect**: 10px blur during loading for visual feedback
- **Smooth Transitions**: 0.3s ease-in-out transitions
- **Loading States**: Clear visual feedback during loading

### 🔧 Technical Features

- **Cloudinary Integration**: Automatic image optimization
- **Error Recovery**: Graceful fallback to original image
- **State Management**: Comprehensive loading state tracking
- **Memory Cleanup**: Proper cleanup of observers and images

### 📱 Responsive Support

- **Aspect Ratios**: Support for 3:4 and 2:3 aspect ratios
- **Responsive Sizing**: Automatic sizing based on aspect ratio
- **Mobile Optimization**: Optimized for mobile devices
- **Touch-Friendly**: Proper touch target sizing

## Usage Examples

### Basic Usage

```tsx
<LazyImage
  src="https://example.com/image.jpg"
  alt="Description of image"
  aspectRatio="3:4"
/>
```

### With Custom Styling

```tsx
<LazyImage
  src="https://example.com/image.jpg"
  alt="Custom styled image"
  className="custom-lazy-image"
  style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
  aspectRatio="2:3"
/>
```

### With Event Handlers

```tsx
<LazyImage
  src="https://example.com/image.jpg"
  alt="Image with handlers"
  onLoad={() => console.log("Lazy image loaded successfully")}
  onError={() => console.error("Lazy image failed to load")}
/>
```

### In Grid Layout

```tsx
<LazyImage
  src={preset.thumbnail}
  alt={preset.title}
  aspectRatio="3:4"
  className="grid-lazy-image"
  style={{ width: "100%", height: "auto" }}
/>
```

## Component Structure

### State Management

```typescript
const [imageSrc, setImageSrc] = useState<string>("");
const [isLoaded, setIsLoaded] = useState(false);
const [isInView, setIsInView] = useState(false);
```

### Key Functions

- **Intersection Observer**: Detects when image enters viewport
- **Image Loading**: Loads optimized image when in view
- **Error Handling**: Fallback to original image on failure
- **Memory Cleanup**: Proper cleanup of observers and images

### Loading Workflow

```typescript
// 1. Intersection Observer setup
useEffect(() => {
  let observer: IntersectionObserver;
  let didCancel = false;

  if (imageRef.current) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > 0 || entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: "50px", // Start loading 50px before entering viewport
      }
    );
    observer.observe(imageRef.current);
  }

  return () => {
    didCancel = true;
    if (observer && observer.unobserve) {
      observer.unobserve(imageRef.current!);
    }
  };
}, []);

// 2. Image loading when in view
useEffect(() => {
  if (isInView && src) {
    const optimizedUrl = CloudinaryOptimizer.getThumbnail(src, aspectRatio);
    setImageSrc(optimizedUrl);
  }
}, [isInView, src, aspectRatio]);
```

## Styling & Theming

### CSS Properties

```typescript
style={{
  ...style,
  opacity: isLoaded ? 1 : 0,
  transition: "opacity 0.3s ease-in-out",
  filter: isLoaded ? "none" : "blur(10px)",
}}
```

### Visual States

- **Loading State**: 0 opacity with 10px blur effect
- **Loaded State**: 100% opacity with no blur
- **Error State**: Fallback to original image with error callback
- **Transition**: Smooth 0.3s ease-in-out transitions

### Aspect Ratio Support

- **3:4 Ratio**: Default aspect ratio for most content
- **2:3 Ratio**: Alternative ratio for specific layouts
- **Responsive**: Automatically adapts to container size
- **Consistent**: Maintains aspect ratio across different screen sizes

## Performance Considerations

### Optimization Strategies

- **Intersection Observer**: Efficient viewport detection
- **Lazy Loading**: Only loads images when needed
- **Early Loading**: 50px margin for preloading
- **Memory Management**: Proper cleanup of observers and images

### Loading Performance

- **Perceived Performance**: Immediate visual feedback with blur
- **Network Optimization**: Optimized image loading
- **Memory Cleanup**: Efficient cleanup of resources
- **Error Recovery**: Quick fallback on failure

### Memory Management

- **Observer Cleanup**: Proper cleanup of Intersection Observer
- **Image Cleanup**: Cleanup of preloaded images
- **State Reset**: Reset state when source changes
- **Memory Leaks**: Prevention of memory leaks through proper cleanup

## Error Handling

### Cloudinary Errors

- **Optimization Failure**: Fallback to original image URL
- **Network Errors**: Graceful handling of network issues
- **Format Errors**: Automatic format fallback
- **Size Errors**: Fallback to original image size

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
- **Loading Announcements**: Loading state announcements
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
// Test selectors for lazy image functionality
data-cy="lazy-image"              // Main image element
data-cy="lazy-loading"            // Loading state indicator
data-cy="lazy-loaded"             // Loaded state indicator
data-cy="lazy-error"              // Error state indicator
```

### Test Scenarios

1. **Lazy Loading**: Test intersection observer functionality
2. **Image Loading**: Test successful image loading
3. **Error Handling**: Test fallback on loading failure
4. **Performance**: Test loading performance and memory usage
5. **Accessibility**: Test screen reader and keyboard navigation
6. **Responsive**: Test different container sizes

### Performance Testing

- **Load Times**: Monitor lazy loading performance
- **Memory Usage**: Check for memory leaks
- **Network Performance**: Test with slow network conditions
- **Observer Performance**: Test intersection observer efficiency

## Dependencies

### Internal Dependencies

- **CloudinaryOptimizer**: Image optimization utility
- **React Hooks**: useState, useRef, useEffect for state management
- **Intersection Observer**: Browser API for viewport detection

### External Dependencies

- **Cloudinary**: Image optimization service
- **React**: Core React functionality
- **CSS**: Custom styling and transitions

### Browser Support

- **Intersection Observer**: Modern browser Intersection Observer API
- **CSS Transitions**: CSS transition support
- **Image API**: Browser Image API for preloading
- **Cloudinary**: Cloudinary service integration

## Future Enhancements

### Planned Features

1. **WebP Support**: Automatic WebP format selection
2. **Responsive Images**: Multiple size support
3. **Progressive JPEG**: Progressive image loading
4. **Image Caching**: Client-side image caching
5. **Retina Support**: High-DPI display support

### Performance Improvements

1. **Service Worker**: Offline image caching
2. **Image Compression**: Client-side compression
3. **Preloading**: Predictive image preloading
4. **Bundle Optimization**: Code splitting for lazy image components

### UX Enhancements

1. **Skeleton Loading**: Skeleton loading states
2. **Zoom Support**: Image zoom functionality
3. **Gallery Integration**: Gallery view support
4. **Image Editing**: Basic image editing capabilities
5. **Social Sharing**: Image sharing functionality

---

_This component provides efficient lazy loading capabilities in the VISOR application, optimizing performance while maintaining excellent user experience._
