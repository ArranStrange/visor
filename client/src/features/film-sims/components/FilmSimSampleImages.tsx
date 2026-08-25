import React from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SampleImages, { SampleImageItem } from "@/components/content/SampleImages";

interface SampleImage {
  id: string;
  url: string;
  caption?: string;
  isFeaturedPhoto?: boolean;
}

interface FilmSimSampleImagesProps {
  filmSimName: string;
  sampleImages?: SampleImage[];
  onImageClick: (url: string, imageId?: string, isFeatured?: boolean) => void;
  showAddButton?: boolean;
}

const FilmSimSampleImages: React.FC<FilmSimSampleImagesProps> = ({
  filmSimName,
  sampleImages = [],
  onImageClick,
  showAddButton = false,
}) => {
  const images: SampleImageItem[] = sampleImages.map((image) => ({
    key: image.id,
    url: image.url,
    alt: image.caption || `Sample image for ${filmSimName}`,
    photoId: image.id,
    isFeaturedPhoto: image.isFeaturedPhoto,
  }));

  return (
    <SampleImages
      images={images}
      onImageClick={onImageClick}
      actionButton={
        showAddButton ? (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            size="small"
            disabled={true}
            title="Photo upload feature coming soon"
          >
            Add Photo
          </Button>
        ) : undefined
      }
    />
  );
};

export default FilmSimSampleImages;
