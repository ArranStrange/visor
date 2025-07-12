# Notifications Page

## Overview

The Notifications page provides a comprehensive notification management system for the VISOR application. It displays user notifications with filtering, pagination, and interactive features for managing notification states.

## File Location

`src/pages/Notifications.tsx`

## Key Features

### Notification Display

- **Notification List**: Displays all user notifications with pagination
- **Notification Types**: Different icons and colors for various notification types
- **Interactive Notifications**: Click to navigate to related content
- **Notification States**: Read/unread status management

### Notification Management

- **Mark as Read**: Individual and bulk read marking
- **Delete Notifications**: Remove unwanted notifications
- **Filter Options**: Filter by read status and notification type
- **Pagination**: Navigate through large notification lists

### Notification Types

- **Discussion Replies**: Comments on user's discussions
- **Owner Replies**: Replies to discussions user owns
- **Mentions**: User mentions in discussions
- **Follows**: New user followers
- **Likes**: Content likes and reactions

## Component Structure

### State Management

```tsx
const [page, setPage] = useState(1);
const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
const [selectedNotification, setSelectedNotification] =
  useState<Notification | null>(null);
```

### GraphQL Integration

- **GET_NOTIFICATIONS**: Fetches paginated notifications
- **DELETE_NOTIFICATION**: Removes individual notifications
- **Notification Context**: Uses notification context for state management

## UI Components

### Header Section

- **Page Title**: "Notifications" with appropriate icon
- **Filter Controls**: Dropdown filters for status and type
- **Bulk Actions**: Mark all as read functionality

### Notification Cards

- **Avatar Display**: User avatars for notification sources
- **Notification Content**: Rich notification text and metadata
- **Action Menu**: Three-dot menu for individual actions
- **Timestamp**: Relative time display using date-fns

### Filter Controls

- **Status Filter**: All, Unread, Read
- **Type Filter**: All types or specific notification types
- **Filter Display**: Clear indication of active filters

## Notification Types

### Discussion Replies

- **Icon**: ReplyIcon
- **Color**: Primary color
- **Action**: Navigate to discussion
- **Content**: Reply text and discussion context

### Owner Replies

- **Icon**: ReplyIcon
- **Color**: Primary color
- **Action**: Navigate to discussion
- **Content**: Owner reply notification

### Mentions

- **Icon**: MentionIcon
- **Color**: Warning color
- **Action**: Navigate to mentioned content
- **Content**: User mention context

### Follows

- **Icon**: PersonIcon
- **Color**: Info color
- **Action**: Navigate to user profile
- **Content**: New follower information

### Likes

- **Icon**: LikeIcon
- **Color**: Success color
- **Action**: Navigate to liked content
- **Content**: Like notification context

## Navigation Logic

### Notification Click Handler

```tsx
const handleNotificationClick = async (notification: Notification) => {
  await markAsRead(notification.id);

  if (notification.discussionId) {
    navigate(`/discussions/${notification.discussionId}`);
  } else if (notification.linkedItem?.slug) {
    const path =
      notification.linkedItem.type === "PRESET"
        ? `/preset/${notification.linkedItem.slug}`
        : `/filmsim/${notification.linkedItem.slug}`;
    navigate(path);
  }
};
```

### Menu Actions

- **Mark as Read**: Individual read marking
- **Delete**: Remove notification
- **Menu Management**: Open/close menu states

## Data Filtering

### Status Filtering

```tsx
const filteredNotifications = notifications.filter(
  (notification: Notification) => {
    if (filter === "unread" && notification.isRead) return false;
    if (filter === "read" && !notification.isRead) return false;
    if (typeFilter !== "all" && notification.type !== typeFilter) return false;
    return true;
  }
);
```

### Type Filtering

- **All Types**: Show all notification types
- **Specific Types**: Filter by individual notification types
- **Combined Filters**: Status and type filters work together

## Pagination

### Pagination Logic

- **Page Size**: 20 notifications per page
- **Total Pages**: Calculated from total count
- **Page Navigation**: Material-UI Pagination component
- **Page State**: Current page maintained in state

### Pagination Component

```tsx
<Pagination
  count={totalPages}
  page={page}
  onChange={(event, value) => setPage(value)}
  color="primary"
/>
```

## Notification Actions

### Mark as Read

```tsx
const handleMarkAsRead = async (notificationId: string) => {
  await markAsRead(notificationId);
  handleMenuClose();
};
```

