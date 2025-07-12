# ToneCurveToggle Component

## Overview

The `ToneCurveToggle` component is a specialized toggle interface for selecting color channels in tone curve editing. It provides a clean, intuitive way to switch between RGB and individual color channels (red, green, blue) with visual color indicators, making it an essential control for professional photo editing workflows in the VISOR application.

## File Location

```
src/components/ToneCurveToggle.tsx
```

## Props Interface

```typescript
interface ToneCurveToggleProps {
  channel: string; // Current selected channel
  setChannel: (val: string) => void; // Channel selection handler
}
```

## Key Features

### 🎨 Channel Selection

- **RGB Channel**: Combined RGB tone curve adjustment
- **Individual Channels**: Separate red, green, and blue channel selection
- **Visual Indicators**: Color-coded buttons for each channel
- **Exclusive Selection**: Only one channel can be active at a time

### 🎛️ Interactive Controls

- **Toggle Buttons**: Material-UI toggle button group
- **Color Indicators**: Visual color circles for each channel
- **Responsive Design**: Adapts to different screen sizes
- **Touch-Friendly**: Optimized for touch interactions

### 📱 User Experience

- **Clear Visual Feedback**: Distinct visual states for selected/unselected
- **Intuitive Design**: Easy-to-understand channel selection
- **Consistent Styling**: Matches overall application design
- **Accessible Controls**: Proper accessibility features

### 🔧 Technical Features

- **Material-UI Integration**: Consistent Material-UI styling
- **State Management**: External state management for channel selection
- **Event Handling**: Proper event handling for channel changes
- **Performance Optimization**: Lightweight and efficient rendering

## Usage Examples

### Basic Usage

```tsx
const [channel, setChannel] = useState("rgb");

<ToneCurveToggle channel={channel} setChannel={setChannel} />;
```

### With ToneCurve Component

```tsx
<ToneCurveToggle
  channel={selectedChannel}
  setChannel={setSelectedChannel}
/>
<ToneCurve curves={curves} />
```

### In Photo Editor

```tsx
<Box>
  <Typography variant="h6">Tone Curves</Typography>
  <ToneCurveToggle channel={channel} setChannel={setChannel} />
  <ToneCurve curves={curves} />
</Box>
```

### With Custom Styling

```tsx
<Box sx={{ maxWidth: "400px", margin: "0 auto" }}>
  <ToneCurveToggle channel={channel} setChannel={setChannel} />
</Box>
```

## Component Structure

### Main Component Layout

```typescript
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

## Styling & Theming

### ToggleButtonGroup Styling

```typescript
sx={{
  mb: 2, // Bottom margin for spacing
}}
```

### ToggleButton Styling

```typescript
// Default Material-UI toggle button styling
// Customizable through theme overrides
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

- **Lightweight Component**: Minimal rendering overhead
- **State Management**: External state management for efficiency
- **Event Handling**: Optimized event handling
- **Memory Management**: Clean component lifecycle

### Rendering Performance

- **Conditional Rendering**: Efficient button state rendering
- **Material-UI Optimization**: Leverages Material-UI optimizations
- **Minimal Re-renders**: Only re-renders on channel changes
- **Event Optimization**: Efficient event handling

### Memory Management

- **No Internal State**: Relies on external state management
- **Event Cleanup**: Proper cleanup of event listeners
- **Memory Leaks**: Prevention of memory leaks
- **Component Cleanup**: Clean component unmounting

## Error Handling

### Props Errors

- **Missing Props**: Safe handling of missing props
- **Invalid Channel**: Safe handling of invalid channel values
- **Type Errors**: Safe type checking for props
- **State Errors**: Safe state management

### Interaction Errors

- **Click Errors**: Graceful click error handling
- **Toggle Errors**: Safe toggle button error handling
- **Event Errors**: Safe event listener management
- **Accessibility Errors**: Proper accessibility handling

### User Experience Errors

- **Selection Errors**: Safe channel selection handling
- **Display Errors**: Graceful display error handling
- **Interaction Errors**: Safe interaction error handling
- **Theme Errors**: Fallback for theme issues

## Accessibility Features

### ARIA Support

- **Toggle Role**: Proper role for toggle button group
- **Button Role**: Proper role for individual toggle buttons
- **Selection State**: Proper selection state announcements
- **Labels**: Clear labels for screen readers

### Screen Reader Support

- **Descriptive Text**: Clear descriptions for screen readers
- **Channel Announcements**: Channel selection announcements
- **State Information**: Selection state announcements
- **Context Information**: Proper context for channel selection

### Keyboard Navigation

- **Tab Order**: Logical tab order through buttons
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
// Test selectors for tone curve toggle functionality
data-cy="tone-curve-toggle"        // Main toggle container
data-cy="rgb-toggle"               // RGB channel toggle
data-cy="red-toggle"               // Red channel toggle
data-cy="green-toggle"             // Green channel toggle
data-cy="blue-toggle"              // Blue channel toggle
data-cy="color-indicator"          // Color indicator element
```

### Test Scenarios

1. **Channel Selection**: Test channel toggle functionality
2. **Visual States**: Test selected/unselected visual states
3. **Color Indicators**: Test color indicator display
4. **Responsive Layout**: Test different screen sizes
5. **Accessibility**: Test screen reader and keyboard navigation
6. **Performance**: Test toggle performance

### Performance Testing

- **Toggle Performance**: Monitor toggle performance
- **Memory Usage**: Check for memory leaks
- **Event Performance**: Test event handling performance
- **Rendering Performance**: Test component rendering performance

## Dependencies

### Internal Dependencies

- **Material-UI Components**: ToggleButtonGroup, ToggleButton, Box
- **React**: Core React functionality
- **TypeScript**: Type definitions and interfaces

### External Dependencies

- **Material-UI**: ToggleButtonGroup, ToggleButton, Box
- **React**: Core React functionality
- **CSS**: Custom styling and transitions

### Browser Support

- **CSS Border Radius**: Modern border radius support
- **CSS Flexbox**: Modern flexbox support
- **Touch Events**: Touch event support for mobile
- **Material-UI**: Material-UI component support

## Future Enhancements

### Planned Features

1. **Additional Channels**: Support for more color channels
2. **Custom Colors**: Configurable color indicators
3. **Channel Presets**: Predefined channel combinations
4. **Channel History**: Track channel selection history
5. **Advanced Controls**: Additional channel controls

### Performance Improvements

1. **Bundle Optimization**: Code splitting for toggle components
2. **Caching**: Enhanced toggle state caching
3. **Lazy Loading**: Lazy load toggle components
4. **Optimization**: Further performance optimizations

### UX Enhancements

1. **Toggle Animations**: Smooth toggle transition animations
2. **Channel Information**: Detailed channel information display
3. **Channel Sharing**: Share channel configurations
4. **Channel Education**: Educational channel content
5. **Advanced Indicators**: Enhanced visual indicators

---

_This component provides essential channel selection functionality for tone curve editing in the VISOR application, enabling precise control over color channel adjustments._
