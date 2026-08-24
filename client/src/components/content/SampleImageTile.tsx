import React from "react";
import { Box } from "@mui/material";
import {
  getResponsiveImageSrcSet,
  optimizeImageUrl,
} from "../../utils/cloudinary";

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
        src={optimizeImageUrl(url, 800)}
        srcSet={getResponsiveImageSrcSet(url, [300, 600, 800])}
        sizes="(max-width: 900px) 50vw, 33vw"
        loading="lazy"
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
