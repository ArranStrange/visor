# AddToListDialog Component

## Overview

The `AddToListDialog` component is a dedicated dialog interface for adding presets or film simulations to user lists. It provides a clean, focused interface with comprehensive error handling, user authentication validation, and real-time feedback, making it an essential component for list management in the VISOR application.

## File Location

```
src/components/AddToListDialog.tsx
```

## Props Interface

```typescript
interface AddToListDialogProps {
  open: boolean; // Controls dialog visibility
  onClose: () => void; // Dialog close handler
  presetId?: string; // Optional preset ID to add
  filmSimId?: string; // Optional film simulation ID to add
  itemName: string; // Display name of the item being added
}
```

## Key Features

### 🔐 Authentication & Validation

- **User Authentication**: Validates user login status
- **Input Validation**: Comprehensive validation for all inputs
- **Error Handling**: Detailed error messages and handling
- **Security**: Secure list ownership validation

### 📋 List Management

- **User Lists**: Fetches and displays user's personal lists
- **List Filtering**: Filters lists by ownership
- **Duplicate Prevention**: Prevents duplicate list entries
- **List Statistics**: Shows list item counts and visibility

### 🎨 Visual Design

- **Material-UI Dialog**: Professional dialog design
- **Loading States**: Proper loading state management
- **Success/Error Feedback**: Clear feedback for user actions
- **Responsive Layout**: Adapts to different screen sizes

### 🔧 Technical Features

- **GraphQL Integration**: Efficient data fetching with Apollo Client
- **State Management**: Local state for feedback and loading
- **Navigation**: React Router integration for list creation
- **Performance Optimization**: Optimized queries and mutations

## Usage Examples

### Basic Usage

```tsx
const [dialogOpen, setDialogOpen] = useState(false);

<AddToListDialog
  open={dialogOpen}
  onClose={() => setDialogOpen(false)}
  presetId="preset-123"
  itemName="Vintage Film Preset"
/>;
```

### With Film Simulation

```tsx
<AddToListDialog
  open={isOpen}
  onClose={handleClose}
  filmSimId="filmsim-456"
  itemName="Kodak Portra 400"
/>
```

### In Parent Component

```tsx
const [showDialog, setShowDialog] = useState(false);

<Box>
  <Button onClick={() => setShowDialog(true)}>Add to List</Button>
  <AddToListDialog
    open={showDialog}
    onClose={() => setShowDialog(false)}
    presetId={selectedPreset?.id}
    itemName={selectedPreset?.title}
  />
</Box>;
```

### With Custom Handlers

```tsx
<AddToListDialog
  open={dialogOpen}
  onClose={() => {
    setDialogOpen(false);
    // Additional cleanup
  }}
  presetId={preset.id}
  itemName={preset.title}
/>
```

## Component Structure

### GraphQL Queries

```typescript
const GET_USER_LISTS = gql`
  query GetUserLists($userId: ID!) {
    getUserLists(userId: $userId) {
      id
      name
      description
      isPublic
      owner {
        id
      }
      presets {
        id
        title
        slug
      }
      filmSims {
        id
        name
        slug
      }
    }
  }
`;

const ADD_TO_LIST = gql`
  mutation AddToUserList($listId: ID!, $presetIds: [ID!], $filmSimIds: [ID!]) {
    addToUserList(
      listId: $listId
      presetIds: $presetIds
      filmSimIds: $filmSimIds
    ) {
      id
      name
      description
      isPublic
    }
  }
`;
```

### Main Dialog Structure

```typescript
<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
  <DialogTitle>Add {itemName} to List</DialogTitle>
  <DialogContent>
    {/* Error/Success alerts */}
    {/* Loading state */}
    {/* Empty state */}
    {/* List items */}
  </DialogContent>
  <DialogActions>{/* Action buttons */}</DialogActions>
</Dialog>
```

### List Filtering Logic

```typescript
const lists = data?.getUserLists || [];
const userLists = lists.filter((list) => list.owner?.id === currentUser?.id);
const uniqueLists = userLists.filter(
  (list, index, self) => index === self.findIndex((l) => l.id === list.id)
);
```

### Add to List Handler

```typescript
const handleAddToList = async (listId: string) => {
  try {
    // Validate that we have at least one item to add
    if (!presetId && !filmSimId) {
      throw new Error("No item selected to add to list");
    }

    // Validate that we have a valid list ID
    if (!listId) {
      throw new Error("Invalid list ID");
    }

    // Validate that we have a logged in user
    if (!currentUser?.id) {
      throw new Error("You must be logged in to add items to a list");
    }

    const result = await addToList({
      variables: {
        listId,
        presetIds: presetId ? [presetId] : [],
        filmSimIds: filmSimId ? [filmSimId] : [],
      },
    });
  } catch (err) {
    console.error("Error adding to list:", err);
    setError(err instanceof Error ? err.message : "Failed to add to list");
  }
};
```

## Styling & Theming

### Dialog Styling

```typescript
sx={{
  maxWidth: "sm",
  fullWidth: true,
}}
```

### Alert Styling

```typescript
sx={{
  mb: 2, // Bottom margin for spacing
}}
```

### Loading Box Styling

```typescript
sx={{
  display: "flex",
  justifyContent: "center",
  p: 3,
}}
```

### Empty State Styling

```typescript
sx={{
  textAlign: "center",
  py: 3,
}}
```

### List Item Styling

