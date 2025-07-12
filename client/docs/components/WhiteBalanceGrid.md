# WhiteBalanceGrid Component

## Overview

The `WhiteBalanceGrid` component is a sophisticated white balance adjustment interface that provides a visual grid-based control for fine-tuning color temperature and tint. It features a 19x19 interactive grid with color-coded dots representing different white balance shifts, enabling precise color correction for professional photo editing in the VISOR application.

## File Location

```
src/components/WhiteBalanceGrid.tsx
```

## Props Interface

```typescript
interface WhiteBalanceGridProps {
  value: WhiteBalanceShift; // Current white balance shift
  onChange: (value: WhiteBalanceShift) => void; // Change handler
}

export type WhiteBalanceShift = {
  r: number; // Red shift value (-9 to +9)
  b: number; // Blue shift value (-9 to +9)
};
```

## Key Features

### 🎨 Visual White Balance Control

- **19x19 Grid**: Comprehensive grid for precise white balance adjustment
- **Color-Coded Dots**: Visual representation of color temperature shifts
- **Interactive Selection**: Click to select white balance values
- **Real-time Feedback**: Immediate visual feedback for selections

### 🎛️ Professional Controls

- **Red/Blue Shifts**: Independent red and blue channel adjustments
- **Crosshair Guides**: Visual guides for neutral reference
- **Value Display**: Clear display of current shift values
- **Responsive Design**: Adapts to different screen sizes

### 📊 Color Temperature Mapping

- **Four Corner Colors**: Green, magenta, blue, and red corners
- **Smooth Interpolation**: Gradual color transitions across the grid
- **Temperature Range**: Full range of color temperature adjustments
- **Tint Control**: Precise tint adjustment capabilities

### 🔧 Technical Features

- **CSS Grid Layout**: Efficient grid rendering with CSS Grid
- **Color Calculations**: Advanced color interpolation algorithms
- **Performance Optimization**: Optimized rendering for large grids
- **Accessibility Support**: Full accessibility compliance

## Usage Examples

### Basic Usage

```tsx
const [whiteBalance, setWhiteBalance] = useState<WhiteBalanceShift>({
  r: 0,
  b: 0,
});

<WhiteBalanceGrid value={whiteBalance} onChange={setWhiteBalance} />;
```

### With Photo Editor

```tsx
<Box>
  <Typography variant="h6">White Balance</Typography>
  <WhiteBalanceGrid
    value={whiteBalanceShift}
    onChange={handleWhiteBalanceChange}
  />
</Box>
```

### With Custom Styling

```tsx
<Box sx={{ maxWidth: "500px", margin: "0 auto" }}>
  <WhiteBalanceGrid value={whiteBalance} onChange={setWhiteBalance} />
</Box>
```

### With Event Handlers

```tsx
<WhiteBalanceGrid
  value={whiteBalance}
  onChange={(newValue) => {
    console.log("White balance changed:", newValue);
    setWhiteBalance(newValue);
  }}
/>
```

## Component Structure

### Grid Container

```typescript
<Box
  sx={{
    position: "relative",
    width: GRID_PIXEL_SIZE,
    height: GRID_PIXEL_SIZE,
    bgcolor: "transparent",
    display: "grid",
    gridTemplateColumns: `repeat(${GRID_SIZE}, ${DOT_SIZE}px)`,
    gridTemplateRows: `repeat(${GRID_SIZE}, ${DOT_SIZE}px)`,
    gap: `${DOT_GAP}px`,
    borderRadius: 2,
    boxShadow: 2,
    overflow: "visible",
  }}
>
  {/* Grid dots and crosshairs */}
</Box>
```

### Grid Dot Rendering

