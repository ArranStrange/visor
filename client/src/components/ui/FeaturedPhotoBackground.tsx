import React from "react";
import { Box } from "@mui/material";
import { useQuery } from "@apollo/client";
import { GET_FEATURED_PHOTO } from "../../graphql/queries/getFeaturedPhoto";

const FeaturedPhotoBackground: React.FC = () => {
  const { data: featuredPhotoData } = useQuery(GET_FEATURED_PHOTO);
  const featuredPhoto = featuredPhotoData?.getFeaturedPhoto;

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
          backgroundImage: `url(${featuredPhoto.url})`,
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
              ? "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)"
              : "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.6) 100%)",
          zIndex: 1,
        },
      }}
    />
  );
};

export default FeaturedPhotoBackground;
