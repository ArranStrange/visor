/**
 * Preset Detail Page Default Plugins
 * 
 * This runtime file registers the default Preset detail page sections.
 * Plugins can override or extend these by using different priorities.
 */

import React from "react";
import { Divider, Box } from "@mui/material";
import {
  PresetDetailToolbar,
  PresetDetailSection,
} from "lib/slots/slot-definitions";
import PresetHeader from "components/presets/PresetHeader";
import PresetOwnerMenu from "components/presets/PresetOwnerMenu";
import AddToListButton from "components/ui/AddToListButton";
import PresetDescription from "components/presets/PresetDescription";
import PresetBeforeAfter from "components/presets/PresetBeforeAfter";
import XmpSettingsDisplay from "components/settings/XmpSettingsDisplay";
import PresetSampleImages from "components/presets/PresetSampleImages";
import PresetActions from "components/presets/PresetActions";
import PresetCreatorNotes from "components/presets/PresetCreatorNotes";
import DiscussionThread from "components/discussions/DiscussionThread";

// Register default header and menu in toolbar
PresetDetailToolbar.plug(
  <PresetHeader key="preset-header" />,
  10
);

PresetDetailToolbar.plug(
  <PresetOwnerMenu key="preset-owner-menu" />,
  20
);

// Register default sections
PresetDetailSection.plug(
  <AddToListButton key="add-to-list-button" />,
  5
);

PresetDetailSection.plug(
  <PresetDescription key="preset-description" />,
  10
);

PresetDetailSection.plug(
  <Box key="divider-1" sx={{ my: 3 }}>
    <Divider />
  </Box>,
  15
);

PresetDetailSection.plug(
  <PresetBeforeAfter key="preset-before-after" />,
  20
);

PresetDetailSection.plug(
  <XmpSettingsDisplay key="preset-settings" />,
  25
);

PresetDetailSection.plug(
  <Box key="divider-2" sx={{ my: 3 }}>
    <Divider />
  </Box>,
  30
);

PresetDetailSection.plug(
  <PresetSampleImages key="preset-sample-images" />,
  35
);

PresetDetailSection.plug(
  <PresetActions key="preset-actions" />,
  40
);

PresetDetailSection.plug(
  <PresetCreatorNotes key="preset-creator-notes" />,
  45
);

PresetDetailSection.plug(
  <Box key="discussion-thread" mt={4}>
    <DiscussionThread />
  </Box>,
  50
);

