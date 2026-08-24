import React from "react";
import { Box } from "@mui/material";

interface SampleImageTileProps {
  url: string;
  alt: string;
  photoId?: string;
  isFeaturedPhoto?: boolean;
  onImageClick: (url: string, imageId?: string, isFeatured?: boolean) => void;
}

const SampleImageTile: React.FC<SampleImageTileProps> = ({
  url,
  alt,
  photoId,
  isFeaturedPhoto,
  onImageClick,
}) => {
  return (
    <Box>
      <img
        src={url}
        alt={alt}
        style={{
          width: "100%",
          height: 200,
          borderRadius: 12,
          cursor: "pointer",
          objectFit: "cover",
        }}
        onClick={() => onImageClick(url, photoId, isFeaturedPhoto)}
      />
    </Box>
  );
};

export default SampleImageTile;
