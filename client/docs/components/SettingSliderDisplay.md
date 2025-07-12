# SettingSliderDisplay Component

## Overview

The `SettingSliderDisplay` component is a specialized visual slider that displays setting values with a center-out design, supporting custom color spectrums and different value ranges for various setting types. It provides a clean, professional interface for displaying setting values with visual feedback, making it an essential component for settings and configuration displays in the VISOR application.

## File Location

```
src/components/SettingSliderDisplay.tsx
```

## Props Interface

```typescript
interface SettingSliderDisplayProps {
  label: string; // Display label for the setting
  value: number | string; // Current value of the setting
  spectrum?: string; // Optional CSS linear-gradient for background
  showLabel?: boolean; // Whether to show label and value (default: false)
}
```

## Key Features

### 🎛️ Visual Slider Display

- **Center-Out Design**: Slider fills from center position
- **Value Visualization**: Clear visual representation of setting values
- **Custom Spectrums**: Support for custom color gradients
- **Range Adaptation**: Different ranges for different setting types

### 📊 Smart Value Handling

- **Exposure Settings**: Special handling for exposure (-5 to +5)
- **Grain Settings**: Special handling for grain (0 to 100)
- **Standard Settings**: Default range (-100 to +100)
- **Value Clamping**: Automatic value clamping within ranges

### 🎨 Visual Design

- **Professional Styling**: Clean, modern slider design
- **Color Spectrums**: Custom background gradients
- **Handle Indicator**: Clear visual handle for current value
- **Fill Animation**: Smooth fill animation from center

### 🔧 Technical Features

- **Responsive Design**: Adapts to different screen sizes
- **Performance Optimization**: Efficient rendering and updates
- **Accessibility Support**: Full accessibility compliance
- **Type Safety**: Strong TypeScript typing

## Usage Examples

### Basic Usage

```tsx
<SettingSliderDisplay label="Brightness" value={50} />
```

### With Custom Spectrum

```tsx
<SettingSliderDisplay
  label="Temperature"
  value={6500}
  spectrum="linear-gradient(to right, #ff6b6b, #feca57, #48dbfb)"
/>
```

### With Label Display

```tsx
<SettingSliderDisplay label="Exposure" value={1.5} showLabel={true} />
```

### For Different Setting Types

```tsx
// Exposure setting
<SettingSliderDisplay label="Exposure" value={-2} />

// Grain setting
<SettingSliderDisplay label="Grain" value={25} />

// Standard setting
<SettingSliderDisplay label="Contrast" value={75} />
```

## Component Structure

### Main Container

```typescript
<Box sx={{ mb: showLabel ? 2 : 0 }}>
  {/* Label section (conditional) */}
  {/* Slider section */}
</Box>
```

### Label Section

```typescript
{
  showLabel && (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={0.5}
    >
      <Typography variant="body2" fontWeight={500}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={500}
        color="text.secondary"
        sx={{ minWidth: 40, textAlign: "right" }}
      >
        {displayValue}
      </Typography>
    </Box>
  );
}
```

### Slider Container

```typescript
<Box
  sx={{
    position: "relative",
    height: 6,
    borderRadius: 3,
    background: spectrum ? spectrum : (theme) => theme.palette.divider,
  }}
>
  {/* Fill bar */}
  {/* Handle */}
</Box>
```

### Fill Bar

```typescript
<Box
  sx={{
    position: "absolute",
    top: 0,
    height: "100%",
    width: `${fillWidth}%`,
    backgroundColor: "#fff",
    left: `${fromCenter >= 0 ? center : center - fillWidth}%`,
    borderRadius: 3,
    opacity: spectrum ? 0.3 : 1,
  }}
/>
```

### Handle

```typescript
<Box
  sx={{
    position: "absolute",
    top: -3,
    left: `${valuePercent}%`,
    transform: "translateX(-50%)",
    width: 12,
    height: 12,
    borderRadius: "50%",
    border: "2px solid white",
    backgroundColor: "text.secondary",
  }}
/>
```

### Value Calculation Logic

```typescript
const parsed = parseFloat(value.toString());
if (isNaN(parsed)) return null;

const isExposure = label.toLowerCase() === "exposure";
const isGrain = label.toLowerCase() === "grain";

const min = isExposure ? -5 : isGrain ? 0 : -100;
const max = isExposure ? 5 : isGrain ? 100 : 100;

const clamped = Math.max(min, Math.min(parsed, max));
const range = max - min;

const center = ((0 - min) / range) * 100;
const valuePercent = ((clamped - min) / range) * 100;
const fromCenter = valuePercent - center;
const fillWidth = Math.abs(fromCenter);

const displayValue = parsed > 0 ? `+${parsed}` : parsed.toString();
```

## Styling & Theming

### Container Styling

```typescript
sx={{
  mb: showLabel ? 2 : 0, // Conditional margin based on label display
}}
```

### Label Container Styling

```typescript
sx={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  mb: 0.5,
}}
```

### Label Text Styling

```typescript
sx={{
  fontWeight: 500,
}}
```

### Value Text Styling

```typescript
sx={{
  fontWeight: 500,
  color: "text.secondary",
  minWidth: 40,
  textAlign: "right",
}}
```

### Slider Container Styling

```typescript
sx={{
  position: "relative",
  height: 6,
  borderRadius: 3,
  background: spectrum ? spectrum : (theme) => theme.palette.divider,
}}
```

