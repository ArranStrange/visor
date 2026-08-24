import React from "react";
import { Box, Typography } from "@mui/material";
import SampleImageTile from "./SampleImageTile";

export interface SampleImageItem {
  key: string;
  url: string;
  alt: string;
  photoId?: string;
  isFeaturedPhoto?: boolean;
}

interface SampleImagesProps {
  images: SampleImageItem[];
  onImageClick: (url: string, imageId?: string, isFeatured?: boolean) => void;
  actionButton?: React.ReactNode;
  emptyMessage?: string;
}

const SampleImages: React.FC<SampleImagesProps> = ({
  images,
  onImageClick,
  actionButton,
  emptyMessage = "No sample images yet.",
}) => {
  const hasImages = images.length > 0;

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h6">Sample Images</Typography>
        {actionButton}
      </Box>
      {hasImages ? (
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
          {images.map((image) => (
            <SampleImageTile
              key={image.key}
              url={image.url}
              alt={image.alt}
              photoId={image.photoId}
              isFeaturedPhoto={image.isFeaturedPhoto}
              onImageClick={onImageClick}
            />
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {emptyMessage}
        </Typography>
      )}
    </Box>
  );
};

export default SampleImages;
