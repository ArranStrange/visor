import React from "react";
import { Box, Typography } from "@mui/material";
import BeforeAfterSlider from "../media/BeforeAfterSlider";

interface PresetBeforeAfterProps {
  beforeImage?: string;
  afterImage?: string;
}

const PresetBeforeAfter: React.FC<PresetBeforeAfterProps> = ({
  beforeImage,
  afterImage,
}) => {
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
