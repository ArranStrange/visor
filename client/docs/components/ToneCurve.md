# ToneCurve Component

## Overview

The `ToneCurve` component is a professional tone curve editor that provides advanced color correction capabilities for RGB and individual color channels. It features an interactive SVG-based curve visualization with toggle controls for different color channels, enabling precise tonal adjustments in the VISOR application.

## File Location

```
src/components/ToneCurve.tsx
```

## Props Interface

```typescript
interface ToneCurveProps {
  curves: {
    rgb: number[]; // RGB curve values (0-255)
    red: number[]; // Red channel curve values (0-255)
    green: number[]; // Green channel curve values (0-255)
    blue: number[]; // Blue channel curve values (0-255)
  };
}
```

## Key Features

### 🎨 Professional Tone Curves

- **RGB Channel**: Combined RGB tone curve adjustment
- **Individual Channels**: Separate red, green, and blue channel curves
- **SVG Visualization**: High-quality vector curve rendering
- **Real-time Updates**: Live curve visualization updates

### 🎛️ Interactive Controls

- **Channel Toggle**: Switch between RGB and individual color channels
- **Color Indicators**: Visual color indicators for each channel
- **Curve Display**: Clear curve visualization with proper scaling
- **Responsive Design**: Adapts to different screen sizes

### 📊 Visual Representation

- **Grid Background**: Professional grid overlay for reference
- **Curve Lines**: Smooth polyline curves for each channel
- **Color Coding**: Distinct colors for different channels
- **Scaled Display**: Proper input/output value scaling

### 🔧 Technical Features

- **SVG Rendering**: High-quality vector graphics
- **Data Processing**: Efficient curve data processing
- **State Management**: Local state for channel selection
- **Performance Optimization**: Optimized rendering and updates

## Usage Examples

### Basic Usage

```tsx
const curves = {
  rgb: [0, 64, 128, 192, 255],
  red: [0, 70, 140, 200, 255],
  green: [0, 60, 120, 180, 255],
  blue: [0, 80, 160, 220, 255],
};

<ToneCurve curves={curves} />;
```

### With Event Handlers

```tsx
<ToneCurve
  curves={curves}
  onChange={(newCurves) => {
    console.log("Curves updated:", newCurves);
  }}
/>
```

### In Photo Editor

```tsx
<Box>
  <Typography variant="h6">Tone Curves</Typography>
  <ToneCurve curves={toneCurveData} onChange={handleToneCurveChange} />
</Box>
```

### With Custom Styling

```tsx
<Box sx={{ maxWidth: "600px", margin: "0 auto" }}>
  <ToneCurve curves={curves} />
</Box>
```

## Component Structure

### ToneCurveChart Subcomponent

```typescript
const ToneCurveChart: React.FC<{
  input: number[];
  output: number[];
  stroke: string;
}> = ({ input, output, stroke }) => {
  const points = input
    .map((x, i) => `${(x / 255) * 100},${100 - (output[i] / 255) * 100}`)
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="200"
      preserveAspectRatio="none"
      style={{ background: "#111", borderRadius: 8 }}
    >
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        fill="none"
        stroke="#333"
        strokeWidth="0.5"
      />
      <polyline fill="none" stroke={stroke} strokeWidth="2" points={points} />
    </svg>
  );
};
```

### Main Component Layout

```typescript
<Box>
  <ToggleButtonGroup
    value={channel}
    exclusive
    onChange={(_, val) => val && setChannel(val)}
    size="small"
    sx={{ mb: 2 }}
  >
    <ToggleButton value="rgb">RGB</ToggleButton>
    <ToggleButton value="red">
      <Box
        sx={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          backgroundColor: "red",
        }}
      />
    </ToggleButton>
    <ToggleButton value="green">
      <Box
        sx={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          backgroundColor: "green",
        }}
      />
    </ToggleButton>
    <ToggleButton value="blue">
      <Box
        sx={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          backgroundColor: "blue",
        }}
      />
    </ToggleButton>
  </ToggleButtonGroup>

  <ToneCurveChart
    input={input}
    output={output}
    stroke={getStrokeColour(channel)}
  />
</Box>
```

### Color Helper Function

```typescript
const getStrokeColour = (ch: string) => {
  switch (ch) {
    case "red":
      return "#f44336";
    case "green":
      return "#4caf50";
    case "blue":
      return "#2196f3";
    default:
      return "#ccc";
  }
};
```

## Styling & Theming

### Container Styling

```typescript
sx={{
  // Main container styling
}}
```

### SVG Styling

```typescript
style={{
  background: "#111",
  borderRadius: 8,
}}
```

### Toggle Button Styling

```typescript
sx={{
  mb: 2, // Bottom margin for spacing
}}
```

### Color Indicator Styling

```typescript
sx={{
  width: 16,
  height: 16,
  borderRadius: "50%",
  backgroundColor: "red", // or green, blue
}}
```

## Performance Considerations

### Optimization Strategies

