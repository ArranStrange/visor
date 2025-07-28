# ColorGradingWheels Component

## Overview

The `ColorGradingWheels` component is a sophisticated color grading interface that provides professional-grade color correction tools with three interactive color wheels for shadows, midtones, and highlights. It features real-time color visualization, luminance controls, blending options, and balance adjustments, making it an essential tool for advanced photo editing in the VISOR application.

## File Location

```
src/components/ColorGradingWheels.tsx
```

## Props Interface

```typescript
interface ColorGradingProps {
  shadowHue?: number; // Shadow hue value (0-360)
  shadowSat?: number; // Shadow saturation value (0-100)
  shadowLuminance?: number; // Shadow luminance value (-100 to 100)
  midtoneHue?: number; // Midtone hue value (0-360)
  midtoneSat?: number; // Midtone saturation value (0-100)
  midtoneLuminance?: number; // Midtone luminance value (-100 to 100)
  highlightHue?: number; // Highlight hue value (0-360)
  highlightSat?: number; // Highlight saturation value (0-100)
  highlightLuminance?: number; // Highlight luminance value (-100 to 100)
  blending?: number; // Blending value (0-100)
  balance?: number; // Balance value (-100 to 100)
}
```

## Key Features

### 🎨 Professional Color Grading

- **Three Color Wheels**: Shadows, midtones, and highlights
- **Interactive Wheels**: Click to select and adjust color values
- **Real-time Visualization**: Live color preview with thumb indicators
- **HSL Color Space**: Hue, saturation, and luminance controls

### 🎛️ Advanced Controls

- **Luminance Sliders**: Precise luminance adjustment (-100 to 100)
- **Blending Controls**: Color blending intensity (0-100)
- **Balance Adjustment**: Color balance control (-100 to 100)
- **Centered Sliders**: Professional center-out slider design

### 📱 Responsive Design

- **Mobile Optimization**: Stacked layout on mobile devices
- **Touch-Friendly**: Optimized for touch interactions
- **Responsive Wheels**: Adaptive wheel sizing
- **Cross-Platform**: Works on desktop and mobile

### 🔧 Technical Features

- **SVG Color Wheels**: High-quality vector color wheels
- **Conic Gradients**: Smooth color transitions
- **Polar Coordinates**: Accurate color wheel positioning
- **Custom Styling**: Professional Material-UI integration

## Usage Examples

### Basic Usage

```tsx
<ColorGradingWheels
  shadowHue={220}
  shadowSat={30}
  shadowLuminance={-20}
  midtoneHue={45}
  midtoneSat={15}
  midtoneLuminance={5}
  highlightHue={60}
  highlightSat={25}
  highlightLuminance={15}
  blending={65}
  balance={10}
/>
```

### With Event Handlers

```tsx
<ColorGradingWheels
  shadowHue={shadowHue}
  shadowSat={shadowSat}
  shadowLuminance={shadowLuminance}
  midtoneHue={midtoneHue}
  midtoneSat={midtoneSat}
  midtoneLuminance={midtoneLuminance}
  highlightHue={highlightHue}
  highlightSat={highlightSat}
  highlightLuminance={highlightLuminance}
  blending={blending}
  balance={balance}
  onChange={(values) => {
    // Handle color changes
    console.log("Color values changed:", values);
  }}
/>
```

### In Photo Editor

```tsx
<Box>
  <Typography variant="h6">Color Grading</Typography>
  <ColorGradingWheels
    {...colorGradingValues}
    onChange={handleColorGradingChange}
  />
</Box>
```

## Component Structure

### ColorWheel Subcomponent

