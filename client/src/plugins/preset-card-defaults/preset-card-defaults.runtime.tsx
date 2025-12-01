/**
 * Preset Card Default Plugins
 * 
 * This runtime file registers the default Preset card actions.
 * Plugins can override or extend these by using different priorities.
 */

import React from "react";
import { PresetCardOverlay } from "lib/slots/slot-definitions";
import { AddToListButton } from "./add-to-list-button";

// Register default "Add to List" button
PresetCardOverlay.plug(
  <AddToListButton key="add-to-list-button" />,
  10
);

