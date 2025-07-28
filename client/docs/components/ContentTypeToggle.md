# ContentTypeToggle Component

## Overview

The `ContentTypeToggle` component is a sophisticated content filtering interface that allows users to switch between different content types (All, Presets, Film Simulations) and toggle content randomization. It provides an intuitive toggle button group with icons, tooltips, and a shuffle functionality for enhanced user experience in the VISOR application.

## File Location

```
src/components/ContentTypeToggle.tsx
```

## Props Interface

This component is a functional component with no props - it relies entirely on the ContentTypeFilter context for state management.

```typescript
const ContentTypeToggle: React.FC = () => {
  // Component implementation
};
```

## Key Features

### 🎛️ Content Filtering

- **Three Filter Options**: All, Presets, and Film Simulations
- **Exclusive Selection**: Only one filter can be active at a time
- **Visual Feedback**: Clear visual indication of active filter
- **Icon Integration**: Intuitive icons for each content type

### 🔀 Randomization Control

- **Shuffle Toggle**: Enable/disable content randomization
- **Visual Indicator**: Orange color when randomization is active
- **Tooltip Feedback**: Clear tooltip explaining shuffle state
- **Immediate Effect**: Instant shuffle trigger on toggle

### 🎨 Visual Design

- **Toggle Button Group**: Material-UI toggle button group
- **Rounded Design**: Pill-shaped toggle buttons
- **Hover Effects**: Smooth hover transitions
- **Responsive Layout**: Centered layout with proper spacing

### 📱 User Experience

- **Tooltip Support**: Helpful tooltips for all buttons
- **Keyboard Navigation**: Full keyboard accessibility
- **Touch Optimization**: Touch-friendly button sizes
- **Visual Hierarchy**: Clear visual distinction between states

## Usage Examples

### Basic Implementation

```tsx
// Used in pages that need content filtering
<ContentTypeToggle />
```

### With Context Provider

```tsx
<ContentTypeFilterProvider>
  <ContentTypeToggle />
</ContentTypeFilterProvider>
```

### In Page Layout

```tsx
<Box sx={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
  <ContentTypeToggle />
  <StaggeredGrid children={contentItems} />
</Box>
```

## Component Structure

### State Management

```typescript
const {
  contentType,
  setContentType,
  randomizeOrder,
  setRandomizeOrder,
  triggerShuffle,
} = useContentType();
```

### Key Functions

- **`handleChange`**: Handles content type filter changes
- **`handleShuffleClick`**: Toggles randomization and triggers shuffle
- **Context Integration**: Uses ContentTypeFilter context for state

### Filter Options

```typescript
const options = [
  { title: "All", value: "all", icon: <DashboardCustomizeIcon /> },
  { title: "Presets", value: "presets", icon: <TuneIcon /> },
  { title: "Film Sims", value: "films", icon: <CameraRollIcon /> },
] as const;
```

### Event Handling

```typescript
const handleChange = (
  _: React.MouseEvent<HTMLElement>,
  newValue: "all" | "presets" | "films" | null
) => {
  if (newValue) setContentType(newValue);
};

const handleShuffleClick = () => {
  setRandomizeOrder(!randomizeOrder);
  triggerShuffle();
};
```

## Styling & Theming

### Container Styling

```typescript
sx={{
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  mt: 2,
  mb: 2,
}}
```

### Toggle Button Group Styling

```typescript
sx={{
  backgroundColor: "background.default",
  borderRadius: "999px",
  boxShadow: 1,
  p: 0.5,
  gap: 0.5,
}}
```

### Toggle Button Styling

```typescript
sx={{
  border: "none",
  borderRadius: "999px",
  textTransform: "none",
  px: 3,
  py: 1,
  fontWeight: "medium",
  fontSize: "0.9rem",
  color: (theme) =>
    contentType === value
      ? theme.palette.primary.contrastText
      : theme.palette.text.primary,
  backgroundColor: (theme) =>
    contentType === value
      ? theme.palette.primary.main
      : "transparent",
  "&:hover": {
    backgroundColor: (theme) =>
      contentType === value
        ? theme.palette.primary.dark
        : theme.palette.action.hover,
  },
}}
```

### Shuffle Button Styling

```typescript
sx={{
  position: "absolute",
  right: 0,
  backgroundColor: "transparent",
  color: randomizeOrder ? "#ff9800" : "grey.600",
  opacity: 0.7,
  "&:hover": {
    opacity: 1,
  },
}}
```

## Performance Considerations

### Optimization Strategies

