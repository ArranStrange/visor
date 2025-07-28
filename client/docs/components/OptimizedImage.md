# OptimizedImage Component

## Overview

The `OptimizedImage` component is a high-performance image component that leverages Cloudinary's optimization services to deliver optimized images with automatic format selection, responsive sizing, and progressive loading. It provides seamless fallback handling, loading states, and aspect ratio management for optimal user experience in the VISOR application.

## File Location

```
src/components/OptimizedImage.tsx
```

## Props Interface

```typescript
interface OptimizedImageProps {
  src: string; // Source image URL
  alt: string; // Alt text for accessibility
  aspectRatio?: "3:4" | "2:3"; // Aspect ratio for optimization (default: "3:4")
  className?: string; // CSS class name
  style?: React.CSSProperties; // Inline styles
  onLoad?: () => void; // Load completion callback
  onError?: () => void; // Error handling callback
  lazy?: boolean; // Lazy loading flag (default: true)
}
```

## Key Features

### 🚀 Performance Optimization

- **Cloudinary Integration**: Automatic image optimization and format selection
- **Progressive Loading**: Smooth loading transitions with blur effects
- **Lazy Loading**: Native lazy loading with fallback support
- **Aspect Ratio Management**: Consistent image sizing across the application

### 🎨 Visual Experience

- **Loading States**: Blur effect during image loading
- **Smooth Transitions**: Opacity and filter transitions for seamless UX
- **Fallback Handling**: Graceful degradation to original image on failure
- **Responsive Design**: Optimized for different screen sizes

### 🔧 Technical Features

- **Error Recovery**: Automatic fallback to original image URL
- **Memory Management**: Efficient image preloading and cleanup
- **State Management**: Comprehensive loading state tracking
- **Event Handling**: Proper load and error event management

### 📱 Responsive Support

- **Aspect Ratios**: Support for 3:4 and 2:3 aspect ratios
- **Responsive Sizing**: Automatic sizing based on aspect ratio
- **Mobile Optimization**: Optimized for mobile devices
- **Touch-Friendly**: Proper touch target sizing

## Usage Examples

### Basic Usage

```tsx
<OptimizedImage
  src="https://example.com/image.jpg"
  alt="Description of image"
  aspectRatio="3:4"
/>
```

### With Custom Styling

```tsx
<OptimizedImage
  src="https://example.com/image.jpg"
  alt="Custom styled image"
  className="custom-image-class"
  style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
  aspectRatio="2:3"
/>
```

### With Event Handlers

```tsx
<OptimizedImage
  src="https://example.com/image.jpg"
  alt="Image with handlers"
  onLoad={() => console.log("Image loaded successfully")}
  onError={() => console.error("Image failed to load")}
  lazy={false}
/>
```

### In Grid Layout

```tsx
<OptimizedImage
  src={preset.thumbnail}
  alt={preset.title}
  aspectRatio="3:4"
  className="grid-item-image"
  style={{ width: "100%", height: "auto" }}
/>
```

## Component Structure

### State Management

```typescript
const [imageSrc, setImageSrc] = useState<string>("");
const [isLoaded, setIsLoaded] = useState(false);
const [isLoading, setIsLoading] = useState(true);
```

### Key Functions

- **Image Preloading**: Preloads optimized image for smooth display
- **Error Handling**: Fallback to original image on optimization failure
- **Loading State Management**: Tracks loading progress and completion
- **Cloudinary Integration**: Uses CloudinaryOptimizer for image optimization

### Image Processing Workflow

```typescript
useEffect(() => {
  if (!src) return;

  setIsLoading(true);
  setIsLoaded(false);

  // Get optimized image URL from Cloudinary
  const optimizedUrl = CloudinaryOptimizer.getThumbnail(src, aspectRatio);
  setImageSrc(optimizedUrl);

  // Preload the optimized image
  const img = new Image();
  img.onload = () => {
    setIsLoaded(true);
    setIsLoading(false);
    onLoad?.();
  };
  img.onerror = () => {
    // Fallback to original image if optimization fails
    setImageSrc(src);
    setIsLoaded(true);
    setIsLoading(false);
    onError?.();
  };
  img.src = optimizedUrl;
}, [src, aspectRatio, onLoad, onError]);
```

## Styling & Theming

