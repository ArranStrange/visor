# Cloudinary Optimization Utilities

This directory contains utilities for optimizing images using Cloudinary's transformation API.

## Components

### CloudinaryOptimizer

A utility class that provides methods for transforming Cloudinary URLs with various optimizations.

#### Methods

- `optimize(url, options)` - Apply custom transformations to a Cloudinary URL
- `getThumbnail(url, aspectRatio)` - Get an optimized thumbnail (400px width)
- `getProgressive(url)` - Get a low-quality blurred image for progressive loading
- `getResponsiveSrcSet(url, aspectRatio)` - Get responsive image URLs for different screen sizes
- `getLazyLoadUrl(url, aspectRatio)` - Get both placeholder and full image URLs

#### Usage

```typescript
import { CloudinaryOptimizer } from "../utils/cloudinary";

// Basic optimization
const optimizedUrl = CloudinaryOptimizer.getThumbnail(imageUrl, "3:4");

// Custom optimization
const customUrl = CloudinaryOptimizer.optimize(imageUrl, {
  width: 800,
  height: 600,
  quality: "auto",
  format: "webp",
  crop: "fill",
  gravity: "auto",
});
```

### OptimizedImage

A React component that implements optimized image loading with Cloudinary transformations.

#### Props

- `src` - Image URL
- `alt` - Alt text
- `aspectRatio` - '3:4' or '2:3' (default: '3:4')
- `className` - CSS class name
- `style` - Inline styles
- `onLoad` - Load callback
- `onError` - Error callback
- `lazy` - Enable lazy loading (default: true)

#### Usage

```typescript
import OptimizedImage from "../components/OptimizedImage";

<OptimizedImage
  src={imageUrl}
  alt="Description"
  aspectRatio="3:4"
  onLoad={() => console.log("Image loaded")}
/>;
```

### ProgressiveImage (Legacy)

⚠️ **Note**: This component had IntersectionObserver cleanup issues and has been replaced by `OptimizedImage`. Use `OptimizedImage` for new implementations.

### useCloudinary Hook

A custom hook that provides optimized URLs for a given image.

#### Usage

```typescript
import { useCloudinary } from "../hooks/useCloudinary";

const MyComponent = ({ imageUrl }) => {
  const optimizedUrls = useCloudinary(imageUrl, "3:4");

  if (!optimizedUrls) return null;

  return <img src={optimizedUrls.thumbnail} alt="Optimized image" />;
};
```

## Features

### 1. Automatic Format Optimization

- Automatically serves WebP/AVIF to supported browsers
- Falls back to original format for older browsers

### 2. Quality Optimization

- Uses Cloudinary's auto quality for optimal file size
- Maintains visual quality while reducing bandwidth

### 3. Responsive Images

- Provides different sizes for mobile, tablet, and desktop
- Optimizes bandwidth usage across devices

### 4. Optimized Loading

- Shows blurred placeholder while loading
- Smoothly transitions to full quality image
- Improves perceived performance

### 5. Lazy Loading

- Uses native `loading="lazy"` attribute
- Reduces initial page load time
- No IntersectionObserver complexity

### 6. Error Handling

- Graceful fallback to original images
- Robust error recovery
- No crashes on network issues

## Performance Benefits

- **Faster Initial Load**: Optimized formats and quality settings
- **Reduced Bandwidth**: Auto quality and format optimization
- **Better UX**: Smooth transitions and no layout shifts
- **Mobile Optimized**: Responsive images for different screen sizes
- **Reliable**: No IntersectionObserver cleanup issues

## Integration

The utilities are already integrated into:

- `FilmSimCard` - Uses OptimizedImage for film simulation thumbnails
- `PresetCard` - Uses OptimizedImage for preset thumbnails

## Recent Fixes

### v1.1 - IntersectionObserver Issues Resolved

- Replaced `ProgressiveImage` with `OptimizedImage`
- Removed complex IntersectionObserver logic
- Added proper error handling and fallbacks
- Simplified component architecture
- Fixed cleanup issues that caused crashes

## Testing

You can test the optimization features by using the `OptimizedImage` component directly in your application.

## Migration Guide

If you were using `ProgressiveImage`, replace it with `OptimizedImage`:

```typescript
// Old
import ProgressiveImage from "../components/ProgressiveImage";
<ProgressiveImage src={url} alt="..." />;

// New
import OptimizedImage from "../components/OptimizedImage";
<OptimizedImage src={url} alt="..." />;
```

The API is nearly identical, with the main difference being better error handling and no IntersectionObserver complexity.
