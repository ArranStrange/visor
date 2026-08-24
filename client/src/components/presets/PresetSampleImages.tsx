import React from "react";
import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SampleImages, { SampleImageItem } from "../content/SampleImages";

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
  const hasImages = !!afterImage || sampleImages.length > 0;

  if (!hasImages && !showAddButton) {
    return (
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No sample images yet.
        </Typography>
      </Box>
    );
  }

  const images: SampleImageItem[] = [
    ...(afterImage
      ? [
          {
            key: "after-image",
            url: afterImage,
            alt: `After applying ${presetTitle}`,
          },
        ]
      : []),
    ...sampleImages.map((image) => ({
      key: image.id,
      url: image.url,
      alt: image.caption || `Sample image for ${presetTitle}`,
      photoId: image.id,
      isFeaturedPhoto: image.isFeaturedPhoto,
    })),
  ];

  return (
    <SampleImages
      images={images}
      onImageClick={onImageClick}
      actionButton={
        showAddButton && onAddPhotoClick ? (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAddPhotoClick}
            size="small"
          >
            Add Your Photo
          </Button>
        ) : undefined
      }
    />
  );
};

export default PresetSampleImages;