### Fill Bar Styling

```typescript
sx={{
  position: "absolute",
  top: 0,
  height: "100%",
  width: `${fillWidth}%`,
  backgroundColor: "#fff",
  left: `${fromCenter >= 0 ? center : center - fillWidth}%`,
  borderRadius: 3,
  opacity: spectrum ? 0.3 : 1,
}}
```

### Handle Styling

```typescript
sx={{
  position: "absolute",
  top: -3,
  left: `${valuePercent}%`,
  transform: "translateX(-50%)",
  width: 12,
  height: 12,
  borderRadius: "50%",
  border: "2px solid white",
  backgroundColor: "text.secondary",
}}
```

## Performance Considerations

### Optimization Strategies

- **Value Parsing**: Efficient value parsing and validation
- **Conditional Rendering**: Efficient conditional label rendering
- **Calculation Caching**: Cached calculation results
- **Memory Management**: Clean component lifecycle

### Rendering Performance

- **Minimal Re-renders**: Only re-renders on value changes
- **Efficient Calculations**: Optimized percentage calculations
- **Smooth Animations**: Efficient fill animations
- **Handle Positioning**: Optimized handle positioning

### Memory Management

- **No Internal State**: Stateless component design
- **Event Cleanup**: No event listeners to clean up
- **Memory Leaks**: Prevention of memory leaks
- **Component Cleanup**: Clean component unmounting

## Error Handling

### Value Errors

- **Invalid Values**: Safe handling of invalid numeric values
- **NaN Handling**: Graceful handling of NaN values
- **Type Errors**: Safe type checking for values
- **Range Errors**: Automatic value clamping

### Display Errors

- **Spectrum Errors**: Safe spectrum rendering error handling
- **Theme Errors**: Fallback for theme issues
- **Layout Errors**: Graceful layout error handling
- **Styling Errors**: Safe styling error handling

### User Experience Errors

- **Value Display**: Safe value display handling
- **Label Display**: Graceful label display error handling
- **Slider Display**: Safe slider display error handling
- **Accessibility Errors**: Proper accessibility handling

## Accessibility Features

### ARIA Support

- **Slider Role**: Proper role for slider component
- **Value Labels**: Clear value labels for screen readers
- **Range Information**: Proper range announcements
- **State Information**: Current value state announcements

### Screen Reader Support

- **Descriptive Text**: Clear descriptions for screen readers
- **Value Announcements**: Setting value announcements
- **Range Information**: Range information announcements
- **Context Information**: Proper context for sliders

### Keyboard Navigation

- **Focus Management**: Proper focus handling
- **Keyboard Shortcuts**: Enhanced keyboard controls
- **Focus Indicators**: Visible focus states
- **Tab Order**: Logical tab order

### Visual Accessibility

- **Color Contrast**: Maintains color contrast in all states
- **Visual Feedback**: Clear visual indicators
- **Focus Indicators**: Visible focus states
- **Touch Targets**: Adequate touch target sizes

## Testing Integration

### Cypress Testing

```typescript
// Test selectors for setting slider display functionality
data-cy="setting-slider"           // Main slider container
data-cy="slider-label"             // Slider label
data-cy="slider-value"             // Slider value display
data-cy="slider-track"             // Slider track
data-cy="slider-fill"              // Slider fill bar
data-cy="slider-handle"            // Slider handle
data-cy="slider-spectrum"          // Slider spectrum background
```

### Test Scenarios

1. **Value Display**: Test value display functionality
2. **Range Handling**: Test different value ranges
3. **Spectrum Display**: Test custom spectrum rendering
4. **Label Display**: Test label display functionality
5. **Accessibility**: Test screen reader and keyboard navigation
6. **Performance**: Test slider rendering performance

### Performance Testing

- **Slider Rendering**: Monitor slider rendering performance
- **Value Calculations**: Test value calculation performance
- **Memory Usage**: Check for memory leaks
- **Animation Performance**: Test fill animation performance

## Dependencies

### Internal Dependencies

- **Material-UI Components**: Box, Typography
- **React**: Core React functionality
- **TypeScript**: Type definitions and interfaces

### External Dependencies

- **Material-UI**: Box, Typography
- **React**: Core React functionality
- **CSS**: Custom styling and transitions

### Browser Support

- **CSS Border Radius**: Modern border radius support
- **CSS Transforms**: Modern transform support
- **CSS Gradients**: Modern gradient support
- **CSS Flexbox**: Modern flexbox support

## Future Enhancements

### Planned Features

1. **Interactive Sliders**: Click and drag functionality
2. **Slider Presets**: Predefined slider configurations
3. **Slider History**: Track slider adjustment history
4. **Slider Export**: Export slider configurations
5. **Real-time Updates**: Live value updates

### Performance Improvements

1. **Web Workers**: Background calculation processing
2. **Slider Caching**: Enhanced slider value caching
3. **Lazy Loading**: Lazy load slider components
4. **Bundle Optimization**: Code splitting for slider components

### UX Enhancements

1. **Slider Animations**: Smooth slider transition animations
2. **Slider Information**: Detailed slider information display
3. **Slider Sharing**: Share slider configurations
4. **Slider Education**: Educational slider content
5. **Advanced Controls**: Additional slider controls

---

_This component provides a professional and flexible slider display for settings in the VISOR application, supporting various value ranges and custom visual styling._
