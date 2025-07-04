# Notification System Implementation

## Overview

The notification system provides real-time updates to users about relevant activity in the VISOR app. It automatically creates notifications for discussion replies, mentions, follows, and likes.

## Features

### ✅ Implemented Features

1. **Database Schema**

   - `Notification` model with all required fields
   - Proper indexing for performance
   - Support for different notification types

2. **GraphQL Schema**

   - Complete type definitions for notifications
   - Queries for fetching notifications with pagination
   - Mutations for marking notifications as read/deleted

3. **Notification Types**

   - `DISCUSSION_REPLY` - When someone replies to a discussion you follow
   - `DISCUSSION_OWNER_REPLY` - When someone replies to your discussion
   - `MENTION` - When someone mentions you in a post
   - `FOLLOW` - When someone follows you
   - `LIKE` - When someone likes your post

4. **Automatic Notification Creation**

   - Integrated with discussion post creation
   - Handles mentions parsing
   - Notifies discussion owners and followers
   - Prevents self-notifications

5. **Security & Authorization**
   - Users can only access their own notifications
   - Proper validation of all inputs
   - Authorization checks on all operations

## Database Schema

### Notification Model

```javascript
{
  type: "DISCUSSION_REPLY" | "DISCUSSION_OWNER_REPLY" | "MENTION" | "FOLLOW" | "LIKE",
  title: String,
  message: String,
  isRead: Boolean (default: false),
  recipientId: ObjectId (ref: User),
  senderId: ObjectId (ref: User),
  discussionId: ObjectId (ref: Discussion),
  postId: ObjectId (ref: DiscussionPost),
  linkedItem: {
    type: String,
    id: ObjectId,
    title: String,
    slug: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## GraphQL API

### Queries

#### Get Notifications

```graphql
query GetNotifications($userId: ID!, $page: Int, $limit: Int) {
  getNotifications(userId: $userId, page: $page, limit: $limit) {
    notifications {
      id
      type
      title
      message
      isRead
      createdAt
      sender {
        id
        username
        avatar
      }
      discussion {
        id
        title
      }
    }
    totalCount
    hasNextPage
    hasPreviousPage
    unreadCount
  }
}
```

#### Get Unread Count

```graphql
query GetUnreadNotificationsCount($userId: ID!) {
  getUnreadNotificationsCount(userId: $userId)
}
```

### Mutations

#### Mark Notification as Read

```graphql
mutation MarkNotificationRead($input: MarkNotificationReadInput!) {
  markNotificationRead(input: $input) {
    id
    isRead
    updatedAt
  }
}
```

#### Mark All Notifications as Read

```graphql
mutation MarkAllNotificationsRead($input: MarkAllNotificationsReadInput!) {
  markAllNotificationsRead(input: $input) {
    success
    updatedCount
  }
}
```

#### Delete Notification

```graphql
mutation DeleteNotification($input: DeleteNotificationInput!) {
  deleteNotification(input: $input) {
    success
    deletedId
  }
}
```

## Usage Examples

### Creating Notifications

The system automatically creates notifications when:

1. **Discussion Replies**: When someone replies to a discussion

   ```javascript
   // This happens automatically in the createPost mutation
   await createPostNotifications(post, discussion, senderId);
   ```

2. **Mentions**: When someone mentions a user in a post

   ```javascript
   // Mentions are parsed from post content and notifications created
   const mentions = await parseMentions(content);
   ```

3. **Follows**: When someone follows a user

   ```javascript
   await createFollowNotification(followerId, followedId);
   ```

4. **Likes**: When someone likes a post
   ```javascript
   await createLikeNotification(likerId, postId, discussionId);
   ```

### Fetching Notifications

```javascript
// Get notifications with pagination
const { data } = await client.query({
  query: GET_NOTIFICATIONS,
  variables: {
    userId: currentUser.id,
    page: 1,
    limit: 20,
  },
});

// Get unread count for badge
const { data: countData } = await client.query({
  query: GET_UNREAD_COUNT,
  variables: { userId: currentUser.id },
});
```

## File Structure

```
models/
  Notification.js              # Notification database model

schema/
  typeDefs/
    notification.js            # GraphQL type definitions
  resolvers/
    notification.js            # GraphQL resolvers

utils/
  notificationUtils.js         # Notification creation utilities

test-notifications.js          # Test script for verification
```

## Testing

Run the test script to verify the notification system:

```bash
node test-notifications.js
```

This will:

1. Connect to your database
2. Create test users and discussions
3. Create test posts
4. Trigger notification creation
5. Verify notifications are created correctly
6. Test GraphQL queries

## Performance Considerations

### Indexes

The notification system includes optimized indexes:

- `{ recipientId: 1, createdAt: -1 }` - For fetching user notifications
- `{ recipientId: 1, isRead: 1 }` - For unread count queries
- `{ senderId: 1 }` - For sender lookups
- `{ type: 1 }` - For filtering by notification type

### Pagination

- Default page size: 20 notifications
- Efficient skip/limit queries
- Total count calculation for pagination info

### Cleanup

Consider implementing a cleanup job to remove old notifications:

```javascript
// Remove notifications older than 90 days
await Notification.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
});
```

## Security Features

1. **Authorization**: Users can only access their own notifications
2. **Input Validation**: All inputs are validated before processing
3. **No Self-Notifications**: Users don't receive notifications for their own actions
4. **Rate Limiting**: Consider implementing rate limiting for notification creation

## Integration Points

### Discussion System

- Notifications are automatically created when posts are created
- Only creates notifications for replies (not first posts)
- Handles discussion owners and followers

### User System

- Integrates with existing user authentication
- Uses user IDs for recipient/sender relationships

### Mention System

- Parses mentions from post content
- Creates notifications for mentioned users
- Supports user, preset, and film sim mentions

## Future Enhancements

1. **Real-time Updates**: Implement WebSocket connections for live notifications
2. **Email Notifications**: Send email notifications for important events
3. **Push Notifications**: Mobile push notifications
4. **Notification Preferences**: Allow users to customize notification settings
5. **Notification Groups**: Group similar notifications together
6. **Advanced Filtering**: Filter by type, date, sender, etc.

## Troubleshooting

### Common Issues

1. **Notifications not created**: Check if the post has a `parentId` (replies only)
2. **Permission errors**: Verify user authentication and authorization
3. **Database errors**: Check MongoDB connection and indexes
4. **Performance issues**: Monitor query performance and add indexes if needed

### Debug Mode

Enable debug logging in the notification utilities:

```javascript
console.log("Creating notifications for post:", post._id);
console.log("Discussion:", discussion.title);
console.log("Sender:", senderId);
```

## API Documentation

For complete API documentation, see the GraphQL schema files:

- `schema/typeDefs/notification.js` - Type definitions
- `schema/resolvers/notification.js` - Resolver implementations

The notification system is now fully integrated and ready for use!
