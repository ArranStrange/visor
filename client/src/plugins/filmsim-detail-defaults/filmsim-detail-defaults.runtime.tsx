/**
 * FilmSim Detail Page Default Plugins
 *
 * This runtime file registers the default FilmSim detail page sections.
 * Plugins can override or extend these by using different priorities.
 */

import {
  FilmSimDetailToolbar,
  FilmSimDetailSection,
} from "lib/slots/slot-definitions";
import { FilmSimHeaderWrapper } from "./filmsim-header-wrapper";
import { FilmSimOwnerMenuWrapper } from "./filmsim-owner-menu-wrapper";
import { AddToListButtonWrapper } from "./add-to-list-button-wrapper";
import { FilmSimDescriptionWrapper } from "./filmsim-description-wrapper";
import { FilmSimCameraSettingsWrapper } from "./filmsim-camera-settings-wrapper";
import { FilmSimSampleImagesWrapper } from "./filmsim-sample-images-wrapper";
import { FilmSimCreatorNotesWrapper } from "./filmsim-creator-notes-wrapper";
import { FilmSimRecommendedPresetsWrapper } from "./filmsim-recommended-presets-wrapper";
import { DiscussionThreadWrapper } from "./discussion-thread-wrapper";
import { DividerWrapper } from "./divider-wrapper";

// Register default header and menu in toolbar
FilmSimDetailToolbar.plug(<FilmSimHeaderWrapper key="filmsim-header" />, 10);

FilmSimDetailToolbar.plug(
  <FilmSimOwnerMenuWrapper key="filmsim-owner-menu" />,
  20
);

// Register default sections
FilmSimDetailSection.plug(
  <AddToListButtonWrapper key="add-to-list-button" />,
  5
);

FilmSimDetailSection.plug(
  <FilmSimDescriptionWrapper key="filmsim-description" />,
  10
);

FilmSimDetailSection.plug(<DividerWrapper key="divider-1" my={3} />, 15);

FilmSimDetailSection.plug(
  <FilmSimCameraSettingsWrapper key="filmsim-camera-settings" />,
  20
);

FilmSimDetailSection.plug(<DividerWrapper key="divider-2" my={2} />, 25);

FilmSimDetailSection.plug(
  <FilmSimSampleImagesWrapper key="filmsim-sample-images" />,
  30
);

FilmSimDetailSection.plug(
  <FilmSimCreatorNotesWrapper key="filmsim-creator-notes" />,
  40
);

FilmSimDetailSection.plug(
  <FilmSimRecommendedPresetsWrapper key="filmsim-recommended-presets" />,
  50
);

FilmSimDetailSection.plug(<DividerWrapper key="divider-3" my={4} />, 55);

FilmSimDetailSection.plug(
  <DiscussionThreadWrapper key="discussion-thread" />,
  60
);
