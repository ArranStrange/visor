import React from "react";
import { Box } from "@mui/material";
import { useQuery } from "@apollo/client";
import { GET_FEATURED_PHOTO } from "../../graphql/featured";
import { optimizeImageUrl } from "../../utils/cloudinary";

const FeaturedPhotoBackground: React.FC = () => {
  const { data: featuredPhotoData } = useQuery(GET_FEATURED_PHOTO);
  const featuredPhoto = featuredPhotoData?.getFeaturedPhoto;
  const backgroundImageUrl = optimizeImageUrl(featuredPhoto?.url, 2048);

  if (!featuredPhoto) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "90vh",
        zIndex: 0,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.4) blur(0px)",
          zIndex: 0,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: (t) =>
            t.palette.mode === "dark"
              ? `linear-gradient(180deg, ${t.palette.overlay.scrimMedium} 0%, ${t.palette.overlay.scrimHeavy} 100%)`
              : `linear-gradient(180deg, ${t.palette.overlay.whiteHover} 0%, ${t.palette.overlay.whiteSoft} 100%)`,
          zIndex: 1,
        },
      }}
    />
  );
};

export default FeaturedPhotoBackground;
