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
// Preset Events (Hierarchical)
// ============================================================================

/** Base event for Preset operations */
export const Preset = createEvent("Preset");

/** Raised when preset edit is requested */
export const PresetEditRequested = Preset("EditRequested");

/** Raised when preset delete is requested */
export const PresetDeleteRequested = Preset("DeleteRequested");

/** Raised when preset delete is confirmed by user */
export const PresetDeleteConfirmed = Preset("DeleteConfirmed");

/** Raised when preset save is requested */
export const PresetSaveRequested = Preset("SaveRequested");

/** Raised after preset is successfully saved */
export const PresetSaved = Preset("Saved");

/** Raised after preset is successfully deleted */
export const PresetDeleted = Preset("Deleted");

// ============================================================================
// FilmSim Events (Hierarchical)
// ============================================================================

/** Base event for FilmSim operations */
export const FilmSim = createEvent("FilmSim");

/** Raised when filmsim edit is requested */
export const FilmSimEditRequested = FilmSim("EditRequested");

/** Raised when filmsim delete is requested */
export const FilmSimDeleteRequested = FilmSim("DeleteRequested");

/** Raised when filmsim delete is confirmed by user */
export const FilmSimDeleteConfirmed = FilmSim("DeleteConfirmed");

/** Raised when filmsim save is requested */
export const FilmSimSaveRequested = FilmSim("SaveRequested");

/** Raised after filmsim is successfully saved */
export const FilmSimSaved = FilmSim("Saved");

/** Raised after filmsim is successfully deleted */
export const FilmSimDeleted = FilmSim("Deleted");

// ============================================================================
// List Events (Hierarchical)
// ============================================================================

/** Base event for List operations */
export const List = createEvent("List");

/** Raised when list edit is requested */
export const ListEditRequested = List("EditRequested");

/** Raised when list delete is requested */
export const ListDeleteRequested = List("DeleteRequested");

/** Raised when list save is requested */
export const ListSaveRequested = List("SaveRequested");

/** Raised after list is successfully saved */
export const ListSaved = List("Saved");

/** Raised after list is successfully deleted */
export const ListDeleted = List("Deleted");

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

/** Raised to navigate to a specific path */
export const NavigateTo = createEvent("NavigateTo", (args) => args[0]?.path);

/** Raised when search is performed */
export const SearchPerformed = createEvent("SearchPerformed", (args) => args[0]?.query);

/** Raised when download is requested */
export const DownloadRequested = createEvent("DownloadRequested", (args) => ({
  itemId: args[0]?.itemId,
  itemType: args[0]?.itemType,
  format: args[0]?.format,
}));

// ============================================================================
// UI Events
// ============================================================================

/** Raised when a dialog should open */
export const DialogOpen = createEvent("DialogOpen", (args) => args[0]?.dialogId);

/** Raised when a dialog should close */
export const DialogClose = createEvent("DialogClose", (args) => args[0]?.dialogId);

/** Raised when edit dialog should open */
export const EditDialogOpen = createEvent("EditDialogOpen");

/** Raised when edit dialog should close */
export const EditDialogClose = createEvent("EditDialogClose");

/** Raised when delete dialog should open */
export const DeleteDialogOpen = createEvent("DeleteDialogOpen");

/** Raised when delete dialog should close */
export const DeleteDialogClose = createEvent("DeleteDialogClose");

/** Raised when add photo dialog should open */
export const AddPhotoDialogOpen = createEvent("AddPhotoDialogOpen");

/** Raised when add photo dialog should close */
export const AddPhotoDialogClose = createEvent("AddPhotoDialogClose");

/** Raised when notification should be shown */
export const ShowNotification = createEvent("ShowNotification", (args) => args[0]?.message);

// ============================================================================
// UI State Events
// ============================================================================

/** Raised when menu opens */
export const MenuOpen = createEvent("MenuOpen", (args) => ({
  anchorEl: args[0]?.anchorEl,
  menuId: args[0]?.menuId,
}));

/** Raised when menu closes */
export const MenuClose = createEvent("MenuClose", (args) => args[0]?.menuId);

/** Raised when featured status is toggled */
export const FeaturedToggle = createEvent("FeaturedToggle", (args) => ({
  itemId: args[0]?.itemId,
  itemType: args[0]?.itemType,
  featured: args[0]?.featured,
}));

/** Raised when image is clicked */
export const ImageClick = createEvent("ImageClick", (args) => ({
  imageId: args[0]?.imageId,
  imageUrl: args[0]?.imageUrl,
  featured: args[0]?.featured,
}));

/** Raised when photo upload is requested */
export const PhotoUploadRequested = createEvent("PhotoUploadRequested", (args) => ({
  itemId: args[0]?.itemId,
  itemType: args[0]?.itemType,
}));

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
// Form Events
// ============================================================================

/** Raised when form data changes */
export const FormDataChange = createEvent("FormDataChange", (args) => ({
  field: args[0]?.field,
  value: args[0]?.value,
  formId: args[0]?.formId,
}));

/** Raised when form is submitted */
export const FormSubmit = createEvent("FormSubmit", (args) => ({
  formId: args[0]?.formId,
  data: args[0]?.data,
}));

/** Raised to request form validation */
export const FormValidation = createEvent("FormValidation", (args) => ({
  formId: args[0]?.formId,
  data: args[0]?.data,
}));

// ============================================================================
// Notification Events
// ============================================================================

/** Raised when notifications are updated */
export const NotificationsUpdated = createEvent("NotificationsUpdated");

/** Raised when notification is read */
export const NotificationRead = createEvent("NotificationRead", (args) => args[0]?.notificationId);

