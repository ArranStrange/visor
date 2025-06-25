import React from "react";
import { Card, Typography, Box, Chip, Stack } from "@mui/material";

interface BuyMeACoffeeCardProps {
  id?: string;
}

const BuyMeACoffeeCard: React.FC<BuyMeACoffeeCardProps> = ({ id }) => {
  const [showOptions, setShowOptions] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  // Check if we're on mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(hover: none)").matches);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleClick = () => {
    if (isMobile) {
      // On mobile: first click shows options, second click opens link
      if (!showOptions) {
        setShowOptions(true);
      } else {
        window.open("https://buymeacoffee.com/arranstrange", "_blank");
      }
    } else {
      // On desktop: direct link opening
      window.open("https://buymeacoffee.com/arranstrange", "_blank");
    }
  };

  // Hide options when clicking outside (desktop only)
  React.useEffect(() => {
    if (!isMobile && showOptions) {
      const timer = setTimeout(() => {
        setShowOptions(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showOptions, isMobile]);

  return (
    <Card
      sx={{
        position: "relative",
        aspectRatio: "5/4",
        borderRadius: 1,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s ease-in-out, boxShadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
        },
        "&:hover .tags-container": {
          opacity: 1,
        },
        "@media (hover: none)": {
          "& .tags-container": {
            opacity: showOptions ? 1 : 0,
          },
        },
      }}
      onClick={handleClick}
    >
      <img
        src="https://res.cloudinary.com/dw6klz9kg/image/upload/v1750860074/2025-04-19_10-56-48_000_eemmrr.jpg"
        alt="Buy Me a Coffee"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Title Container - Centered like FilmSimCard */}
      <Box
        className="title-container"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          p: 2,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            color: "rgba(255, 255, 255, 0.9)",
            textShadow: "2px 2px 8px rgba(0,0,0,0.7)",
            lineHeight: 1.2,
          }}
        >
          Buy Me a Coffee
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            textShadow: "1px 1px 4px rgba(0,0,0,0.7)",
            lineHeight: 1.2,
          }}
        >
          Support the site
        </Typography>
      </Box>

      {/* Tags Container - At bottom like FilmSimCard */}
      <Box
        className="tags-container"
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          p: 2,
          opacity: 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        <Stack
          direction="row"
          gap={1}
          flexWrap="wrap"
          justifyContent="flex-start"
        >
          <Chip
            label="Support"
            size="small"
            sx={{
              color: "white",
              backgroundColor: "black",
              border: "none",
              cursor: "pointer",
              "& .MuiChip-label": {
                color: "white",
              },
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          />
          <Chip
            label="Coffee"
            size="small"
            sx={{
              color: "white",
              backgroundColor: "black",
              border: "none",
              cursor: "pointer",
              "& .MuiChip-label": {
                color: "white",
              },
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          />
        </Stack>
      </Box>
    </Card>
  );
};

export default BuyMeACoffeeCard;
