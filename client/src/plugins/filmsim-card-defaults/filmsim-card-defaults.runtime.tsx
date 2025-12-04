/**
 * FilmSim Card Default Plugins
 * 
 * This runtime file registers the default FilmSim card actions.
 * Plugins can override or extend these by using different priorities.
 */

import React from "react";
import { FilmSimCardOverlay } from "lib/slots/slot-definitions";
import { AddToListButton } from "./components/add-to-list-button";

// Register default "Add to List" button
FilmSimCardOverlay.plug(
  <AddToListButton key="add-to-list-button" />,
  10
);

