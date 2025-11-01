import React from "react";
import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

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
  const hasImages = sampleImages.length > 0;

  return (
    <Box mt={4}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={1}
      >
        <Typography variant="h6">Sample Images</Typography>
        {showAddButton && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            size="small"
            disabled={true}
            title="Photo upload feature coming soon"
          >
            Add Photo
          </Button>
        )}
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
          {sampleImages.map((image) => (
            <Box key={image.id}>
              <img
                src={image.url}
                alt={image.caption || `Sample image for ${filmSimName}`}
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
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No sample images yet.
        </Typography>
      )}
    </Box>
  );
};

export default FilmSimSampleImages;
