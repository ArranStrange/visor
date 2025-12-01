/**
 * Profile Page Default Plugins
 * 
 * This runtime file registers default Profile page sections.
 * Plugins can override or extend these by using different priorities.
 * 
 * Note: Profile routes are complex forms. This plugin structure allows
 * for future extensibility while maintaining current functionality.
 */

import React from "react";
import {
  ProfileHeader,
  ProfileTabs,
  ProfileTabPanels,
} from "lib/slots/slot-definitions";

// Profile slots are available for future plugin extensions
// Current implementation keeps existing functionality intact
// Plugins can be added here to extend profile pages

