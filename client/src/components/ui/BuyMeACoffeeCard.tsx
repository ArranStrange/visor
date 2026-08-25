import React, { useEffect } from "react";
import { Card, Typography, Box, Chip, Stack } from "@mui/material";
import { useMobileDetection } from "../../hooks/useMobileDetection";

interface BuyMeACoffeeCardProps {
  id?: string;
}

const BuyMeACoffeeCard: React.FC<BuyMeACoffeeCardProps> = () => {
  const [showOptions, setShowOptions] = React.useState(false);
  const isMobile = useMobileDetection();

  const handleClick = () => {
    if (isMobile) {
      if (!showOptions) {
        setShowOptions(true);
      } else {
        window.open("https://buymeacoffee.com/arranstrange", "_blank");
      }
    } else {
      window.open("https://buymeacoffee.com/arranstrange", "_blank");
    }
  };

  useEffect(() => {
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
          boxShadow: (theme) =>
            `0 8px 25px ${theme.palette.overlay.scrimSubtle}`,
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
        src="https://res.cloudinary.com/dw6klz9kg/image/upload/f_auto,q_auto,c_limit,w_800/v1750860074/2025-04-19_10-56-48_000_eemmrr.jpg"
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
          backgroundColor: "overlay.scrimMedium",
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            color: "overlay.white",
            textShadow: (theme) =>
              `2px 2px 8px ${theme.palette.overlay.scrimHeavy}`,
            lineHeight: 1.2,
          }}
        >
          Buy Me a Coffee
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "overlay.whiteSoft",
            textShadow: (theme) =>
              `1px 1px 4px ${theme.palette.overlay.scrimHeavy}`,
            lineHeight: 1.2,
          }}
        >
          Support the site
        </Typography>
      </Box>

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
                backgroundColor: "overlay.whiteHover",
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
                backgroundColor: "overlay.whiteHover",
              },
            }}
          />
        </Stack>
      </Box>
    </Card>
  );
};

export default BuyMeACoffeeCard;
