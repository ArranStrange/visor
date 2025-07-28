# Lists Page

## Overview

The Lists page displays a user's personal lists of presets and film simulations. It provides a comprehensive view of all user-created lists with options to create new lists and navigate to list details.

## File Location

`src/pages/Lists.tsx`

## Key Features

### List Display

- **User Lists**: Shows all lists created by the current user
- **List Information**: Name, description, privacy status, and item counts
- **Interactive Lists**: Click to navigate to list details
- **Empty State**: Helpful message when no lists exist

### List Management

- **Create New List**: Button to create a new list
- **List Navigation**: Click any list to view its details
- **List Information**: Shows presets and film simulations in each list

### User Authentication

- **Login Required**: Only shows for authenticated users
- **User Context**: Uses AuthContext for current user
- **Permission Handling**: Handles user permissions appropriately

## Component Structure

### GraphQL Query

```tsx
const GET_USER_LISTS = gql`
  query GetUserLists($userId: ID!) {
    getUserLists(userId: $userId) {
      id
      name
      description
      isPublic
      owner {
        id
        username
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
      createdAt
      updatedAt
    }
  }
`;
```

### State Management

- **Loading State**: Handles GraphQL query loading
- **Error State**: Manages query errors gracefully
- **Data State**: Stores user lists data
- **Navigation State**: Handles list navigation

## UI Components

### Header Section

- **Title**: "My Lists" with h4 typography
- **Create Button**: Primary button with add icon
- **Responsive Layout**: Flexbox with space-between alignment

### List Display

- **List Component**: Material-UI List component
- **ListItem**: Individual list items with click handlers
- **List Information**: Name, description, and item counts
- **Visual Hierarchy**: Clear typography and spacing

### Empty State

- **Icon Display**: Large list icon for visual appeal
- **Helpful Message**: Clear guidance for new users
- **Call-to-Action**: Button to create first list
- **Centered Layout**: Perfect centering for empty state

## Data Structure

### UserList Interface

```tsx
interface UserList {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  owner: {
    id: string;
    username: string;
  };
  presets: Array<{
    id: string;
    title: string;
    slug: string;
  }>;
  filmSims: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}
```

### List Item Structure

- **List Name**: Primary identifier for the list
- **Description**: Optional description text
- **Privacy Status**: Public or private indicator
- **Item Counts**: Number of presets and film simulations
- **Owner Information**: Username of list creator

## Navigation Logic

### List Click Handler

```tsx
const handleListClick = (listId: string) => {
  console.log("List clicked:", listId);
  console.log("Navigating to:", `/list/${listId}`);
  navigate(`/list/${listId}`);
};
```

### Create List Handler

```tsx
const handleCreateList = () => {
  navigate(`/create-list`);
};
```

### Route Structure

- **Current Route**: `/lists`
- **List Detail Route**: `/list/:id`
- **Create List Route**: `/create-list`

## Error Handling

### Authentication Errors

- **No User**: Shows login prompt for unauthenticated users
- **User Context**: Handles missing user data gracefully
- **Permission Errors**: Clear error messages for permission issues

### Data Loading Errors

- **GraphQL Errors**: Comprehensive error logging
- **Network Errors**: User-friendly error messages
- **Debug Information**: Detailed error information for debugging

### Error Display

```tsx
if (error) {
  console.error("GraphQL Error:", error);
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Alert severity="error">
        Error loading lists: {error.message}
        <br />
        <Typography variant="caption">User ID: {currentUser?.id}</Typography>
      </Alert>
    </Container>
  );
}
```

## Loading States

### Query Loading

- **Loading Indicator**: Circular progress during data fetch
- **Centered Layout**: Perfect centering for loading state
- **User Feedback**: Clear indication of loading process

### Loading Component

```tsx
if (loading) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
    >
      <CircularProgress />
    </Box>
  );
}
```

## User Experience

### Visual Design

- **Clean Layout**: Minimalist design approach
- **Clear Hierarchy**: Obvious primary actions
- **Consistent Styling**: Matches app design system
- **Visual Feedback**: Hover states and interactions

### Interaction Design

- **Immediate Response**: Instant navigation on list click
- **Clear Call-to-Action**: Obvious "Create New List" button
- **Intuitive Navigation**: Familiar navigation patterns
- **Helpful Empty State**: Clear guidance for new users

## Accessibility Features

### Keyboard Navigation

- **Tab Order**: Logical tab sequence through elements
- **Focus Management**: Clear focus indicators
- **Enter Key**: Activates list selection

### Screen Reader Support

- **Semantic HTML**: Proper list and button structure
- **ARIA Labels**: Descriptive labels for interactive elements
- **Navigation Context**: Clear indication of page purpose
- **List Announcements**: Proper list item announcements

### Visual Accessibility

- **High Contrast**: Adequate contrast ratios
- **Focus Indicators**: Clear focus states
- **Touch Targets**: Sufficient touch target sizes
- **Loading States**: Clear visual feedback

## Performance Considerations

### Data Loading

- **GraphQL Query**: Efficient data fetching with caching
- **User Filtering**: Only loads current user's lists
- **Error Recovery**: Graceful handling of loading failures
- **Optimized Queries**: Minimal data transfer

### Component Optimization

- **Lightweight**: Minimal state and logic
- **Fast Rendering**: Simple component structure
- **Efficient Navigation**: Direct route navigation
- **Memoized Components**: Optimized re-rendering

## Integration Points

### Authentication Dependencies

- `AuthContext`: User authentication state management
- **User ID**: Required for GraphQL query
- **Permission Handling**: User-specific data access

### Navigation Dependencies

- `useNavigate`: React Router navigation hook
- **Route Configuration**: Integration with app routing
- **Dynamic Routes**: List detail route handling

### Component Dependencies

- **Material-UI**: List, Typography, Button, Box, Container
- **React Router**: Navigation functionality
- **Apollo Client**: GraphQL data fetching

## Testing Integration

### Cypress Testing

- **Page Load**: Test page rendering for authenticated users
- **Unauthenticated State**: Test behavior for non-logged-in users
- **List Interaction**: Test list clicking and navigation
- **Create Button**: Test navigation to create list page
- **Empty State**: Test when no lists exist
- **Error States**: Test various error scenarios

### Test Scenarios

- **Authenticated User**: Load and display user lists
- **Unauthenticated User**: Show appropriate message
- **List Navigation**: Click lists and verify navigation
- **Create List**: Test create list button functionality
- **Loading States**: Test loading indicator display
- **Error Handling**: Test GraphQL error scenarios
- **Empty State**: Test when user has no lists

## Debug Features

### Console Logging

- **User Data**: Logs current user information
- **Query Variables**: Logs GraphQL query parameters
- **Navigation Events**: Logs list click and navigation events
- **Error Details**: Comprehensive error logging

### Debug Information

```tsx
console.log("Current user:", currentUser);
console.log("Query variables:", { userId: currentUser?.id });
console.log("GraphQL query completed successfully:", data);
console.log("Lists data:", data?.getUserLists);
```

## Future Enhancements

### Planned Features

- **List Sorting**: Sort lists by name, date, popularity
- **List Search**: Search within user's lists
- **List Categories**: Categorize lists by type
- **List Sharing**: Share lists with other users
- **List Templates**: Pre-configured list templates
- **List Analytics**: Track list usage and engagement
- **List Export**: Export list data
- **List Import**: Import lists from other sources
- **List Collaboration**: Collaborative list editing
- **List Notifications**: Real-time list updates

### List Management Features

- **Bulk Operations**: Select multiple lists for operations
- **List Duplication**: Copy existing lists
- **List Archiving**: Archive old lists
- **List Privacy**: Enhanced privacy controls
- **List Moderation**: Moderation tools for public lists