```typescript
{
  GRID_RANGE.flatMap((b, rowIdx) =>
    GRID_RANGE.map((r, colIdx) => {
      const isSelected = value.r === r && value.b === b;
      const isCenter = r === 0 && b === 0;
      return (
        <Box
          key={`${r},${b}`}
          onClick={() => onChange({ r, b })}
          sx={{
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: "50%",
            bgcolor: getWBColor(r, b),
            border: isSelected
              ? "2.5px solid white"
              : isCenter
              ? "1.5px solid #fff8"
              : "1px solid #222",
            boxSizing: "border-box",
            cursor: "pointer",
            position: "relative",
            zIndex: isSelected ? 2 : 1,
            transition: "border 0.1s, box-shadow 0.1s",
            boxShadow: isSelected ? "0 0 0 2px #000" : undefined,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      );
    })
  );
}
```

### Crosshair Guides

```typescript
{
  /* Vertical crosshair */
}
<Box
  sx={{
    position: "absolute",
    left: `calc(50% - 1px)`,
    top: 0,
    width: 2,
    height: "100%",
    bgcolor: "white",
    opacity: 0.7,
    zIndex: 3,
    pointerEvents: "none",
  }}
/>;
{
  /* Horizontal crosshair */
}
<Box
  sx={{
    position: "absolute",
    top: `calc(50% - 1px)`,
    left: 0,
    width: "100%",
    height: 2,
    bgcolor: "white",
    opacity: 0.7,
    zIndex: 3,
    pointerEvents: "none",
  }}
/>;
```

### Color Calculation Function

```typescript
function getWBColor(r: number, b: number) {
  // Normalize to 0-1
  const normR = (r + 9) / 18;
  const normB = (b + 9) / 18;
  // Corners: TL (green), TR (magenta), BL (blue), BR (red)
  // Interpolate
  const green = (1 - normR) * (1 - normB);
  const magenta = normR * (1 - normB);
  const blue = (1 - normR) * normB;
  const red = normR * normB;
  // Compose RGB
  const R = Math.round(255 * (red + magenta));
  const G = Math.round(255 * green);
  const B = Math.round(255 * (blue + magenta));
  return `rgb(${R},${G},${B})`;
}
```

## Styling & Theming

### Grid Container Styling

```typescript
sx={{
  position: "relative",
  width: GRID_PIXEL_SIZE,
  height: GRID_PIXEL_SIZE,
  bgcolor: "transparent",
  display: "grid",
  gridTemplateColumns: `repeat(${GRID_SIZE}, ${DOT_SIZE}px)`,
  gridTemplateRows: `repeat(${GRID_SIZE}, ${DOT_SIZE}px)`,
  gap: `${DOT_GAP}px`,
  borderRadius: 2,
  boxShadow: 2,
  overflow: "visible",
}}
```

### Grid Dot Styling

```typescript
sx={{
  width: DOT_SIZE,
  height: DOT_SIZE,
  borderRadius: "50%",
  bgcolor: getWBColor(r, b),
  border: isSelected
    ? "2.5px solid white"
    : isCenter
    ? "1.5px solid #fff8"
    : "1px solid #222",
  boxSizing: "border-box",
  cursor: "pointer",
  position: "relative",
  zIndex: isSelected ? 2 : 1,
  transition: "border 0.1s, box-shadow 0.1s",
  boxShadow: isSelected ? "0 0 0 2px #000" : undefined,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}}
```

### Value Display Styling

```typescript
sx={{
  mt: 2,
  textAlign: "center",
  color: "text.primary",
  fontSize: { xs: "0.80rem", sm: "0.95rem" },
  fontWeight: 600,
  letterSpacing: 0.2,
}}
```

## Performance Considerations

### Optimization Strategies

- **CSS Grid**: Efficient grid rendering with CSS Grid
- **Color Caching**: Cached color calculations for performance
- **Event Handling**: Optimized click event handling
- **Memory Management**: Clean component lifecycle

### Rendering Performance

- **Grid Rendering**: Efficient grid dot rendering
- **Color Calculations**: Optimized color interpolation
- **Selection Updates**: Minimal re-renders for selection changes
- **Animation Performance**: Smooth transition animations

### Memory Management

