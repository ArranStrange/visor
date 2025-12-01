import { createSlot } from "./create-slot";

/**
 * Slot Definitions
 *
 * All available slots in the application where plugins can inject components.
 * Slots are organized by feature area.
 */

// ============================================================================
// Home Page Slots
// ============================================================================

/** Home page hero section - appears at the top */
export const HomePageHero = createSlot("HomePageHero");

/** Home page tiles/widgets - appears in the main content area */
export const HomePageTile = createSlot("HomePageTile");

/** Home page featured sections */
export const HomePageFeaturedSection = createSlot("HomePageFeaturedSection");

// ============================================================================
// Card Slots
// ============================================================================

/** FilmSim card overlay actions (buttons, icons) */
export const FilmSimCardOverlay = createSlot("FilmSimCardOverlay");

/** FilmSim card footer content */
export const FilmSimCardFooter = createSlot("FilmSimCardFooter");

/** Preset card overlay actions */
export const PresetCardOverlay = createSlot("PresetCardOverlay");

/** Preset card footer content */
export const PresetCardFooter = createSlot("PresetCardFooter");

/** List card overlay actions */
export const ListCardOverlay = createSlot("ListCardOverlay");

/** List card footer content */
export const ListCardFooter = createSlot("ListCardFooter");

// ============================================================================
// Detail Page Slots
// ============================================================================

/** FilmSim detail page header toolbar */
export const FilmSimDetailToolbar = createSlot("FilmSimDetailToolbar");

/** FilmSim detail page sections */
export const FilmSimDetailSection = createSlot("FilmSimDetailSection");

/** Preset detail page header toolbar */
export const PresetDetailToolbar = createSlot("PresetDetailToolbar");

/** Preset detail page sections */
export const PresetDetailSection = createSlot("PresetDetailSection");

/** Discussion detail page toolbar */
export const DiscussionDetailToolbar = createSlot("DiscussionDetailToolbar");

/** Discussion detail page sections */
export const DiscussionDetailSection = createSlot("DiscussionDetailSection");

// ============================================================================
// Navigation Slots
// ============================================================================

/** Navbar left side content */
export const NavbarLeft = createSlot("NavbarLeft");

/** Navbar right side content */
export const NavbarRight = createSlot("NavbarRight");

/** Navbar center content */
export const NavbarCenter = createSlot("NavbarCenter");

/** Navbar user menu items - plugins can inject menu items here */
export const NavbarUserMenuItems = createSlot("NavbarUserMenuItems");

// ============================================================================
// Search Slots
// ============================================================================

/** Search page filters */
export const SearchFilters = createSlot("SearchFilters");

/** Search page results header */
export const SearchResultsHeader = createSlot("SearchResultsHeader");

// ============================================================================
// Profile Slots
// ============================================================================

/** Profile page header content */
export const ProfileHeader = createSlot("ProfileHeader");

/** Profile page tabs */
export const ProfileTabs = createSlot("ProfileTabs");

/** Profile page tab panels */
export const ProfileTabPanels = createSlot("ProfileTabPanels");

// ============================================================================
// Upload Slots
// ============================================================================

/** Upload page toolbar */
export const UploadToolbar = createSlot("UploadToolbar");

/** Upload form sections */
export const UploadFormSection = createSlot("UploadFormSection");

// ============================================================================
// List Slots
// ============================================================================

/** List detail page header */
export const ListDetailHeader = createSlot("ListDetailHeader");

/** List detail page toolbar */
export const ListDetailToolbar = createSlot("ListDetailToolbar");

/** List detail page sections */
export const ListDetailSection = createSlot("ListDetailSection");

// ============================================================================
// Discussion Slots
// ============================================================================

/** Discussion list page filters */
export const DiscussionFilters = createSlot("DiscussionFilters");

/** Discussion list page header */
export const DiscussionListHeader = createSlot("DiscussionListHeader");

/** Discussion thread actions */
export const DiscussionThreadActions = createSlot("DiscussionThreadActions");

// ============================================================================
// Settings Slots
// ============================================================================

/** Settings page tabs */
export const SettingsTabs = createSlot("SettingsTabs");

/** Settings page tab panels */
export const SettingsTabPanels = createSlot("SettingsTabPanels");