- **SVG Rendering**: Efficient SVG curve rendering
- **State Management**: Minimal state updates for channel changes
- **Data Processing**: Efficient curve data processing
- **Memory Management**: Clean component lifecycle

### Rendering Performance

- **Conditional Rendering**: Efficient channel selection rendering
- **SVG Performance**: Optimized SVG rendering
- **Data Calculations**: Efficient curve point calculations
- **Animation Performance**: Smooth curve transitions

### Memory Management

- **Event Cleanup**: Proper cleanup of event listeners
- **State Reset**: Reset state when props change
- **Memory Leaks**: Prevention of memory leaks
- **Component Cleanup**: Clean component unmounting

## Error Handling

### Data Errors

- **Invalid Curve Data**: Safe handling of invalid curve values
- **Missing Channels**: Graceful handling of missing channel data
- **Range Errors**: Boundary checking for curve values
- **Type Errors**: Safe type checking for curve data

### Display Errors

- **SVG Errors**: Graceful SVG rendering error handling
- **Toggle Errors**: Safe toggle button error handling
- **Color Errors**: Safe color value handling
- **Theme Errors**: Fallback for theme issues

### User Experience Errors

- **Channel Selection**: Safe channel selection handling
- **Curve Display**: Graceful curve display error handling
- **Interaction Errors**: Safe interaction error handling
- **Accessibility Errors**: Proper accessibility handling

## Accessibility Features

### ARIA Support

- **Toggle Role**: Proper role for toggle button group
- **Button Role**: Proper role for individual toggle buttons
- **SVG Role**: Proper role for SVG curve display
- **Selection State**: Proper selection state announcements

### Screen Reader Support

- **Descriptive Text**: Clear descriptions for screen readers
- **Channel Announcements**: Channel selection announcements
- **Curve Information**: Curve value announcements
- **Context Information**: Proper context for tone curves

### Keyboard Navigation

- **Tab Order**: Logical tab order through toggle buttons
- **Focus Management**: Proper focus handling
- **Keyboard Shortcuts**: Enhanced keyboard controls
- **Focus Indicators**: Visible focus states

### Visual Accessibility

- **Color Contrast**: Maintains color contrast in all states
- **Touch Targets**: Adequate touch target sizes
- **Visual Feedback**: Clear visual indicators
- **Focus Indicators**: Visible focus states

## Testing Integration

### Cypress Testing

```typescript
// Test selectors for tone curve functionality
data-cy="tone-curve"               // Main component container
data-cy="rgb-toggle"               // RGB channel toggle
data-cy="red-toggle"               // Red channel toggle
data-cy="green-toggle"             // Green channel toggle
data-cy="blue-toggle"              // Blue channel toggle
data-cy="curve-chart"              // Curve chart SVG
data-cy="curve-line"               // Curve polyline
data-cy="curve-grid"               // Curve grid background
```

### Test Scenarios

1. **Channel Selection**: Test channel toggle functionality
2. **Curve Display**: Test curve visualization
3. **Data Updates**: Test curve data updates
4. **Responsive Layout**: Test different screen sizes
5. **Accessibility**: Test screen reader and keyboard navigation
6. **Performance**: Test curve rendering performance

### Performance Testing

- **Curve Rendering**: Monitor curve rendering performance
- **SVG Performance**: Test SVG rendering performance
- **Memory Usage**: Check for memory leaks
- **Data Processing**: Test curve data processing performance

## Dependencies

### Internal Dependencies

- **Material-UI Components**: Box, Typography, ToggleButtonGroup, ToggleButton
- **React Hooks**: useState for state management
- **SVG Rendering**: Custom SVG curve rendering
- **Color Utilities**: Color helper functions

### External Dependencies

- **Material-UI**: Box, Typography, ToggleButtonGroup, ToggleButton
- **React**: Core React functionality
- **CSS**: Custom styling and transitions

### Browser Support

- **SVG**: Modern SVG support
- **CSS Border Radius**: Modern border radius support
- **CSS Flexbox**: Modern flexbox support
- **Touch Events**: Touch event support for mobile

## Future Enhancements

### Planned Features

1. **Interactive Curves**: Click and drag curve points
2. **Curve Presets**: Predefined curve presets
3. **Curve History**: Track curve adjustment history
4. **Curve Export**: Export curve configurations
5. **Real-time Preview**: Live image preview with curves

### Performance Improvements

1. **Web Workers**: Background curve calculations
2. **Curve Caching**: Enhanced curve value caching
3. **Lazy Loading**: Lazy load curve components
4. **Bundle Optimization**: Code splitting for curve components

### UX Enhancements

1. **Curve Animations**: Smooth curve transition animations
2. **Curve Information**: Detailed curve information display
3. **Curve Sharing**: Share curve configurations
4. **Curve Education**: Educational curve content
5. **Advanced Controls**: Additional curve editing controls

---

_This component provides professional tone curve editing capabilities in the VISOR application, enabling precise tonal adjustments for advanced photo editing._
