# Preset Detail Page

## Overview

The PresetDetail page provides a comprehensive view of individual presets in the VISOR application. It features detailed preset information, before/after comparisons, settings visualization, download capabilities, and community features like discussions and lists.

## File Location

`src/pages/PresetDetail.tsx`

## Key Features

### Preset Information Display

- **Preset Title**: Prominent display of preset name
- **Creator Information**: User avatar, username, and profile link
- **Description**: Detailed preset description
- **Tags**: Visual tag chips with filtering
- **Metadata**: Creation date, download count, rating

### Image Display

- **Before/After Slider**: Interactive comparison slider
- **Sample Images**: Gallery of sample images
- **Fullscreen View**: Click to view images in fullscreen
- **Image Navigation**: Navigate through multiple images

### Settings Visualization

- **Settings Display**: Visual representation of preset settings
- **Tone Curve**: Interactive tone curve visualization
- **Color Grading**: Color grading wheel display
- **Settings Comparison**: Before/after settings comparison

### Interactive Features

- **Download XMP**: Download preset as XMP file
- **Add to List**: Add preset to user lists
- **Edit Preset**: Edit preset (creator only)
- **Delete Preset**: Delete preset (creator only)
- **Share Preset**: Share preset with others

## Component Structure

### State Management

```tsx
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [editDialogOpen, setEditDialogOpen] = useState(false);
const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
const [parsedSettings, setParsedSettings] = useState<any>(null);
const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
const [showAllImages, setShowAllImages] = useState(false);
```

### GraphQL Queries

- **GET_PRESET_BY_SLUG**: Fetches preset data by slug
- **DELETE_PRESET**: Deletes preset (creator only)
- **UPDATE_PRESET**: Updates preset information
- **ADD_PHOTO_TO_PRESET**: Adds photos to preset

## UI Components

### Header Section

- **Preset Title**: Large typography for preset name
- **Creator Info**: Avatar and username with profile link
- **Action Menu**: Three-dot menu for preset actions
- **Social Links**: Instagram and other social links

### Image Section

- **Before/After Slider**: Interactive comparison component
- **Sample Images**: Grid of sample images
- **Image Controls**: Fullscreen and navigation controls
- **Image Upload**: Add new sample images (creator only)

### Settings Section

- **Settings Display**: Visual settings representation
- **Tone Curve**: Interactive curve visualization
- **Color Grading**: Color wheel interface
- **Settings Tabs**: Organized settings display

### Community Section

- **Discussion Thread**: Related discussions
- **Add to List**: List management interface
- **User Interactions**: Like, share, comment features

## Image Management

### Before/After Slider

- **Interactive Slider**: Drag to compare before/after
- **Smooth Animation**: Fluid slider movement
- **Keyboard Controls**: Arrow key navigation
- **Touch Support**: Mobile touch gestures

### Sample Images

- **Image Grid**: Responsive grid layout
- **Image Preview**: Thumbnail previews
- **Fullscreen Mode**: Click to view full size
- **Image Navigation**: Previous/next controls

### Image Upload (Creator Only)

```tsx
const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setPhotoFile(file);
  }
};
```

## Settings Visualization

### Settings Display

- **Visual Interface**: Intuitive settings representation
- **Category Organization**: Settings grouped by category
- **Value Display**: Clear value representation
- **Comparison Mode**: Before/after settings comparison

### Tone Curve

- **Interactive Curves**: RGB and individual channel curves
- **Visual Editor**: Drag-and-drop curve editing
- **Preset Curves**: Common curve presets
- **Export/Import**: Curve data handling

### Color Grading

- **Color Wheels**: Hue/saturation/luminance wheels
- **Visual Interface**: Intuitive color adjustment
- **Real-time Preview**: Live preview of adjustments
- **Preset Colors**: Common color adjustments

## Preset Actions

### Download XMP

```tsx
const handleDownloadXMP = () => {
  const presetData: PresetData = {
    title: preset.title,
    description: preset.description,
    settings: getCurrentSettings(),
    toneCurve: formatToneCurveData(preset.toneCurve),
  };

  downloadXMP(presetData, preset.title);
};
```

### Add to List

- **List Selection**: Choose from user's lists
- **Create New List**: Create new list option
- **List Management**: Add/remove from lists
- **List Display**: Show current list memberships

### Edit Preset (Creator Only)

