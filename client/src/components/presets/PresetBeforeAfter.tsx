import React from "react";
import { Box, Typography } from "@mui/material";
import BeforeAfterSlider from "../media/BeforeAfterSlider";

interface Preset {
  beforeImage?: { url?: string };
  afterImage?: { url?: string };
}

interface PresetBeforeAfterProps {
  preset: Preset;
}

const PresetBeforeAfter: React.FC<PresetBeforeAfterProps> = ({ preset }) => {
  const beforeImage = preset.beforeImage?.url;
  const afterImage = preset.afterImage?.url;
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" mb={2}>
        Before & After
      </Typography>
      <BeforeAfterSlider
        beforeImage={beforeImage}
        afterImage={afterImage}
        height={500}
      />
    </Box>
  );
};

export default PresetBeforeAfter;
