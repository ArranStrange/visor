# SettingsDisplay Component

## Overview

The `SettingsDisplay` component is a comprehensive settings interface that provides a flexible and responsive way to display various application settings with visual sliders, color mixer controls, and organized sections. It supports both standard settings and specialized color mixer functionality, making it an essential component for configuration and adjustment interfaces in the VISOR application.

## File Location

```
src/components/SettingsDisplay.tsx
```

## Props Interface

```typescript
interface SettingsDisplayProps {
  settings: Setting[]; // Array of settings to display
  formatValue?: (value: any) => string; // Optional value formatter
}

interface Setting {
  label: string; // Display label for the setting
  key: string; // Unique identifier for the setting
  value: number | string; // Current value of the setting
  spectrum?: string; // Optional color spectrum for slider
  sectionTitle?: string; // Optional section title
}
```

## Key Features

### 🎛️ Flexible Settings Display

- **Dynamic Settings**: Configurable array of settings
- **Responsive Layout**: Adapts to different screen sizes
- **Section Organization**: Optional section titles for grouping
- **Value Formatting**: Customizable value display formatting

### 🎨 Color Mixer Integration

- **Color Selection**: Interactive color picker with 8 color options
- **HSL Controls**: Hue, saturation, and luminance adjustments
- **Visual Feedback**: Color-coded sliders and indicators
- **Dynamic Spectrums**: Context-aware color spectrums

### 📱 Responsive Design

- **Mobile Optimization**: Optimized for mobile devices
- **Flexible Layout**: Responsive grid and flexbox layout
- **Text Wrapping**: Smart text wrapping for labels
- **Touch-Friendly**: Optimized for touch interactions

### 🔧 Technical Features

- **Material-UI Integration**: Consistent Material-UI styling
- **State Management**: Local state for color mixer selection
- **Performance Optimization**: Efficient rendering and updates
- **Accessibility Support**: Full accessibility compliance

## Usage Examples

### Basic Usage

```tsx
const settings = [
  { label: "Brightness", key: "brightness", value: 50 },
  { label: "Contrast", key: "contrast", value: 75 },
  { label: "Saturation", key: "saturation", value: 60 },
];

<SettingsDisplay settings={settings} />;
```

### With Color Mixer

```tsx
const colorMixerSettings = [
  { label: "Hue", key: "hue", value: 0 },
  { label: "Saturation", key: "saturation", value: 50 },
  { label: "Luminance", key: "luminance", value: 25 },
];

<SettingsDisplay settings={colorMixerSettings} />;
```

### With Custom Formatting

```tsx
<SettingsDisplay settings={settings} formatValue={(value) => `${value}%`} />
```

### With Sections

```tsx
const settingsWithSections = [
  {
    label: "Exposure",
    key: "exposure",
    value: 0,
    sectionTitle: "Basic Adjustments",
  },
  {
    label: "Highlights",
    key: "highlights",
    value: -10,
    sectionTitle: "Tone Adjustments",
  },
];

<SettingsDisplay settings={settingsWithSections} />;
```

## Component Structure

### Color Mixer Toggle Section

```typescript
{
  isColorMixer && (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Color Mixer
      </Typography>
      <ToggleButtonGroup
        value={selectedColor}
        exclusive
        onChange={(_, v) => v && setSelectedColor(v)}
        sx={{ mb: 2 }}
      >
        {colorOrder.map(({ key, color }) => (
          <ToggleButton
            key={key}
            value={key}
            sx={{ p: 0.5, mx: 0.5, border: "none" }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: color,
                border:
                  selectedColor === key ? "2px solid #fff" : "2px solid #222",
              }}
            />
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
```

### Settings Mapping

