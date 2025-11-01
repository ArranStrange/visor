import React from "react";
import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface SampleImage {
  id: string;
  url: string;
  caption?: string;
  isFeaturedPhoto?: boolean;
}

interface PresetSampleImagesProps {
  afterImage?: string;
  presetTitle: string;
  sampleImages?: SampleImage[];
  onImageClick: (url: string, imageId?: string, isFeatured?: boolean) => void;
  onAddPhotoClick?: () => void;
  showAddButton?: boolean;
}

const PresetSampleImages: React.FC<PresetSampleImagesProps> = ({
  afterImage,
  presetTitle,
  sampleImages = [],
  onImageClick,
  onAddPhotoClick,
  showAddButton = false,
}) => {
  const hasImages = afterImage || sampleImages.length > 0;

  if (!hasImages && !showAddButton) {
    return (
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No sample images yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h6">Sample Images</Typography>
        {showAddButton && onAddPhotoClick && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAddPhotoClick}
            size="small"
          >
            Add Your Photo
          </Button>
        )}
      </Box>
      {hasImages && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              md: "1fr 1fr",
              lg: "repeat(3, 1fr)",
            },
            gap: 2,
          }}
        >
          {afterImage && (
            <Box>
              <img
                src={afterImage}
                alt={`After applying ${presetTitle}`}
                style={{
                  width: "100%",
                  height: 200,
                  borderRadius: 12,
                  cursor: "pointer",
                  objectFit: "cover",
                }}
                onClick={() => onImageClick(afterImage)}
              />
            </Box>
          )}
          {sampleImages.map((image) => (
            <Box key={image.id}>
              <img
                src={image.url}
                alt={image.caption || `Sample image for ${presetTitle}`}
                style={{
                  width: "100%",
                  height: 200,
                  borderRadius: 12,
                  cursor: "pointer",
                  objectFit: "cover",
                }}
                onClick={() =>
                  onImageClick(image.url, image.id, image.isFeaturedPhoto)
                }
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PresetSampleImages;