### Delete Notification

```tsx
const handleDelete = async () => {
  if (!selectedNotification) return;

  try {
    await deleteNotification({
      variables: {
        input: { notificationId: selectedNotification.id },
      },
    });
    refetchNotifications();
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
  handleMenuClose();
};
```

## Visual Design

### Notification Cards

- **Card Layout**: Material-UI Card components
- **Avatar Integration**: User avatars with fallbacks
- **Typography Hierarchy**: Clear text hierarchy
- **Color Coding**: Type-specific colors for quick identification

### Icon System

- **Type Icons**: Specific icons for each notification type
- **Action Icons**: Menu and action icons
- **Status Indicators**: Visual read/unread indicators
- **Color Coding**: Consistent color scheme

## Accessibility Features

### Keyboard Navigation

- **Tab Order**: Logical tab sequence through notifications
- **Focus Management**: Clear focus indicators
- **Enter Key**: Activates notification clicks
- **Escape Key**: Closes menus

### Screen Reader Support

- **Semantic HTML**: Proper notification structure
- **ARIA Labels**: Descriptive labels for interactive elements
- **Status Announcements**: Read/unread status announcements
- **Navigation Context**: Clear navigation instructions

### Visual Accessibility

- **High Contrast**: Adequate contrast ratios
- **Focus Indicators**: Clear focus states
- **Touch Targets**: Sufficient touch target sizes
- **Color Independence**: Information not conveyed by color alone

## Performance Optimizations

### Data Loading

- **Pagination**: Efficient loading of large datasets
- **Caching**: Apollo Client caching for performance
- **Loading States**: Proper loading indicators
- **Error Recovery**: Graceful handling of loading failures

### Rendering Optimization

- **Memoized Components**: Optimized re-rendering
- **Efficient Filtering**: Client-side filtering for speed
- **Virtual Scrolling**: For large notification lists
- **Lazy Loading**: Load notifications as needed

## Error Handling

### Data Loading Errors

- **GraphQL Errors**: Graceful error handling
- **Network Errors**: User-friendly error messages
- **Fallback States**: Default content when data unavailable

### Action Errors

- **Delete Failures**: Handle deletion errors gracefully
- **Mark as Read Failures**: Handle read marking errors
- **Navigation Errors**: Handle navigation failures

## Integration Points

### Context Dependencies

- `NotificationContext`: Notification state management
- `AuthContext`: User authentication for permissions
- `markAsRead`, `markAllAsRead`, `refetchNotifications`: Context methods

### Navigation Dependencies

- `useNavigate`: React Router navigation hook
- **Dynamic Routes**: Discussion and content detail routes
- **Route Configuration**: Integration with app routing

### Component Dependencies

- **Material-UI**: Card, Typography, Button, Pagination, Menu
- **React Router**: Navigation functionality
- **Apollo Client**: GraphQL data fetching
- **date-fns**: Date formatting utilities

## Testing Integration

### Cypress Testing

- **Notification Display**: Test notification rendering
- **Filter Functionality**: Test status and type filters
- **Pagination**: Test page navigation
- **Notification Actions**: Test mark as read and delete
- **Navigation**: Test notification click navigation
- **Menu Interactions**: Test notification menus

### Test Scenarios

- **Notification Loading**: Load and display notifications
- **Filter Testing**: Test all filter combinations
- **Pagination Testing**: Navigate through pages
- **Action Testing**: Mark as read and delete notifications
- **Navigation Testing**: Click notifications and verify navigation
- **Error Handling**: Test various error scenarios
- **Empty States**: Test when no notifications exist

## Future Enhancements

### Planned Features

- **Real-time Updates**: WebSocket integration for live notifications
- **Notification Preferences**: User-configurable notification settings
- **Email Notifications**: Email integration for important notifications
- **Push Notifications**: Browser push notification support
- **Notification Groups**: Group similar notifications
- **Notification Search**: Search within notifications
- **Notification Export**: Export notification history
- **Notification Analytics**: Track notification engagement
- **Smart Notifications**: AI-powered notification prioritization
- **Notification Templates**: Customizable notification formats

### Advanced Features

- **Notification Scheduling**: Schedule notifications for later
- **Notification Categories**: Enhanced categorization
- **Notification Moderation**: Moderation tools for notifications
- **Notification Backup**: Backup notification history
- **Cross-platform Sync**: Sync notifications across devices