- **Edit Dialog**: Modal for editing preset
- **Form Validation**: Real-time validation
- **Settings Editor**: Advanced settings editing
- **Image Management**: Add/remove sample images

### Delete Preset (Creator Only)

- **Confirmation Dialog**: Confirm deletion
- **Cascade Delete**: Remove from all lists
- **Cleanup**: Remove associated data
- **Navigation**: Redirect after deletion

## Community Features

### Discussion Integration

- **Discussion Thread**: Related discussions display
- **Create Discussion**: Start new discussion about preset
- **Discussion Navigation**: Link to discussion details
- **Discussion Count**: Show number of discussions

### User Interactions

- **Like System**: Like/unlike preset
- **Share Functionality**: Share preset with others
- **Comment System**: Comment on preset
- **Follow Creator**: Follow preset creator

## Performance Optimizations

### Image Loading

- **Lazy Loading**: Load images as needed
- **Progressive Loading**: Low-res to high-res loading
- **Image Optimization**: Automatic image optimization
- **Caching**: Image caching for performance

### Settings Processing

- **Efficient Parsing**: Optimized settings parsing
- **Memoized Components**: Optimized re-rendering
- **Lazy Components**: Load heavy components on demand
- **Debounced Updates**: Efficient settings updates

## Error Handling

### Data Loading Errors

- **GraphQL Errors**: Graceful error handling
- **Network Errors**: User-friendly error messages
- **Fallback States**: Default content when data unavailable
- **Retry Logic**: Automatic retry for failed requests

### Action Errors

- **Permission Errors**: Clear permission messages
- **Upload Failures**: Image upload error handling
- **Delete Failures**: Deletion error handling
- **Download Errors**: XMP download error handling

## Accessibility Features

### Keyboard Navigation

- **Tab Order**: Logical tab sequence through elements
- **Focus Management**: Clear focus indicators
- **Enter Key**: Activates interactive elements
- **Escape Key**: Closes dialogs and menus

### Screen Reader Support

- **Semantic HTML**: Proper heading and content structure
- **ARIA Labels**: Descriptive labels for interactive elements
- **Image Descriptions**: Alt text for all images
- **Navigation Context**: Clear navigation instructions

### Visual Accessibility

- **High Contrast**: Adequate contrast ratios
- **Focus Indicators**: Clear focus states
- **Touch Targets**: Sufficient touch target sizes
- **Color Independence**: Information not conveyed by color alone

## Integration Points

### External Services

- **Cloudinary**: Image storage and optimization
- **XMP Compiler**: XMP file generation
- **GraphQL**: Data fetching and mutations

### Component Dependencies

- **BeforeAfterSlider**: Image comparison component
- **ToneCurve**: Curve visualization component
- **ColorGradingWheels**: Color adjustment interface
- **DiscussionThread**: Discussion display component

### Context Dependencies

- **AuthContext**: User authentication for permissions
- **NotificationContext**: Notification management
- **SearchContext**: Search integration

## Testing Integration

### Test Scenarios

- **Preset Loading**: Load and display preset data
- **Image Interaction**: Test image slider and gallery
- **Settings Display**: Test settings visualization
- **Download Functionality**: Test XMP download
- **Edit/Delete**: Test creator actions
- **Community Features**: Test discussions and lists
- **Error Handling**: Test various error scenarios

### Cypress Testing

- **Page Load**: Test preset detail page rendering
- **Image Gallery**: Test image navigation and fullscreen
- **Settings Interface**: Test settings display
- **Download Actions**: Test XMP download functionality
- **Edit/Delete**: Test creator-only actions
- **Community**: Test discussion and list features

## Future Enhancements

### Planned Features

- **Preset Versioning**: Version control for presets
- **Preset Analytics**: Usage and download analytics
- **Preset Marketplace**: Preset selling and licensing
- **AI Recommendations**: AI-powered preset suggestions
- **Preset Collaboration**: Multi-user preset editing
- **Preset Templates**: Pre-configured preset templates
- **Advanced Export**: Multiple export formats
- **Preset Comparison**: Compare multiple presets
- **Preset History**: Track preset changes over time
- **Preset Backup**: Automatic preset backup system

### Advanced Features

- **Real-time Collaboration**: Live collaborative editing
- **Preset Validation**: Automated preset validation
- **Preset Testing**: Automated preset testing
- **Preset Certification**: Verified preset system
- **Preset API**: External preset integration