- **Event Cleanup**: Proper cleanup of event listeners
- **State Management**: Efficient state updates
- **Memory Leaks**: Prevention of memory leaks
- **Component Cleanup**: Clean component unmounting

## Error Handling

### Props Errors

- **Invalid Values**: Safe handling of invalid white balance values
- **Missing Props**: Graceful handling of missing props
- **Type Errors**: Safe type checking for props
- **Range Errors**: Boundary checking for shift values

### Interaction Errors

- **Click Errors**: Graceful click error handling
- **Grid Errors**: Safe grid rendering error handling
- **Color Errors**: Safe color calculation error handling
- **Event Errors**: Safe event listener management

### User Experience Errors

- **Selection Errors**: Safe selection handling
- **Display Errors**: Graceful display error handling
- **Value Errors**: Safe value display handling
- **Accessibility Errors**: Proper accessibility handling

## Accessibility Features

### ARIA Support

- **Grid Role**: Proper role for interactive grid
- **Button Role**: Proper role for grid dots
- **Selection State**: Proper selection state announcements
- **Value Labels**: Clear value labels for screen readers

### Screen Reader Support

- **Descriptive Text**: Clear descriptions for screen readers
- **Value Announcements**: White balance value announcements
- **Selection Announcements**: Grid selection announcements
- **Context Information**: Proper context for white balance

### Keyboard Navigation

- **Tab Order**: Logical tab order through grid dots
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
// Test selectors for white balance grid functionality
data-cy="white-balance-grid"        // Main grid container
data-cy="grid-dot"                  // Individual grid dots
data-cy="selected-dot"              // Currently selected dot
data-cy="center-dot"                // Center neutral dot
data-cy="crosshair-vertical"        // Vertical crosshair guide
data-cy="crosshair-horizontal"      // Horizontal crosshair guide
data-cy="value-display"             // Value display text
```

### Test Scenarios

1. **Grid Selection**: Test grid dot selection
2. **Value Updates**: Test white balance value updates
3. **Visual Feedback**: Test selection visual feedback
4. **Responsive Layout**: Test different screen sizes
5. **Accessibility**: Test screen reader and keyboard navigation
6. **Performance**: Test grid rendering performance

### Performance Testing

- **Grid Rendering**: Monitor grid rendering performance
- **Color Calculations**: Test color calculation performance
- **Memory Usage**: Check for memory leaks
- **Interaction Performance**: Test grid interaction performance

## Dependencies

### Internal Dependencies

- **Material-UI Components**: Box, Typography
- **React**: Core React functionality
- **TypeScript**: Type definitions and interfaces
- **Color Utilities**: Color calculation functions

### External Dependencies

- **Material-UI**: Box, Typography
- **React**: Core React functionality
- **CSS**: Custom styling and transitions

### Browser Support

- **CSS Grid**: Modern CSS grid support
- **CSS Border Radius**: Modern border radius support
- **CSS Transitions**: Modern transition support
- **Touch Events**: Touch event support for mobile

## Future Enhancements

### Planned Features

1. **Preset White Balance**: Predefined white balance presets
2. **White Balance History**: Track white balance adjustment history
3. **Advanced Controls**: Additional white balance controls
4. **White Balance Export**: Export white balance settings
5. **Real-time Preview**: Live image preview with adjustments

### Performance Improvements

1. **Web Workers**: Background color calculations
2. **Color Caching**: Enhanced color value caching
3. **Lazy Loading**: Lazy load grid components
4. **Bundle Optimization**: Code splitting for grid components

### UX Enhancements

1. **Grid Animations**: Smooth grid transition animations
2. **White Balance Information**: Detailed white balance information
3. **White Balance Sharing**: Share white balance configurations
4. **White Balance Education**: Educational white balance content
5. **Advanced Grid**: Enhanced grid visualization

---

_This component provides professional white balance adjustment capabilities in the VISOR application, enabling precise color temperature and tint control for advanced photo editing._
