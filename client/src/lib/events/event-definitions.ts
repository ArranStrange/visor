import { createEvent } from "./create-event";

/**
 * Event Definitions
 * 
 * All available events in the application for component communication.
 * Events are organized by feature area.
 */

// ============================================================================
// Content Events
// ============================================================================

/** Raised when a FilmSim is created, updated, or deleted */
export const FilmSimChanged = createEvent("FilmSimChanged");

/** Raised when a Preset is created, updated, or deleted */
export const PresetChanged = createEvent("PresetChanged");

/** Raised when a List is created, updated, or deleted */
export const ListChanged = createEvent("ListChanged");

/** Raised when content needs to be refreshed */
export const ContentRefresh = createEvent("ContentRefresh");

// ============================================================================
// User Events
// ============================================================================

/** Raised when user logs in */
export const UserLoggedIn = createEvent("UserLoggedIn", (args) => args[0]?.user);

/** Raised when user logs out */
export const UserLoggedOut = createEvent("UserLoggedOut");

/** Raised when user profile is updated */
export const UserProfileUpdated = createEvent("UserProfileUpdated", (args) => args[0]?.user);

// ============================================================================
// Navigation Events
// ============================================================================

/** Raised when navigation occurs */
export const Navigate = createEvent("Navigate", (args) => args[0]?.path);

/** Raised when search is performed */
export const SearchPerformed = createEvent("SearchPerformed", (args) => args[0]?.query);

// ============================================================================
// UI Events
// ============================================================================

/** Raised when a dialog should open */
export const DialogOpen = createEvent("DialogOpen", (args) => args[0]?.dialogId);

/** Raised when a dialog should close */
export const DialogClose = createEvent("DialogClose", (args) => args[0]?.dialogId);

/** Raised when notification should be shown */
export const ShowNotification = createEvent("ShowNotification", (args) => args[0]?.message);

// ============================================================================
// List Events
// ============================================================================

/** Raised when item is added to list */
export const ItemAddedToList = createEvent("ItemAddedToList", (args) => ({
  listId: args[0]?.listId,
  itemId: args[0]?.itemId,
  itemType: args[0]?.itemType,
}));

/** Raised when item is removed from list */
export const ItemRemovedFromList = createEvent("ItemRemovedFromList", (args) => ({
  listId: args[0]?.listId,
  itemId: args[0]?.itemId,
}));

// ============================================================================
// Discussion Events
// ============================================================================

/** Raised when a discussion is created or updated */
export const DiscussionChanged = createEvent("DiscussionChanged");

/** Raised when a post is created or updated */
export const PostChanged = createEvent("PostChanged");

/** Raised when a comment is created or updated */
export const CommentChanged = createEvent("CommentChanged");

// ============================================================================
// Upload Events
// ============================================================================

/** Raised when upload starts */
export const UploadStarted = createEvent("UploadStarted", (args) => args[0]?.uploadId);

/** Raised when upload completes */
export const UploadCompleted = createEvent("UploadCompleted", (args) => args[0]?.uploadId);

/** Raised when upload fails */
export const UploadFailed = createEvent("UploadFailed", (args) => ({
  uploadId: args[0]?.uploadId,
  error: args[0]?.error,
}));

// ============================================================================
// Notification Events
// ============================================================================

/** Raised when notifications are updated */
export const NotificationsUpdated = createEvent("NotificationsUpdated");

/** Raised when notification is read */
export const NotificationRead = createEvent("NotificationRead", (args) => args[0]?.notificationId);