- **Context Usage**: Efficient context consumption
- **Event Handling**: Optimized event handling
- **Rendering**: Minimal re-renders with proper state management
- **Memory Management**: Clean component lifecycle

### State Management

- **Context Integration**: Efficient context state management
- **State Updates**: Minimal state updates for better performance
- **Event Optimization**: Efficient event handling
- **Memory Cleanup**: Proper cleanup on unmount

### Rendering Performance

- **Conditional Rendering**: Efficient conditional rendering
- **Icon Optimization**: Optimized icon rendering
- **Style Calculation**: Efficient style calculations
- **Tooltip Performance**: Optimized tooltip rendering

## Error Handling

### Context Errors

- **Missing Context**: Graceful handling of missing context
- **Context State**: Safe context state access
- **Provider Errors**: Fallback for provider errors
- **State Errors**: Safe state management

### User Interaction Errors

- **Invalid Selections**: Safe selection handling
- **Event Errors**: Graceful event error handling
- **Tooltip Errors**: Safe tooltip rendering
- **Accessibility Errors**: Proper accessibility handling

### Visual Errors

- **Icon Loading**: Graceful icon loading errors
- **Style Conflicts**: Proper style merging
- **Theme Errors**: Fallback for theme issues
- **Responsive Errors**: Safe responsive handling

## Accessibility Features

### ARIA Support

- **Toggle Role**: Proper toggle button roles
- **Group Role**: Proper button group role
- **State**: Proper state announcements
- **Labels**: Clear labels for screen readers

### Screen Reader Support

- **Descriptive Text**: Clear descriptions for screen readers
- **State Announcements**: Filter changes announced
- **Tooltip Content**: Tooltip content accessible to screen readers
- **Context Information**: Proper context for filter options

### Keyboard Navigation

- **Tab Order**: Logical tab order through buttons
- **Focus Management**: Proper focus handling
- **Keyboard Shortcuts**: Enhanced keyboard controls
- **Focus Indicators**: Visible focus states

### Visual Accessibility

- **Color Contrast**: Maintains color contrast in all states
- **Touch Targets**: Adequate touch target size
- **Visual Feedback**: Clear visual indicators
- **Focus Indicators**: Visible focus states

## Testing Integration

### Cypress Testing

```typescript
// Test selectors for toggle functionality
data-cy="content-type-toggle"      // Main toggle container
data-cy="filter-all"               // All filter button
data-cy="filter-presets"           // Presets filter button
data-cy="filter-films"             // Film Sims filter button
data-cy="shuffle-button"           // Shuffle button
```

### Test Scenarios

1. **Filter Selection**: Test content type filter changes
2. **Shuffle Toggle**: Test randomization toggle functionality
3. **Visual States**: Test active/inactive visual states
4. **Tooltip Functionality**: Test tooltip display
5. **Accessibility**: Test keyboard navigation and screen readers
6. **Responsive**: Test different screen sizes

### Performance Testing

- **State Changes**: Test filter state change performance
- **Shuffle Performance**: Test shuffle trigger performance
- **Memory Usage**: Check for memory leaks
- **Rendering**: Test component rendering performance

## Dependencies

### Internal Dependencies

- **`useContentType`**: ContentTypeFilter context hook
- **React Hooks**: useState for local state management
- **Material-UI Icons**: Various icon components

### External Dependencies

- **Material-UI**: ToggleButton, ToggleButtonGroup, Box, Tooltip, IconButton
- **Material-UI Icons**: DashboardCustomizeIcon, TuneIcon, CameraRollIcon, ShuffleIcon
- **React**: Core React functionality

### Context Requirements

- **ContentTypeFilter**: Content type and randomization state
- **Theme Context**: Material-UI theme for styling
- **Accessibility Context**: Accessibility state management

## Future Enhancements

### Planned Features

1. **Custom Filters**: User-defined content filters
2. **Filter Presets**: Saved filter combinations
3. **Advanced Randomization**: Customizable randomization algorithms
4. **Filter Analytics**: Filter usage statistics
5. **Bulk Actions**: Bulk content operations

### Performance Improvements

1. **Virtual Scrolling**: For large content lists
2. **Filter Caching**: Cache filter results
3. **Optimistic Updates**: Immediate UI feedback
4. **Bundle Optimization**: Code splitting for toggle components

### UX Enhancements

1. **Filter Animations**: Smooth filter transition animations
2. **Filter History**: Filter selection history
3. **Quick Filters**: One-click filter presets
4. **Filter Search**: Search within filter options
5. **Filter Export**: Export filter configurations

---

_This component provides essential content filtering functionality in the VISOR application, enabling users to efficiently browse and discover different types of photographic content._
