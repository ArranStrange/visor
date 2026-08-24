import React from "react";
import { Box, Typography } from "@mui/material";
import BeforeAfterSlider from "../media/BeforeAfterSlider";
import {
  getResponsiveImageSrcSet,
  optimizeImageUrl,
} from "../../utils/cloudinary";

interface PresetBeforeAfterProps {
  beforeImage?: string;
  afterImage?: string;
}

const PresetBeforeAfter: React.FC<PresetBeforeAfterProps> = ({
  beforeImage,
  afterImage,
}) => {
  const optimizedBeforeImage = optimizeImageUrl(beforeImage, 1600);
  const optimizedAfterImage = optimizeImageUrl(afterImage, 1600);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" mb={2}>
        Before & After
      </Typography>
      <BeforeAfterSlider
        beforeImage={optimizedBeforeImage}
        afterImage={optimizedAfterImage}
        beforeImageSrcSet={getResponsiveImageSrcSet(
          beforeImage,
          [800, 1200, 1600]
        )}
        afterImageSrcSet={getResponsiveImageSrcSet(
          afterImage,
          [800, 1200, 1600]
        )}
        sizes="(max-width: 900px) 100vw, 900px"
        loading="lazy"
        height={500}
      />
    </Box>
  );
};

export default PresetBeforeAfter;
