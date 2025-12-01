/**
 * Preset Detail Page Default Plugins
 * 
 * This runtime file registers the default Preset detail page sections.
 * Plugins can override or extend these by using different priorities.
 */

import React from "react";
import {
  PresetDetailToolbar,
  PresetDetailSection,
} from "lib/slots/slot-definitions";
import { PresetHeaderWrapper } from "./preset-header-wrapper";
import { PresetOwnerMenuWrapper } from "./preset-owner-menu-wrapper";
import { AddToListButtonWrapper } from "./add-to-list-button-wrapper";
import { PresetDescriptionWrapper } from "./preset-description-wrapper";
import { PresetBeforeAfterWrapper } from "./preset-before-after-wrapper";
import { PresetSettingsWrapper } from "./preset-settings-wrapper";
import { PresetSampleImagesWrapper } from "./preset-sample-images-wrapper";
import { PresetActionsWrapper } from "./preset-actions-wrapper";
import { PresetCreatorNotesWrapper } from "./preset-creator-notes-wrapper";
import { DiscussionThreadWrapper } from "./discussion-thread-wrapper";
import { DividerWrapper } from "./divider-wrapper";

// Register default header and menu in toolbar
PresetDetailToolbar.plug(
  <PresetHeaderWrapper key="preset-header" />,
  10
);

PresetDetailToolbar.plug(
  <PresetOwnerMenuWrapper key="preset-owner-menu" />,
  20
);

// Register default sections
PresetDetailSection.plug(
  <AddToListButtonWrapper key="add-to-list-button" />,
  5
);

PresetDetailSection.plug(
  <PresetDescriptionWrapper key="preset-description" />,
  10
);

PresetDetailSection.plug(
  <DividerWrapper key="divider-1" my={3} />,
  15
);

PresetDetailSection.plug(
  <PresetBeforeAfterWrapper key="preset-before-after" />,
  20
);

PresetDetailSection.plug(
  <PresetSettingsWrapper key="preset-settings" />,
  25
);

PresetDetailSection.plug(
  <DividerWrapper key="divider-2" my={3} />,
  30
);

PresetDetailSection.plug(
  <PresetSampleImagesWrapper key="preset-sample-images" />,
  35
);

PresetDetailSection.plug(
  <PresetActionsWrapper key="preset-actions" />,
  40
);

PresetDetailSection.plug(
  <PresetCreatorNotesWrapper key="preset-creator-notes" />,
  45
);

PresetDetailSection.plug(
  <DiscussionThreadWrapper key="discussion-thread" />,
  50
);

