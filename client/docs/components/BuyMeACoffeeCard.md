# BuyMeACoffeeCard Component

## Overview

The `BuyMeACoffeeCard` component is a promotional card designed to encourage user support for the VISOR application through the Buy Me a Coffee platform. It features an attractive design with hover effects, mobile-optimized interactions, and seamless integration with the content grid layout.

## File Location

```
src/components/BuyMeACoffeeCard.tsx
```

## Props Interface

```typescript
interface BuyMeACoffeeCardProps {
  id?: string; // Optional unique identifier
}
```

## Key Features

### 💰 Support Integration

- **Buy Me a Coffee Link**: Direct integration with Buy Me a Coffee platform
- **Support Messaging**: Clear call-to-action for user support
- **Promotional Design**: Attractive design to encourage engagement
- **Seamless Integration**: Fits naturally within content grid

### 🎨 Visual Design

- **Card Layout**: Material-UI Card component with consistent styling
- **Background Image**: High-quality coffee-themed background image
- **Typography Hierarchy**: Clear title and subtitle structure
- **Hover Effects**: Smooth hover animations and transitions

### 📱 Mobile Optimization

- **Touch Interactions**: Mobile-specific click behavior
- **Responsive Design**: Adapts to different screen sizes
- **Mobile Detection**: Automatic mobile device detection
- **Touch-Friendly**: Optimized for touch interactions

### 🔧 Technical Features

- **State Management**: Local state for mobile interactions
- **Event Handling**: Comprehensive click and hover handling
- **Performance Optimization**: Efficient rendering and animations
- **Accessibility**: Proper accessibility features

## Usage Examples

### Basic Usage

```tsx
<BuyMeACoffeeCard />
```

### With Custom ID

```tsx
<BuyMeACoffeeCard id="support-card-1" />
```

### In Content Grid

```tsx
<ContentGridLoader
  contentType="all"
  // BuyMeACoffeeCard will be automatically included
/>
```

### Custom Styling

```tsx
<Box sx={{ maxWidth: "300px" }}>
  <BuyMeACoffeeCard />
</Box>
```

## Component Structure

### State Management

```typescript
const [showOptions, setShowOptions] = React.useState(false);
const [isMobile, setIsMobile] = React.useState(false);
```

### Mobile Detection

```typescript
React.useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.matchMedia("(hover: none)").matches);
  };
  checkMobile();
  window.addEventListener("resize", checkMobile);
  return () => window.removeEventListener("resize", checkMobile);
}, []);
```

### Click Handling

```typescript
const handleClick = () => {
  if (isMobile) {
    // On mobile: first click shows options, second click opens link
    if (!showOptions) {
      setShowOptions(true);
    } else {
      window.open("https://buymeacoffee.com/arranstrange", "_blank");
    }
  } else {
    // On desktop: direct link opening
    window.open("https://buymeacoffee.com/arranstrange", "_blank");
  }
};
```

### Auto-hide Timer

```typescript
React.useEffect(() => {
  if (!isMobile && showOptions) {
    const timer = setTimeout(() => {
      setShowOptions(false);
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [showOptions, isMobile]);
```

## Styling & Theming

### Card Styling

```typescript
sx={{
  position: "relative",
  aspectRatio: "5/4",
  borderRadius: 1,
  overflow: "hidden",
  cursor: "pointer",
  transition: "transform 0.2s ease-in-out, boxShadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
  },
  "&:hover .tags-container": {
    opacity: 1,
  },
  "@media (hover: none)": {
    "& .tags-container": {
      opacity: showOptions ? 1 : 0,
    },
  },
}}
```

### Title Container Styling

```typescript
sx={{
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  p: 2,
  backgroundColor: "rgba(0, 0, 0, 0.3)",
}}
```

### Typography Styling

```typescript
// Title styling
sx={{
  color: "rgba(255, 255, 255, 0.9)",
  textShadow: "2px 2px 8px rgba(0,0,0,0.7)",
  lineHeight: 1.2,
}}

// Subtitle styling
sx={{
  color: "rgba(255, 255, 255, 0.7)",
  textShadow: "1px 1px 4px rgba(0,0,0,0.7)",
  lineHeight: 1.2,
}}
```

### Tags Container Styling

```typescript
sx={{
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  p: 2,
  opacity: 0,
  transition: "opacity 0.3s ease-in-out",
}}
```

## Performance Considerations

### Optimization Strategies