```typescript
function ColorWheel({
  hue = 0,
  sat = 0,
  selected,
  onClick,
}: {
  hue?: number;
  sat?: number;
  selected: boolean;
  onClick: () => void;
}) {
  // Polar coordinate calculation
  const angle = ((hue ?? 0) - 90) * (Math.PI / 180);
  const radius = ((sat ?? 0) / 100) * (wheelSize / 2 - thumbSize / 2);
  const cx = wheelSize / 2 + radius * Math.cos(angle);
  const cy = wheelSize / 2 + radius * Math.sin(angle);

  return (
    <Box sx={{ position: "relative", width: wheelSize, height: wheelSize }}>
      {/* SVG Color Wheel */}
      <svg width={wheelSize} height={wheelSize}>
        {/* Color wheel implementation */}
      </svg>
      {/* Thumb indicator */}
      {selected && (
        <Box
          sx={{
            position: "absolute",
            left: cx - thumbSize / 2,
            top: cy - thumbSize / 2,
            width: thumbSize,
            height: thumbSize,
            borderRadius: "50%",
            border: "2px solid #fff",
            boxShadow: "0 0 4px 2px rgba(0,0,0,0.5)",
            background: hslColor(hue ?? 0, sat ?? 100, 0.5),
            pointerEvents: "none",
          }}
        />
      )}
    </Box>
  );
}
```

### CenteredSlider Component

```typescript
const CenteredSlider = styled(Slider)(({ theme }) => ({
  color: "#fff",
  height: 4,
  padding: "13px 0",
  "& .MuiSlider-rail": {
    backgroundColor: "#444",
    opacity: 1,
    height: 4,
    zIndex: 1,
  },
  "& .MuiSlider-track": {
    backgroundColor: "#fff",
    height: 4,
    zIndex: 2,
  },
  "& .MuiSlider-thumb": {
    width: 16,
    height: 16,
    backgroundColor: "#fff",
    border: "2px solid #222",
    boxShadow: "0 2px 8px 2px rgba(0,0,0,0.25)",
    zIndex: 3,
    position: "relative",
  },
}));
```

### Main Component Layout

```typescript
<Box>
  <Stack
    direction={isMobile ? "column" : "row"}
    spacing={isMobile ? 3 : 4}
    alignItems="center"
    justifyContent="center"
    mb={2}
  >
    {/* Shadow Wheel */}
    <Box>
      <Typography>Shadows</Typography>
      <ColorWheel {...shadowProps} />
    </Box>

    {/* Midtone Wheel */}
    <Box>
      <Typography>Midtones</Typography>
      <ColorWheel {...midtoneProps} />
    </Box>

    {/* Highlight Wheel */}
    <Box>
      <Typography>Highlights</Typography>
      <ColorWheel {...highlightProps} />
    </Box>
  </Stack>

  {/* Control Sliders */}
  <Box sx={{ mt: 2 }}>{/* Luminance, Blending, Balance sliders */}</Box>
</Box>
```

## Styling & Theming

### Container Styling

```typescript
sx={{
  // Main container styling
}}
```

### Color Wheel Styling

```typescript
sx={{
  position: "relative",
  width: wheelSize,
  height: wheelSize,
  cursor: "pointer",
}}
```

### Thumb Styling

```typescript
sx={{
  position: "absolute",
  left: cx - thumbSize / 2,
  top: cy - thumbSize / 2,
  width: thumbSize,
  height: thumbSize,
  borderRadius: "50%",
  border: "2px solid #fff",
  boxShadow: "0 0 4px 2px rgba(0,0,0,0.5)",
  background: hslColor(hue ?? 0, sat ?? 100, 0.5),
  pointerEvents: "none",
}}
```

### Slider Styling

```typescript
sx={{
  display: "flex",
  alignItems: "center",
  mb: 1,
}}
```

## Performance Considerations

### Optimization Strategies

- **SVG Rendering**: Efficient SVG color wheel rendering
- **State Management**: Minimal state updates for color changes
- **Event Handling**: Optimized click and hover handling
- **Memory Management**: Clean component lifecycle

### Rendering Performance

- **Conditional Rendering**: Efficient wheel selection rendering
- **Slider Performance**: Optimized slider calculations
- **Color Calculations**: Efficient HSL color calculations
- **Animation Performance**: Smooth color transitions

### Memory Management

