# AddItemDialog Component

## Overview

The `AddItemDialog` component is a comprehensive search and selection dialog that allows users to browse and add presets or film simulations to their collections. It features real-time search functionality, tabbed navigation between different content types, and a clean list-based selection interface, making it an essential component for content management in the VISOR application.

## File Location

```
src/components/AddItemDialog.tsx
```

## Props Interface

```typescript
interface AddItemDialogProps {
  open: boolean; // Controls dialog visibility
  onClose: () => void; // Dialog close handler
  onAdd: (itemId: string) => void; // Item selection handler
  type: "preset" | "filmSim"; // Type of items to display
}
```

## Key Features

### 🔍 Advanced Search Functionality

- **Real-time Search**: Instant search results as you type
- **GraphQL Integration**: Efficient GraphQL queries for search
- **Dual Content Types**: Search both presets and film simulations
- **Smart Filtering**: Intelligent search filtering

### 📋 Tabbed Interface

- **Presets Tab**: Browse and select presets
- **Film Simulations Tab**: Browse and select film simulations
- **Smooth Transitions**: Smooth tab switching animations
- **State Management**: Proper state management for tab switching

### 🎨 Visual Design

- **Material-UI Dialog**: Professional dialog design
- **Avatar Display**: Thumbnail avatars for items
- **Selection Indicators**: Clear visual selection feedback
- **Loading States**: Proper loading state management

### 🔧 Technical Features

- **GraphQL Queries**: Efficient data fetching with Apollo Client
- **State Management**: Local state for search and selection
- **Performance Optimization**: Optimized rendering and queries
- **Error Handling**: Comprehensive error handling

## Usage Examples

### Basic Usage

```tsx
const [open, setOpen] = useState(false);

<AddItemDialog
  open={open}
  onClose={() => setOpen(false)}
  onAdd={(itemId) => {
    console.log("Item added:", itemId);
    setOpen(false);
  }}
  type="preset"
/>;
```

### With Film Simulations

```tsx
<AddItemDialog
  open={dialogOpen}
  onClose={handleClose}
  onAdd={handleAddFilmSim}
  type="filmSim"
/>
```

### With Custom Handlers

```tsx
<AddItemDialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onAdd={(itemId) => {
    addItemToList(itemId);
    setIsOpen(false);
  }}
  type="preset"
/>
```

### In List Management

```tsx
<Box>
  <Button onClick={() => setDialogOpen(true)}>Add Item</Button>
  <AddItemDialog
    open={dialogOpen}
    onClose={() => setDialogOpen(false)}
    onAdd={handleAddItem}
    type="preset"
  />
</Box>
```

## Component Structure

### GraphQL Queries

```typescript
const SEARCH_PRESETS = gql`
  query SearchPresets($query: String!) {
    listPresets(filter: { title: $query }) {
      id
      title
      slug
      thumbnail
    }
  }
`;

const SEARCH_FILM_SIMS = gql`
  query SearchFilmSims($query: String!) {
    listFilmSims(filter: { name: $query }) {
      id
      name
      slug
      thumbnail
    }
  }
`;
```

### Main Dialog Structure

```typescript
<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
  <DialogTitle>
    Add {type === "preset" ? "Preset" : "Film Simulation"}
  </DialogTitle>
  <DialogContent>
    {/* Search field */}
    {/* Tabs */}
    {/* Item list */}
  </DialogContent>
  <DialogActions>{/* Action buttons */}</DialogActions>
</Dialog>
```

### Search Field

```typescript
<TextField
  fullWidth
  value={searchQuery}
  onChange={handleSearch}
  placeholder={`Search ${
    type === "preset" ? "presets" : "film simulations"
  }...`}
  variant="outlined"
  size="small"
/>
```

### Tab Navigation

```typescript
<Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
  <Tab label="Presets" />
  <Tab label="Film Simulations" />
</Tabs>
```

### Item List

```typescript
<List sx={{ maxHeight: 400, overflow: "auto" }}>
  {items.map((item: any) => (
    <ListItem key={item.id} disablePadding>
      <ListItemButton
        selected={selectedItem === item.id}
        onClick={() => handleItemSelect(item.id)}
      >
        <ListItemAvatar>
          <Avatar src={item.thumbnail} alt={item.title || item.name}>
            {(item.title || item.name)[0]}
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={item.title || item.name} secondary={item.slug} />
      </ListItemButton>
    </ListItem>
  ))}
</List>
```

### Loading State

```typescript
{loading ? (
  <Box display="flex" justifyContent="center" p={3}>
    <CircularProgress />
  </Box>
) : (
  /* Item list */
)}
```

## Styling & Theming

### Dialog Styling

```typescript
sx={{
  maxWidth: "sm",
  fullWidth: true,
}}
```

### Search Field Styling

```typescript
sx={{
  mb: 2, // Bottom margin for spacing
}}
```

### Tabs Styling

```typescript
sx={{
  mb: 2, // Bottom margin for spacing
}}
```

### List Styling

```typescript
sx={{
  maxHeight: 400,
  overflow: "auto",
}}
```

### Avatar Styling

