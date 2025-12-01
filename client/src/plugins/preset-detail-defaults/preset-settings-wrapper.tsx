import React from "react";
import { Box } from "@mui/material";
import XmpSettingsDisplay from "components/settings/XmpSettingsDisplay";
import { convertPresetSettingsToParsedSettings } from "utils/presetDetailUtils";

export function PresetSettingsWrapper({ preset }: any) {
  if (!preset.settings) return null;

  return (
    <Box
      sx={{
        borderRadius: 1,
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      <XmpSettingsDisplay
        settings={convertPresetSettingsToParsedSettings(
          preset.settings,
          preset
        )}
      />
    </Box>
  );
}

