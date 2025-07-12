# Upload Page

## Overview

The Upload page serves as a gateway for users to choose what type of content they want to upload to the VISOR platform. It provides a clean interface with two main options: uploading presets or film simulations.

## File Location

`src/pages/Upload.tsx`

## Key Features

### Upload Type Selection

- **Preset Upload**: Navigate to preset upload form
- **Film Simulation Upload**: Navigate to film simulation upload form
- **Toggle Button Group**: Exclusive selection between upload types
- **Visual Icons**: Clear iconography for each upload type

### Navigation Interface

- **Toggle Buttons**: Material-UI ToggleButtonGroup component
- **Exclusive Selection**: Only one upload type can be selected
- **Immediate Navigation**: Clicking a button navigates to the respective upload form
- **Tooltip Support**: Hover tooltips for better UX

## Component Structure

### Upload Options Configuration

```tsx
const options = [
  {
    title: "Upload Preset",
    value: "preset",
    icon: <TuneIcon />,
    path: "/upload/preset",
  },
  {
    title: "Upload Film Simulation",
    value: "filmsim",
    icon: <CameraRollIcon />,
    path: "/upload/filmsim",
  },
] as const;
```

### Layout Structure

- **Container**: `maxWidth="lg"` with responsive padding
- **Paper Component**: Elevated card with padding
- **Centered Layout**: Flexbox centering for toggle buttons
- **Responsive Design**: Adapts to different screen sizes

## UI Components

### Container Layout

- **Max Width**: `lg` (large)
- **Padding**: `py: 4` (vertical padding)
- **Data Attribute**: `data-cy="upload-page"` for testing

### Paper Component

- **Elevation**: Default Material-UI elevation
- **Padding**: `p: 4` (16px padding)
- **Data Attribute**: `data-cy="upload-form"` for testing

### Typography Elements

- **Title**: `variant="h4"` with gutter bottom
- **Description**: `variant="body1"` with secondary color
- **Data Attribute**: `data-cy="upload-title"` for testing

### Toggle Button Group

- **Exclusive Selection**: Only one option can be selected
- **Styling**: Custom styling with background and border radius
- **Data Attribute**: `data-cy="upload-type-toggle"` for testing

## Toggle Button Styling

### Custom Styling

```tsx
sx={{
  backgroundColor: "background.default",
  borderRadius: "999px",
  boxShadow: 1,
  p: 0.5,
  gap: 0.5,
}}
```

### Individual Button Styling

```tsx
sx={{
  border: "none",
  borderRadius: "999px",
  textTransform: "none",
  px: 3,
  py: 1,
  fontWeight: "medium",
  fontSize: "0.9rem",
  color: "text.primary",
  backgroundColor: "transparent",
  "&:hover": {
    backgroundColor: "action.hover",
  },
  display: "flex",
  flexDirection: "column",
  gap: 1,
}}
```

## Navigation Logic

### Click Handlers

- **Preset Upload**: Navigates to `/upload/preset`
- **Film Simulation Upload**: Navigates to `/upload/filmsim`
- **Immediate Navigation**: No confirmation dialog, direct navigation

### Route Structure

- **Base Route**: `/upload`
- **Preset Route**: `/upload/preset`
- **Film Simulation Route**: `/upload/filmsim`

## Icon Integration

### Material-UI Icons

- **TuneIcon**: Represents preset/editing functionality
- **CameraRollIcon**: Represents film simulation/camera functionality
- **Icon Display**: Icons displayed above text labels

### Icon Usage

- **Visual Hierarchy**: Icons provide immediate visual recognition
- **Accessibility**: Icons complement text labels
- **Consistency**: Material-UI icon system ensures consistency

## Responsive Design

### Mobile Adaptation

- **Flex Direction**: Column layout on small screens
- **Button Sizing**: Adaptive button sizes
- **Touch Targets**: Adequate touch target sizes

### Desktop Experience

- **Horizontal Layout**: Side-by-side button arrangement
- **Hover Effects**: Interactive hover states
- **Tooltip Display**: Enhanced tooltip functionality

## Testing Integration

### Cypress Testing

- **Page Selector**: `data-cy="upload-page"`
- **Form Selector**: `data-cy="upload-form"`
- **Title Selector**: `data-cy="upload-title"`
- **Toggle Selector**: `data-cy="upload-type-toggle"`
- **Button Selectors**: `data-cy="upload-preset-tab"`, `data-cy="upload-filmsim-tab"`

### Test Scenarios

- Page load and display
- Toggle button functionality
- Navigation to preset upload
- Navigation to film simulation upload
- Responsive behavior testing

## Accessibility Features

### Keyboard Navigation

- **Tab Order**: Logical tab sequence through elements
- **Focus Management**: Clear focus indicators
- **Enter Key**: Activates button selection

### Screen Reader Support

- **Semantic HTML**: Proper button and form structure
- **ARIA Labels**: Descriptive labels for interactive elements
- **Icon Labels**: Text labels complement icons

### Visual Accessibility

- **Color Contrast**: Adequate contrast ratios
- **Focus Indicators**: Clear focus states
- **Touch Targets**: Sufficient touch target sizes

## User Experience

### Visual Design

- **Clean Interface**: Minimalist design approach
- **Clear Hierarchy**: Obvious primary actions
- **Visual Feedback**: Hover and selection states

### Interaction Design

- **Immediate Response**: Instant navigation on selection
- **Clear Options**: Obvious choice between upload types
- **Consistent Behavior**: Predictable interaction patterns

## Performance Considerations

### Component Optimization

- **Lightweight**: Minimal state and logic
- **Fast Rendering**: Simple component structure
- **Efficient Navigation**: Direct route navigation

### Loading States

- **No Loading**: Immediate navigation without loading states
- **Error Handling**: Graceful error handling for navigation failures

## Integration Points

### Navigation Dependencies

- `useNavigate`: React Router navigation hook
- **Route Configuration**: Integration with app routing

### Component Dependencies

- **Material-UI**: ToggleButtonGroup, Paper, Typography
- **React Router**: Navigation functionality

## Future Enhancements

### Planned Features

- **Drag and Drop**: Direct file upload interface
- **Bulk Upload**: Multiple file upload support
- **Upload Progress**: Progress indicators for uploads
- **Template Selection**: Pre-configured upload templates
- **Quick Upload**: Streamlined upload workflows
- **Upload History**: Recent upload tracking
- **Draft Saving**: Save upload progress as drafts