```typescript
{
  settings.map((setting, index) => {
    // Skip color mixer settings if not in color mixer mode
    if (
      isColorMixer &&
      !["hue", "saturation", "luminance"].includes(setting.key)
    ) {
      return null;
    }

    const actualValue =
      isColorMixer && setting.key === "hue"
        ? formatValue(0)
        : formatValue(setting.value);

    const actualSpectrum =
      isColorMixer && setting.key === "hue"
        ? "linear-gradient(to right, #b94a4a, #b98a4a, #b9b84a, #4ab96b, #4ab9b9, #4a6ab9, #8a4ab9, #b94a8a, #b94a4a)"
        : isColorMixer && setting.key === "saturation"
        ? `linear-gradient(to right, #888, ${colorMixerColor(
            selectedColor
          )}, #888)`
        : isColorMixer && setting.key === "luminance"
        ? `linear-gradient(to right, #222, ${colorMixerColor(
            selectedColor
          )}, #fff)`
        : setting.spectrum;

    return (
      <Box key={`${setting.key}-${index}`}>
        {/* Section Title */}
        {setting.sectionTitle && (
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
            sx={{ mt: index > 0 ? 2 : 0 }}
          >
            {setting.sectionTitle}
          </Typography>
        )}

        {/* Setting Row */}
        <Box
          sx={{ display: "flex", alignItems: "center", mb: 1, minHeight: 32 }}
        >
          {/* Label */}
          <Box sx={{ width: { xs: 110, sm: 110, md: 180 }, mr: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {setting.label}
            </Typography>
          </Box>

          {/* Slider */}
          <Box sx={{ flex: 1, mx: 2 }}>
            <SettingSliderDisplay
              label={setting.label}
              value={actualValue}
              spectrum={actualSpectrum}
            />
          </Box>

          {/* Value */}
          <Box sx={{ width: 60, textAlign: "right" }}>
            <Typography variant="body2" color="text.secondary">
              {actualValue}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  });
}
```

### Color Helper Functions

```typescript
const colorOrder = [
  { key: "red", color: "#ff3b30" },
  { key: "orange", color: "#ff9500" },
  { key: "yellow", color: "#ffcc00" },
  { key: "green", color: "#4cd964" },
  { key: "aqua", color: "#5ac8fa" },
  { key: "blue", color: "#007aff" },
  { key: "purple", color: "#af52de" },
  { key: "magenta", color: "#ff2d55" },
];

