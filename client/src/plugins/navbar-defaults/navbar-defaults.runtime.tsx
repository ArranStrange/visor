/**
 * Navbar Default Plugins
 *
 * This runtime file registers the default navbar components.
 * Plugins can override or extend these by using different priorities.
 */

import {
  NavbarLeft,
  NavbarRight,
  NavbarUserMenuItems,
} from "lib/slots/slot-definitions";
import { NavbarLogo } from "./logo";
import { NavbarSearchButton } from "./search-button";
import { NavbarUploadButton } from "./upload-button";
import { NavbarUserMenu } from "./user-menu";
import { NavbarLoginButton } from "./login-button";
import { AuthenticatedNotificationBell } from "./notification-bell";
import { ProfileMenuItem } from "./menu-items/profile-menu-item";
import { MyListsMenuItem } from "./menu-items/my-lists-menu-item";
import { BrowseListsMenuItem } from "./menu-items/browse-lists-menu-item";
import { DiscussionsMenuItem } from "./menu-items/discussions-menu-item";
import { NotificationsMenuItem } from "./menu-items/notifications-menu-item";
import { EmojiButton } from "./emoji-button";

// Register logo on left side
NavbarLeft.plug(<NavbarLogo key="navbar-logo" />, 10);
//Emoji Button for practice puttin in slots
NavbarLeft.plug(<EmojiButton />, 20);

// Register right side components
// Search button (always visible)
NavbarRight.plug(<NavbarSearchButton key="navbar-search" />, 10);

// Notification bell (only when authenticated)
NavbarRight.plug(
  <AuthenticatedNotificationBell key="navbar-notifications" />,
  30
);

// Upload button (only when authenticated - handles auth check internally)
NavbarRight.plug(<NavbarUploadButton key="navbar-upload" />, 30);

// User menu (only when authenticated and user exists - handles auth check internally)
NavbarRight.plug(<NavbarUserMenu key="navbar-user-menu" />, 40);

// Login button (only when not authenticated - handles auth check internally)
NavbarRight.plug(<NavbarLoginButton key="navbar-login" />, 50);

// Register default user menu items
// Props (user, onClose, navigate) will be provided by NavbarUserMenuItems.Slot
// Don't pass props here - they'll be provided by the Slot component at runtime
// Using 'as any' because props are provided dynamically by the Slot system
NavbarUserMenuItems.plug(
  <ProfileMenuItem key="menu-profile" {...({} as any)} />,
  10
);
NavbarUserMenuItems.plug(
  <MyListsMenuItem key="menu-my-lists" {...({} as any)} />,
  20
);
NavbarUserMenuItems.plug(
  <BrowseListsMenuItem key="menu-browse-lists" {...({} as any)} />,
  30
);
NavbarUserMenuItems.plug(
  <DiscussionsMenuItem key="menu-discussions" {...({} as any)} />,
  40
);
NavbarUserMenuItems.plug(
  <NotificationsMenuItem key="menu-notifications" {...({} as any)} />,
  50
);
