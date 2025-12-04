/**
 * FilmSim Detail Page Default Plugins
 *
 * This runtime file registers the default FilmSim detail page sections.
 * Plugins can override or extend these by using different priorities.
 */

import { Box, Divider } from "@mui/material";
import {
  FilmSimDetailToolbar,
  FilmSimDetailSection,
} from "lib/slots/slot-definitions";
import FilmSimHeader from "components/filmsims/FilmSimHeader";
import FilmSimOwnerMenu from "components/filmsims/FilmSimOwnerMenu";
import AddToListButton from "components/ui/AddToListButton";
import FilmSimDescription from "components/filmsims/FilmSimDescription";
import FilmSimCameraSettings from "components/forms/FilmSimCameraSettings";
import FilmSimSampleImages from "components/filmsims/FilmSimSampleImages";
import FilmSimCreatorNotes from "components/filmsims/FilmSimCreatorNotes";
import FilmSimRecommendedPresets from "components/filmsims/FilmSimRecommendedPresets";
import DiscussionThread from "components/discussions/DiscussionThread";

// Register default header and menu in toolbar
FilmSimDetailToolbar.plug(<FilmSimHeader key="filmsim-header" />, 10);

FilmSimDetailToolbar.plug(
  <FilmSimOwnerMenu key="filmsim-owner-menu" />,
  20
);

// Register default sections
FilmSimDetailSection.plug(
  <AddToListButton key="add-to-list-button" />,
  5
);

FilmSimDetailSection.plug(
  <FilmSimDescription key="filmsim-description" />,
  10
);

FilmSimDetailSection.plug(
  <Box key="divider-1" sx={{ my: 3 }}>
    <Divider />
  </Box>,
  15
);

FilmSimDetailSection.plug(
  <FilmSimCameraSettings key="filmsim-camera-settings" />,
  20
);

FilmSimDetailSection.plug(
  <Box key="divider-2" sx={{ my: 2 }}>
    <Divider />
  </Box>,
  25
);

FilmSimDetailSection.plug(
  <FilmSimSampleImages key="filmsim-sample-images" />,
  30
);

FilmSimDetailSection.plug(
  <FilmSimCreatorNotes key="filmsim-creator-notes" />,
  40
);

FilmSimDetailSection.plug(
  <FilmSimRecommendedPresets key="filmsim-recommended-presets" />,
  50
);

FilmSimDetailSection.plug(
  <Box key="divider-3" sx={{ my: 4 }}>
    <Divider />
  </Box>,
  55
);

FilmSimDetailSection.plug(
  <Box key="discussion-thread" mt={4}>
    <DiscussionThread />
  </Box>,
  60
);