const colorMixerColor = (key: string) => {
  switch (key) {
    case "red":
      return "#b94a4a";
    case "orange":
      return "#b98a4a";
    case "yellow":
      return "#b9b84a";
    case "green":
      return "#4ab96b";
    case "aqua":
      return "#4ab9b9";
    case "blue":
      return "#4a6ab9";
    case "purple":
      return "#8a4ab9";
    case "magenta":
      return "#b94a8a";
    default:
      return "#888";
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

### Color Mixer Toggle Styling

```typescript
sx={{
  mb: 2, // Bottom margin for spacing
}}
```

### Color Button Styling

```typescript
sx={{
  p: 0.5,
  mx: 0.5,
  border: "none",
}}
```

### Color Circle Styling

```typescript
sx={{
  width: 24,
  height: 24,
  borderRadius: "50%",
  background: color,
  border: selectedColor === key
    ? "2px solid #fff"
    : "2px solid #222",
}}
```

### Setting Row Styling

```typescript
sx={{
  display: "flex",
  alignItems: "center",
  mb: 1,
  minHeight: 32,
}}
```

### Label Container Styling

```typescript
sx={{
  width: { xs: 110, sm: 110, md: 180 },
  mr: 2,
  display: "flex",
  alignItems: "center",
}}
```

### Label Text Styling

```typescript
sx={{
  wordWrap: "break-word",
  overflowWrap: "break-word",
  whiteSpace: "normal",
  lineHeight: 1.2,
  fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.875rem" },
}}
```

## Performance Considerations

### Optimization Strategies

- **Conditional Rendering**: Efficient conditional rendering for color mixer
- **State Management**: Minimal state updates for color selection
- **Component Reuse**: Reuses SettingSliderDisplay component
- **Memory Management**: Clean component lifecycle

### Rendering Performance

- **Settings Mapping**: Efficient settings array mapping
- **Color Calculations**: Optimized color spectrum calculations
- **Responsive Rendering**: Efficient responsive layout rendering
- **Event Handling**: Optimized event handling

### Memory Management

- **Event Cleanup**: Proper cleanup of event listeners
- **State Reset**: Reset state when props change
- **Memory Leaks**: Prevention of memory leaks
- **Component Cleanup**: Clean component unmounting

## Error Handling

### Props Errors

- **Invalid Settings**: Safe handling of invalid settings data
- **Missing Props**: Graceful handling of missing props
- **Type Errors**: Safe type checking for settings
- **Format Errors**: Safe value formatting error handling

### Display Errors

- **Color Errors**: Safe color calculation error handling
- **Slider Errors**: Safe slider display error handling
- **Layout Errors**: Graceful layout error handling
- **Theme Errors**: Fallback for theme issues

### User Experience Errors

- **Selection Errors**: Safe color selection handling
- **Value Errors**: Safe value display handling
- **Interaction Errors**: Safe interaction error handling
- **Accessibility Errors**: Proper accessibility handling

## Accessibility Features

### ARIA Support

- **Toggle Role**: Proper role for toggle button group
- **Button Role**: Proper role for individual toggle buttons
- **Slider Role**: Proper role for slider components
- **Selection State**: Proper selection state announcements

### Screen Reader Support

- **Descriptive Text**: Clear descriptions for screen readers
- **Setting Labels**: Clear setting label announcements
- **Value Information**: Setting value announcements
- **Context Information**: Proper context for settings

### Keyboard Navigation

- **Tab Order**: Logical tab order through settings
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
// Test selectors for settings display functionality
data-cy="settings-display"         // Main settings container
data-cy="color-mixer"              // Color mixer section
data-cy="color-toggle"             // Color toggle buttons
data-cy="setting-row"              // Individual setting rows
data-cy="setting-label"            // Setting labels
data-cy="setting-slider"           // Setting sliders
data-cy="setting-value"            // Setting values
data-cy="section-title"            // Section titles
```

### Test Scenarios

1. **Settings Display**: Test settings rendering
2. **Color Mixer**: Test color mixer functionality
3. **Value Updates**: Test setting value updates
4. **Responsive Layout**: Test different screen sizes
5. **Accessibility**: Test screen reader and keyboard navigation
6. **Performance**: Test settings rendering performance

### Performance Testing

- **Settings Rendering**: Monitor settings rendering performance
- **Color Calculations**: Test color calculation performance
- **Memory Usage**: Check for memory leaks
- **Interaction Performance**: Test settings interaction performance

## Dependencies

### Internal Dependencies

- **SettingSliderDisplay**: Custom slider component
- **Material-UI Components**: Box, Typography, ToggleButtonGroup, ToggleButton
- **React Hooks**: useState for state management
- **Color Utilities**: Color calculation functions

### External Dependencies

- **Material-UI**: Box, Typography, ToggleButtonGroup, ToggleButton
- **React**: Core React functionality
- **CSS**: Custom styling and transitions

### Browser Support

- **CSS Flexbox**: Modern flexbox support
- **CSS Grid**: Modern grid support
- **CSS Border Radius**: Modern border radius support
- **Touch Events**: Touch event support for mobile

## Future Enhancements

### Planned Features

1. **Setting Presets**: Predefined setting configurations
2. **Setting History**: Track setting adjustment history
3. **Advanced Controls**: Additional setting controls
4. **Setting Export**: Export setting configurations
5. **Real-time Preview**: Live preview with setting changes

### Performance Improvements

1. **Web Workers**: Background setting calculations
2. **Setting Caching**: Enhanced setting value caching
3. **Lazy Loading**: Lazy load setting components
4. **Bundle Optimization**: Code splitting for setting components

### UX Enhancements

1. **Setting Animations**: Smooth setting transition animations
2. **Setting Information**: Detailed setting information display
3. **Setting Sharing**: Share setting configurations
4. **Setting Education**: Educational setting content
5. **Advanced Controls**: Additional setting controls

---

_This component provides a comprehensive and flexible settings interface in the VISOR application, supporting both standard settings and specialized color mixer functionality._