```typescript
// Default Material-UI list item styling
// Customizable through theme overrides
```

## Performance Considerations

### Optimization Strategies

- **Conditional Queries**: Skip queries when user is not authenticated
- **State Management**: Minimal state updates
- **Error Handling**: Efficient error state management
- **Memory Management**: Clean component lifecycle

### Query Performance

- **User Lists Query**: Efficient user lists fetching
- **Mutation Optimization**: Optimized add to list mutation
- **Data Refetching**: Smart data refetching after mutations
- **Loading States**: Proper loading state management

### Rendering Performance

- **Conditional Rendering**: Efficient conditional rendering
- **List Rendering**: Optimized list item rendering
- **Dialog Performance**: Smooth dialog opening/closing
- **Filter Performance**: Efficient list filtering

### Memory Management

- **Event Cleanup**: Proper cleanup of event listeners
- **State Reset**: Reset state when dialog closes
- **Memory Leaks**: Prevention of memory leaks
- **Component Cleanup**: Clean component unmounting

## Error Handling

### Authentication Errors

- **User Not Logged In**: Handle unauthenticated users
- **Session Expired**: Handle expired sessions
- **Auth Context Errors**: Safe auth context handling
- **Navigation Errors**: Safe navigation error handling

### GraphQL Errors

- **Query Errors**: Safe handling of GraphQL query errors
- **Mutation Errors**: Graceful mutation error handling
- **Network Errors**: Network connectivity error handling
- **Data Errors**: Safe handling of invalid data

### Validation Errors

- **Input Validation**: Comprehensive input validation
- **List ID Validation**: Validate list ID existence
- **User Validation**: Validate user permissions
- **Item Validation**: Validate item existence

### User Interaction Errors

- **Dialog Errors**: Safe dialog interaction handling
- **List Selection Errors**: Safe list selection handling
- **Navigation Errors**: Safe navigation error handling
- **Button Errors**: Safe button interaction handling

## Accessibility Features

### ARIA Support

- **Dialog Role**: Proper role for dialog component
- **List Role**: Proper role for list items
- **Button Role**: Proper role for action buttons
- **Alert Role**: Proper role for error/success alerts

### Screen Reader Support

- **Descriptive Text**: Clear descriptions for screen readers
- **List Information**: List details announcements
- **Error Announcements**: Error message announcements
- **Success Announcements**: Success message announcements

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
// Test selectors for add to list dialog functionality
data-cy="add-to-list-dialog"       // Main dialog container
data-cy="dialog-title"             // Dialog title
data-cy="list-item"                // Individual list items
data-cy="list-name"                // List name text
data-cy="list-description"         // List description text
data-cy="list-stats"               // List statistics text
data-cy="create-list-button"       // Create list button
data-cy="cancel-button"            // Cancel button
data-cy="error-alert"              // Error alert
data-cy="success-alert"            // Success alert
data-cy="loading-spinner"          // Loading spinner
```

### Test Scenarios

1. **Dialog Opening**: Test dialog open/close functionality
2. **List Fetching**: Test user lists fetching
3. **List Selection**: Test list selection functionality
4. **Add to List**: Test adding items to lists
5. **Error Handling**: Test error scenarios
6. **Success Feedback**: Test success feedback
7. **Navigation**: Test navigation to create list
8. **Validation**: Test input validation
9. **Accessibility**: Test screen reader and keyboard navigation
10. **Performance**: Test dialog rendering performance

### Performance Testing

- **Dialog Rendering**: Monitor dialog rendering performance
- **List Fetching**: Test list fetching performance
- **Mutation Performance**: Test add to list mutation performance
- **Memory Usage**: Check for memory leaks
- **Interaction Performance**: Test dialog interaction performance

## Dependencies

### Internal Dependencies

- **AuthContext**: User authentication context
- **GraphQL Queries**: User lists and add to list mutations
- **Material-UI Components**: Dialog, List, Button, etc.
- **React Router**: useNavigate for navigation

### External Dependencies

- **Material-UI**: Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemButton, ListItemText, Typography, CircularProgress, Alert, Box
- **Apollo Client**: useQuery, useMutation, gql
- **React Router**: useNavigate
- **React**: Core React functionality
- **CSS**: Custom styling and transitions

### Browser Support

- **CSS Flexbox**: Modern flexbox support
- **CSS Grid**: Modern grid support
- **Touch Events**: Touch event support for mobile
- **Material-UI**: Material-UI component support

## Future Enhancements

### Planned Features

1. **Bulk Add**: Add multiple items to lists at once
2. **List Previews**: Preview list contents before adding
3. **Smart Suggestions**: Suggest relevant lists based on item type
4. **Quick Actions**: Quick action buttons for common lists
5. **List Sharing**: Share lists with other users

### Performance Improvements

1. **Query Optimization**: Further optimize GraphQL queries
2. **Caching**: Enhanced query result caching
3. **Lazy Loading**: Lazy load dialog content
4. **Bundle Optimization**: Code splitting for dialog components

### UX Enhancements

1. **Drag and Drop**: Drag items to lists
2. **Keyboard Shortcuts**: Keyboard shortcuts for quick adding
3. **List Management**: Inline list management in dialog
4. **Item Previews**: Show item previews in dialog
5. **Advanced Filtering**: Filter lists by type or content

---

_This component provides a focused and user-friendly dialog interface for adding presets and film simulations to personal lists in the VISOR application, with robust validation and error handling._