- **Mobile Detection**: Efficient mobile device detection
- **Event Handling**: Optimized click and hover handling
- **Animation Performance**: Smooth CSS transitions
- **Memory Management**: Proper cleanup of event listeners

### Rendering Performance

- **Conditional Rendering**: Efficient conditional rendering
- **Style Calculation**: Optimized style calculations
- **Image Loading**: Optimized background image loading
- **Component Structure**: Clean component structure

### Memory Management

- **Event Cleanup**: Proper cleanup of resize event listeners
- **Timer Cleanup**: Cleanup of auto-hide timers
- **State Reset**: Reset state when props change
- **Memory Leaks**: Prevention of memory leaks

## Error Handling

### Interaction Errors

- **Click Errors**: Graceful click error handling
- **Link Errors**: Safe external link opening
- **Mobile Detection Errors**: Fallback for mobile detection
- **Timer Errors**: Safe timer management

### Display Errors

- **Image Loading**: Graceful background image loading
- **Style Errors**: Safe style application
- **Layout Errors**: Safe layout handling
- **Theme Errors**: Fallback for theme issues

### User Experience Errors

- **Mobile Interactions**: Safe mobile interaction handling
- **Hover Effects**: Graceful hover effect handling
- **Animation Errors**: Safe animation handling
- **Accessibility Errors**: Proper accessibility handling

## Accessibility Features

### ARIA Support

- **Button Role**: Proper button role for clickable card
- **Labels**: Clear labels for screen readers
- **State**: Proper state announcements
- **Focus Management**: Proper focus handling

### Screen Reader Support

- **Descriptive Text**: Clear descriptions for screen readers
- **Action Announcements**: Click action announcements
- **Content Information**: Clear content information
- **Context Information**: Proper context for promotional content

### Keyboard Navigation

- **Tab Order**: Logical tab order
- **Focus Management**: Proper focus handling
- **Keyboard Shortcuts**: Enhanced keyboard controls
- **Focus Indicators**: Visible focus states

### Visual Accessibility

- **Color Contrast**: Maintains color contrast in all states
- **Text Size**: Readable text sizes
- **Visual Hierarchy**: Clear visual hierarchy
- **Focus Indicators**: Visible focus states

## Testing Integration

### Cypress Testing

```typescript
// Test selectors for Buy Me a Coffee card functionality
data-cy="buy-me-coffee-card"       // Main card element
data-cy="support-title"            // Support title element
data-cy="support-subtitle"         // Support subtitle element
data-cy="support-tags"             // Support tags container
data-cy="support-chip"             // Individual support chip
```

### Test Scenarios

1. **Card Display**: Test card rendering and styling
2. **Click Interactions**: Test click behavior on desktop and mobile
3. **Hover Effects**: Test hover animations and effects
4. **Mobile Behavior**: Test mobile-specific interactions
5. **Link Opening**: Test external link opening
6. **Accessibility**: Test screen reader and keyboard navigation
7. **Responsive**: Test different screen sizes

### Performance Testing

- **Click Performance**: Test click response performance
- **Animation Performance**: Test hover animation performance
- **Memory Usage**: Check for memory leaks
- **Image Loading**: Test background image loading performance

## Dependencies

### Internal Dependencies

- **React Hooks**: useState, useEffect for state management
- **Material-UI Components**: Card, Typography, Box, Chip, Stack
- **Event Handling**: Custom event handling logic

### External Dependencies

- **Material-UI**: Card, Typography, Box, Chip, Stack components
- **React**: Core React functionality
- **CSS**: Custom styling and transitions

### Browser Support

- **CSS Transitions**: Modern CSS transition support
- **Media Queries**: Modern media query support
- **Touch Events**: Touch event support for mobile
- **External Links**: External link opening support

## Future Enhancements

### Planned Features

1. **Multiple Support Options**: Different support tiers
2. **Support Analytics**: Track support engagement
3. **Custom Messaging**: Configurable support messages
4. **Support Rewards**: Support-based rewards system
5. **Social Sharing**: Share support options

### Performance Improvements

1. **Image Optimization**: Optimized background image loading
2. **Animation Optimization**: Smoother animations
3. **Bundle Optimization**: Code splitting for promotional components
4. **Caching**: Support link caching

### UX Enhancements

1. **Support Animations**: Enhanced support animations
2. **Support Feedback**: User feedback for support actions
3. **Support History**: Track user support history
4. **Support Goals**: Support goal progress indicators
5. **Support Community**: Community support features

---

_This component provides essential support functionality in the VISOR application, encouraging user engagement while maintaining excellent user experience and accessibility._
