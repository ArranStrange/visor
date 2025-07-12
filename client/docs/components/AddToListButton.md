# AddToListButton Component

## Overview

The `AddToListButton` component is a sophisticated list management interface that allows users to add presets or film simulations to their personal lists. It features authentication handling, real-time list fetching, and a comprehensive dialog interface for list selection, making it an essential component for content organization in the VISOR application.

## File Location

```
src/components/AddToListButton.tsx
```

## Props Interface

```typescript
interface AddToListButtonProps {
  presetId?: string; // Optional preset ID to add
  filmSimId?: string; // Optional film simulation ID to add
  itemName: string; // Display name of the item being added
}
```

## Key Features

### 🔐 Authentication Integration

- **User Authentication**: Checks user authentication status
- **Login Redirect**: Redirects to login if user is not authenticated
- **User Context**: Integrates with AuthContext for user data
- **Session Management**: Proper session handling

### 📋 List Management

- **User Lists**: Fetches and displays user's personal lists
- **List Selection**: Interactive list selection interface
- **List Creation**: Quick access to create new lists
- **List Statistics**: Shows list item counts and visibility

### 🎨 Visual Design

- **Floating Button**: Positioned absolutely with hover effects
- **Material-UI Dialog**: Professional dialog design
- **Loading States**: Proper loading state management
- **Error Handling**: Comprehensive error display

### 🔧 Technical Features

- **GraphQL Integration**: Efficient data fetching with Apollo Client
- **State Management**: Local state for dialog and feedback
- **Navigation**: React Router integration for redirects
- **Performance Optimization**: Optimized queries and mutations

## Usage Examples

### Basic Usage

```tsx
<AddToListButton presetId="preset-123" itemName="Vintage Film Preset" />
```

### With Film Simulation

```tsx
<AddToListButton filmSimId="filmsim-456" itemName="Kodak Portra 400" />
```

### In Preset Card

```tsx
<Box sx={{ position: "relative" }}>
  <PresetCard preset={preset} />
  <AddToListButton presetId={preset.id} itemName={preset.title} />
</Box>
```

### With Custom Positioning

```tsx
<Box sx={{ position: "relative" }}>
  <FilmSimCard filmSim={filmSim} />
  <Box sx={{ position: "absolute", top: 16, right: 16 }}>
    <AddToListButton filmSimId={filmSim.id} itemName={filmSim.name} />
  </Box>
</Box>
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

### Main Component Structure

```typescript
<>
  <IconButton
    data-cy="add-to-list-button"
    onClick={handleClick}
    sx={{
      position: "absolute",
      top: 16,
      right: 16,
      backgroundColor: "background.paper",
      "&:hover": {
        backgroundColor: "action.hover",
      },
    }}
  >
    <AddIcon />
  </IconButton>

  <Dialog
    data-cy="list-selection-dialog"
    open={open}
    onClose={() => setOpen(false)}
    maxWidth="sm"
    fullWidth
  >
    {/* Dialog content */}
  </Dialog>
</>
```

### Dialog Content

```typescript
<DialogTitle>Add {itemName} to List</DialogTitle>
<DialogContent>
  {/* Error/Success alerts */}
  {/* Loading state */}
  {/* Empty state */}
  {/* List items */}
</DialogContent>
<DialogActions>
  {/* Action buttons */}
</DialogActions>
```

### List Item Rendering

```typescript
<List>
  {lists.map((list: any) => (
    <ListItem key={list.id} disablePadding>
      <ListItemButton onClick={() => handleAddToList(list.id)}>
        <ListItemText
          primary={list.name}
          secondary={
            <Box component="span">
              {list.description && (
                <Typography variant="body2" color="text.secondary">
                  {list.description}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {list.presets?.length || 0} presets •{" "}
                {list.filmSims?.length || 0} film sims
                {list.isPublic && " • Public"}
              </Typography>
            </Box>
          }
        />
      </ListItemButton>
    </ListItem>
  ))}
</List>
```

## Styling & Theming

### IconButton Styling

```typescript
sx={{
  position: "absolute",
  top: 16,
  right: 16,
  backgroundColor: "background.paper",
  "&:hover": {
    backgroundColor: "action.hover",
  },
}}
```

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
- **Button Interactions**: Efficient button interaction handling

### Memory Management

- **Event Cleanup**: Proper cleanup of event listeners
- **State Reset**: Reset state when dialog closes
- **Memory Leaks**: Prevention of memory leaks
- **Component Cleanup**: Clean component unmounting

## Error Handling

### Authentication Errors

- **User Not Logged In**: Redirect to login page
- **Session Expired**: Handle expired sessions
- **Auth Context Errors**: Safe auth context handling
- **Navigation Errors**: Safe navigation error handling

### GraphQL Errors

- **Query Errors**: Safe handling of GraphQL query errors
- **Mutation Errors**: Graceful mutation error handling
- **Network Errors**: Network connectivity error handling
- **Data Errors**: Safe handling of invalid data

### User Interaction Errors

- **Button Click Errors**: Safe button click handling
- **Dialog Errors**: Safe dialog interaction handling
- **List Selection Errors**: Safe list selection handling
- **Navigation Errors**: Safe navigation error handling

### Display Errors

- **Alert Errors**: Graceful alert display error handling
- **List Errors**: Safe list rendering error handling
- **Theme Errors**: Fallback for theme issues
- **Accessibility Errors**: Proper accessibility handling

## Accessibility Features

### ARIA Support

- **Button Role**: Proper role for add button
- **Dialog Role**: Proper role for dialog component
- **List Role**: Proper role for list items
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
// Test selectors for add to list button functionality
data-cy="add-to-list-button"       // Main add button
data-cy="list-selection-dialog"    // List selection dialog
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

1. **Authentication**: Test authentication flow
2. **List Fetching**: Test user lists fetching
3. **List Selection**: Test list selection functionality
4. **Add to List**: Test adding items to lists
5. **Error Handling**: Test error scenarios
6. **Success Feedback**: Test success feedback
7. **Navigation**: Test navigation to create list
8. **Accessibility**: Test screen reader and keyboard navigation
9. **Performance**: Test button and dialog performance

### Performance Testing

- **Button Rendering**: Monitor button rendering performance
- **Dialog Performance**: Test dialog opening/closing performance
- **List Fetching**: Test list fetching performance
- **Memory Usage**: Check for memory leaks
- **Interaction Performance**: Test button and dialog interaction performance

## Dependencies

### Internal Dependencies

- **AuthContext**: User authentication context
- **GraphQL Queries**: User lists and add to list mutations
- **Material-UI Components**: IconButton, Dialog, List, etc.
- **React Router**: useNavigate for navigation

### External Dependencies

- **Material-UI**: IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemButton, ListItemText, Typography, CircularProgress, Alert, Box
- **Material-UI Icons**: AddIcon
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
4. **Bundle Optimization**: Code splitting for list components

### UX Enhancements

1. **Drag and Drop**: Drag items to lists
2. **Keyboard Shortcuts**: Keyboard shortcuts for quick adding
3. **List Management**: Inline list management in dialog
4. **Item Previews**: Show item previews in dialog
5. **Advanced Filtering**: Filter lists by type or content

---

_This component provides a comprehensive and user-friendly interface for adding presets and film simulations to personal lists in the VISOR application, with robust authentication and error handling._