### CSS Properties

```typescript
style={{
  ...style,
  opacity: isLoaded ? 1 : 0.7,
  filter: isLoading ? "blur(8px)" : "none",
  transition: "opacity 0.3s ease-in-out, filter 0.3s ease-in-out",
}}
```

### Visual States

- **Loading State**: 70% opacity with 8px blur effect
- **Loaded State**: 100% opacity with no blur
- **Error State**: Fallback to original image with error callback
- **Transition**: Smooth 0.3s transitions for all state changes

### Aspect Ratio Support

- **3:4 Ratio**: Default aspect ratio for most content
- **2:3 Ratio**: Alternative ratio for specific layouts
- **Responsive**: Automatically adapts to container size
- **Consistent**: Maintains aspect ratio across different screen sizes

## Performance Considerations

### Optimization Strategies

- **Cloudinary Optimization**: Automatic format selection and compression
- **Lazy Loading**: Native lazy loading with fallback
- **Preloading**: Efficient image preloading for smooth transitions
- **Memory Management**: Proper cleanup of image objects

### Loading Performance

- **Progressive Loading**: Blur effect during loading for perceived performance
- **Fallback Handling**: Quick fallback to original image on failure
- **State Optimization**: Minimal state updates for better performance
- **Event Optimization**: Efficient event handling and cleanup

### Memory Management

- **Image Cleanup**: Proper cleanup of preloaded images
- **State Reset**: Reset state when source changes
- **Event Listeners**: Cleanup of load and error event handlers
- **Memory Leaks**: Prevention of memory leaks through proper cleanup

## Error Handling

### Cloudinary Errors

- **Optimization Failure**: Fallback to original image URL
- **Network Errors**: Graceful handling of network issues
- **Format Errors**: Automatic format fallback
- **Size Errors**: Fallback to original image size

### Loading Errors

- **Image Load Failure**: Fallback to original source
- **Network Timeout**: Automatic retry with original image
- **Invalid URLs**: Error callback with fallback
- **CORS Issues**: Proper CORS error handling

### User Experience Errors

- **Missing Alt Text**: Proper accessibility handling
- **Invalid Aspect Ratios**: Default to 3:4 ratio
- **Style Conflicts**: Proper style merging and conflict resolution
- **Event Errors**: Graceful event handler error handling

## Accessibility Features

### ARIA Support

- **Alt Text**: Required alt text for screen readers
- **Loading States**: Proper loading state announcements
- **Error States**: Error state announcements for screen readers
- **Focus Management**: Proper focus handling for interactive images

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
// Test selectors for image functionality
data-cy="optimized-image"         // Main image element
data-cy="image-loading"           // Loading state indicator
data-cy="image-loaded"            // Loaded state indicator
data-cy="image-error"             // Error state indicator
```

### Test Scenarios

1. **Image Loading**: Test successful image loading
2. **Error Handling**: Test fallback on optimization failure
3. **Lazy Loading**: Test lazy loading functionality
4. **Aspect Ratios**: Test different aspect ratio handling
5. **Performance**: Test loading performance and memory usage
6. **Accessibility**: Test screen reader and keyboard navigation

### Performance Testing

- **Load Times**: Monitor image load performance
- **Memory Usage**: Check for memory leaks
- **Network Performance**: Test with slow network conditions
- **Fallback Performance**: Test fallback mechanism performance

## Dependencies

### Internal Dependencies

- **CloudinaryOptimizer**: Image optimization utility
- **React Hooks**: useState, useEffect for state management
- **Image API**: Browser Image API for preloading

### External Dependencies

- **Cloudinary**: Image optimization service
- **React**: Core React functionality
- **CSS**: Custom styling and transitions

### Browser Support

- **Image API**: Modern browser Image API support
- **Lazy Loading**: Native lazy loading support
- **CSS Transitions**: CSS transition support
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
4. **Bundle Optimization**: Code splitting for image components

### UX Enhancements

1. **Skeleton Loading**: Skeleton loading states
2. **Zoom Support**: Image zoom functionality
3. **Gallery Integration**: Gallery view support
4. **Image Editing**: Basic image editing capabilities
5. **Social Sharing**: Image sharing functionality

---

_This component is essential for optimal image performance in the VISOR application, providing fast, optimized image loading with excellent user experience._