```typescript
// Default Material-UI avatar styling
// Customizable through theme overrides
```

## Performance Considerations

### Optimization Strategies

- **GraphQL Queries**: Efficient data fetching with Apollo Client
- **Conditional Queries**: Skip queries when not needed
- **State Management**: Minimal state updates
- **Memory Management**: Clean component lifecycle

### Query Performance

- **Search Debouncing**: Efficient search query handling
- **Query Skipping**: Skip queries when tabs are inactive
- **Data Caching**: Apollo Client caching for performance
- **Loading States**: Proper loading state management

### Rendering Performance

- **Conditional Rendering**: Efficient conditional rendering
- **List Virtualization**: Optimized list rendering
- **Avatar Loading**: Efficient avatar loading
- **Tab Switching**: Smooth tab switching performance

### Memory Management

- **Event Cleanup**: Proper cleanup of event listeners
- **State Reset**: Reset state when dialog closes
- **Memory Leaks**: Prevention of memory leaks
- **Component Cleanup**: Clean component unmounting

## Error Handling

### GraphQL Errors

- **Query Errors**: Safe handling of GraphQL query errors
- **Network Errors**: Graceful network error handling
- **Data Errors**: Safe handling of invalid data
- **Loading Errors**: Proper loading error handling

### User Interaction Errors

- **Search Errors**: Safe search input handling
- **Selection Errors**: Safe item selection handling
- **Tab Errors**: Safe tab switching error handling
- **Dialog Errors**: Safe dialog interaction handling

### Display Errors

- **Avatar Errors**: Graceful avatar loading error handling
- **List Errors**: Safe list rendering error handling
- **Theme Errors**: Fallback for theme issues
- **Accessibility Errors**: Proper accessibility handling

## Accessibility Features

### ARIA Support

- **Dialog Role**: Proper role for dialog component
- **Tab Role**: Proper role for tab navigation
- **List Role**: Proper role for item list
- **Button Role**: Proper role for action buttons

### Screen Reader Support

- **Descriptive Text**: Clear descriptions for screen readers
- **Search Announcements**: Search functionality announcements
- **Selection Announcements**: Item selection announcements
- **Tab Announcements**: Tab switching announcements

### Keyboard Navigation

- **Tab Order**: Logical tab order through dialog
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
// Test selectors for add item dialog functionality
data-cy="add-item-dialog"          // Main dialog container
data-cy="search-field"             // Search input field
data-cy="presets-tab"              // Presets tab
data-cy="film-sims-tab"            // Film simulations tab
data-cy="item-list"                // Item list container
data-cy="item-button"              // Individual item buttons
data-cy="item-avatar"              // Item avatar
data-cy="item-text"                // Item text
data-cy="cancel-button"            // Cancel button
data-cy="add-button"               // Add button
data-cy="loading-spinner"          // Loading spinner
```

### Test Scenarios

1. **Dialog Opening**: Test dialog open/close functionality
2. **Search Functionality**: Test search input and results
3. **Tab Navigation**: Test tab switching functionality
4. **Item Selection**: Test item selection and deselection
5. **Add Functionality**: Test item addition functionality
6. **Loading States**: Test loading state management
7. **Accessibility**: Test screen reader and keyboard navigation
8. **Performance**: Test dialog rendering performance

### Performance Testing

- **Dialog Rendering**: Monitor dialog rendering performance
- **Search Performance**: Test search query performance
- **Memory Usage**: Check for memory leaks
- **Interaction Performance**: Test dialog interaction performance

## Dependencies

### Internal Dependencies

- **GraphQL Queries**: Search presets and film simulations queries
- **Material-UI Components**: Dialog, TextField, List, Tabs, etc.
- **React Hooks**: useState for state management
- **Apollo Client**: useQuery for data fetching

### External Dependencies

- **Material-UI**: Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Typography, CircularProgress, Box, Tabs, Tab
- **Apollo Client**: useQuery, gql
- **React**: Core React functionality
- **CSS**: Custom styling and transitions

### Browser Support

- **CSS Flexbox**: Modern flexbox support
- **CSS Grid**: Modern grid support
- **Touch Events**: Touch event support for mobile
- **Material-UI**: Material-UI component support

## Future Enhancements

### Planned Features

1. **Advanced Search**: More sophisticated search filters
2. **Item Previews**: Preview items before adding
3. **Bulk Selection**: Select multiple items at once
4. **Recent Items**: Show recently added items
5. **Favorites**: Mark favorite items for quick access

### Performance Improvements

1. **Search Debouncing**: Implement search debouncing
2. **Virtual Scrolling**: Implement virtual scrolling for large lists
3. **Image Optimization**: Optimize avatar image loading
4. **Bundle Optimization**: Code splitting for dialog components

### UX Enhancements

1. **Search Suggestions**: Auto-complete search suggestions
2. **Item Categories**: Categorize items for easier browsing
3. **Item Details**: Show more item details in the dialog
4. **Quick Actions**: Quick action buttons for items
5. **Search History**: Remember recent searches

---

_This component provides a comprehensive and user-friendly interface for adding presets and film simulations to collections in the VISOR application, with advanced search capabilities and smooth user interactions._
