# List Detail Page

## Overview

The ListDetail page displays a comprehensive view of a specific list, showing all presets and film simulations contained within it. It provides list management features, content organization, and sharing capabilities.

## File Location

`src/pages/ListDetail.tsx`

## Key Features

### List Information Display

- **List Name**: Prominent display of list name
- **List Description**: Detailed list description
- **Creator Information**: User avatar, username, and profile link
- **Privacy Status**: Public or private list indicator
- **Creation Date**: When the list was created
- **Item Count**: Number of presets and film simulations

### Content Display

- **Content Grid**: Responsive grid of list items
- **Content Filtering**: Toggle between presets and film simulations
- **Content Cards**: Individual preset/film simulation cards
- **Content Navigation**: Click to view content details

### List Management

- **Add Items**: Add presets and film simulations to list
- **Remove Items**: Remove items from list (creator only)
- **Edit List**: Edit list information (creator only)
- **Delete List**: Delete entire list (creator only)
- **Share List**: Share list with others

## Component Structure

### State Management

```tsx
const [contentType, setContentType] = useState<"all" | "presets" | "films">(
  "all"
);
const [list, setList] = useState<List | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### List Interface

```tsx
interface List {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  owner: {
    id: string;
    username: string;
    avatar?: string;
  };
  presets: Array<{
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
  }>;
  filmSims: Array<{
    id: string;
    name: string;
    slug: string;
    thumbnail?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

## UI Components

### Header Section

- **List Name**: Large typography for list name
- **Creator Info**: Avatar and username with profile link
- **List Description**: Detailed list description
- **Privacy Badge**: Public/private status indicator
- **Action Menu**: Three-dot menu for list actions

### Content Toggle

- **Content Type Toggle**: Switch between all, presets, or film simulations
- **Active State**: Visual indication of selected content type
- **Count Display**: Number of items in each category
- **Filter Options**: All, Presets, Film Simulations

### Content Grid

- **Responsive Grid**: Adaptive grid layout
- **Content Cards**: Individual preset/film simulation cards
- **Loading States**: Loading indicators for content
- **Empty States**: Messages when list is empty

## Content Management

### Content Filtering

- **All Content**: Show both presets and film simulations
- **Presets Only**: Show only preset items
- **Film Simulations Only**: Show only film simulation items
- **Content Switching**: Smooth transitions between content types

### Content Display

- **Card Layout**: Consistent card design
- **Thumbnail Images**: Content preview images
- **Metadata**: Title, description, tags
- **Interaction**: Click to view content details

### List Actions (Creator Only)

- **Add Items**: Add new presets/film simulations
- **Remove Items**: Remove items from list
- **Reorder Items**: Drag and drop reordering
- **Bulk Actions**: Select multiple items for actions

## List Information

### List Metadata

- **List Name**: Primary identifier for the list
- **Description**: Optional detailed description
- **Privacy Status**: Public or private indicator
- **Item Counts**: Number of presets and film simulations
- **Owner Information**: Username of list creator

### List Statistics

- **Total Items**: Combined preset and film simulation count
- **Preset Count**: Number of preset items
- **Film Simulation Count**: Number of film simulation items
- **Last Updated**: Most recent update information

## User Permissions

### Creator Permissions

- **Edit List**: Modify list name and description
- **Delete List**: Remove entire list
- **Add Items**: Add presets and film simulations
- **Remove Items**: Remove items from list
- **Reorder Items**: Change item order
- **Privacy Settings**: Change list privacy

### Viewer Permissions

- **View List**: View list contents
- **View Items**: Click to view item details
- **Share List**: Share list with others
- **Follow Creator**: Follow list creator

## Performance Optimizations

### Content Loading

- **Lazy Loading**: Load content as needed
- **Pagination**: Load content in pages
- **Caching**: Cache list data for performance
- **Optimized Queries**: Efficient GraphQL queries

### Image Optimization

- **Progressive Loading**: Low-res to high-res loading
- **Image Compression**: Automatic image optimization
- **Thumbnail Generation**: Optimized thumbnails
- **CDN Integration**: Fast image delivery

## Error Handling

### Data Loading Errors

- **List Not Found**: Handle non-existent lists
- **Network Errors**: Graceful network error handling
- **Permission Errors**: Handle private list access
- **Fallback States**: Default content for errors

### Content Errors

- **Missing Content**: Handle empty list states
- **Image Loading Errors**: Handle broken image links
- **Permission Issues**: Handle content access restrictions
- **Data Validation**: Validate list data integrity

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
- **GraphQL**: Data fetching and mutations
- **Social Media**: External sharing integration

### Component Dependencies

- **ContentGrid**: Content display component
- **UserAvatar**: Avatar display component
- **ListActions**: List management component
- **ContentToggle**: Content filtering component

### Context Dependencies

- **AuthContext**: User authentication for permissions
- **NotificationContext**: List action notifications
- **SearchContext**: Search integration

## Testing Integration

### Test Scenarios

- **List Loading**: Load and display list data
- **Content Filtering**: Test preset/film simulation toggle
- **List Actions**: Test creator-only actions
- **Content Navigation**: Test content card interactions
- **Error Handling**: Test various error scenarios
- **Empty States**: Test when list has no content

### Cypress Testing

- **Page Load**: Test list detail page rendering
- **Content Display**: Test content grid and filtering
- **List Actions**: Test creator-only functionality
- **Content Navigation**: Test content card interactions
- **Error States**: Test error handling scenarios
- **Responsive**: Test mobile/desktop layouts

## Future Enhancements

### Planned Features

- **List Collaboration**: Collaborative list editing
- **List Templates**: Pre-configured list templates
- **List Analytics**: Track list usage and engagement
- **List Export**: Export list data
- **List Import**: Import lists from other sources
- **List Backup**: Automatic list backup
- **List Migration**: Import lists from other platforms
- **List API**: External list integration
- **List Moderation**: Moderation tools for public lists
- **List Certification**: Verified list system

### Advanced Features

- **Real-time Updates**: Live list updates
- **List Validation**: Automated list validation
- **List Testing**: Automated list testing
- **List Marketplace**: List selling and licensing
- **List Collaboration**: Multi-user list editing