- **Event Cleanup**: Proper cleanup of event listeners
- **State Reset**: Reset state when props change
- **Memory Leaks**: Prevention of memory leaks
- **Component Cleanup**: Clean component unmounting

## Error Handling

### Color Errors

- **Invalid HSL Values**: Safe handling of invalid color values
- **Range Errors**: Boundary checking for color ranges
- **Calculation Errors**: Safe mathematical calculations
- **Display Errors**: Graceful color display errors

### Interaction Errors

- **Click Errors**: Graceful click error handling
- **Touch Errors**: Safe touch interaction handling
- **Slider Errors**: Proper slider error handling
- **Event Errors**: Safe event listener management

### User Experience Errors

- **Selection Errors**: Safe wheel selection handling
- **Value Errors**: Safe value display handling
- **Animation Errors**: Graceful animation error handling
- **Accessibility Errors**: Proper accessibility handling

## Accessibility Features

### ARIA Support

- **Wheel Role**: Proper role for color wheels
- **Slider Role**: Proper role for sliders
- **Selection State**: Proper selection state announcements
- **Value Labels**: Clear value labels for screen readers

### Screen Reader Support

- **Descriptive Text**: Clear descriptions for screen readers
- **Value Announcements**: Color value announcements
- **Selection Announcements**: Wheel selection announcements
- **Context Information**: Proper context for color grading

### Keyboard Navigation

- **Tab Order**: Logical tab order through wheels and sliders
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
// Test selectors for color grading functionality
data-cy="color-grading-wheels"     // Main component container
data-cy="shadow-wheel"              // Shadow color wheel
data-cy="midtone-wheel"             // Midtone color wheel
data-cy="highlight-wheel"           // Highlight color wheel
data-cy="luminance-slider"          // Luminance slider
data-cy="blending-slider"           // Blending slider
data-cy="balance-slider"            // Balance slider
data-cy="color-thumb"               // Color wheel thumb
```

### Test Scenarios

1. **Wheel Selection**: Test color wheel selection
2. **Color Changes**: Test color value changes
3. **Slider Controls**: Test slider functionality
4. **Responsive Layout**: Test different screen sizes
5. **Accessibility**: Test screen reader and keyboard navigation
6. **Performance**: Test color calculation performance

### Performance Testing

- **Color Calculations**: Monitor color calculation performance
- **Wheel Rendering**: Test color wheel rendering performance
- **Memory Usage**: Check for memory leaks
- **Interaction Performance**: Test wheel and slider interaction performance

## Dependencies

### Internal Dependencies

- **Material-UI Components**: Box, Typography, Slider, Stack
- **Custom Styling**: Styled components for sliders
- **Color Utilities**: HSL color conversion functions
- **React Hooks**: useState for state management

### External Dependencies

- **Material-UI**: Box, Typography, Slider, Stack, useTheme, useMediaQuery, styled
- **React**: Core React functionality
- **CSS**: Custom styling and transitions

### Browser Support

- **SVG**: Modern SVG support
- **CSS Conic Gradients**: Modern conic gradient support
- **CSS Transforms**: Modern transform support
- **Touch Events**: Touch event support for mobile

## Future Enhancements

### Planned Features

1. **Color Presets**: Predefined color grading presets
2. **Color History**: Track color adjustment history
3. **Advanced Blending**: More sophisticated blending modes
4. **Color Export**: Export color grading settings
5. **Real-time Preview**: Live image preview with adjustments

### Performance Improvements

1. **Web Workers**: Background color calculations
2. **Color Caching**: Enhanced color value caching
3. **Lazy Loading**: Lazy load color wheels
4. **Bundle Optimization**: Code splitting for color components

### UX Enhancements

1. **Color Animations**: Smooth color transition animations
2. **Color Information**: Detailed color information display
3. **Color Sharing**: Share color grading configurations
4. **Color Education**: Educational color grading content
5. **Advanced Controls**: Additional color grading controls

---

_This component provides professional-grade color grading capabilities in the VISOR application, enabling advanced photo editing with precise color control._
