import React from "react";
import { Dialog, Box, IconButton, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import {
  getResponsiveImageSrcSet,
  optimizeImageUrl,
} from "@/utils/cloudinary";

interface FullscreenImageDialogProps {
  open: boolean;
  imageUrl: string | null;
  isFeatured?: boolean;
  showFeaturedToggle?: boolean;
  onClose: () => void;
  onFeaturedToggle?: () => void;
}

const FullscreenImageDialog: React.FC<FullscreenImageDialogProps> = ({
  open,
  imageUrl,
  isFeatured = false,
  showFeaturedToggle = false,
  onClose,
  onFeaturedToggle,
}) => {
  const theme = useTheme();

  if (!imageUrl) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: "overlay.scrimSolid",
          boxShadow: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          color: "white",
          zIndex: 10,
          backgroundColor: "overlay.scrimMedium",
          "&:hover": { backgroundColor: "overlay.scrimStrong" },
        }}
      >
        <CloseIcon />
      </IconButton>
      {showFeaturedToggle && onFeaturedToggle && (
        <IconButton
          onClick={onFeaturedToggle}
          sx={{
            position: "absolute",
            top: 16,
            right: 72,
            color: isFeatured ? "secondary.main" : "white",
            zIndex: 10,
            backgroundColor: "overlay.scrimMedium",
            "&:hover": { backgroundColor: "overlay.scrimStrong" },
          }}
        >
          {isFeatured ? <StarIcon /> : <StarBorderIcon />}
        </IconButton>
      )}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
        }}
      >
        <img
          src={optimizeImageUrl(imageUrl, 2048)}
          srcSet={getResponsiveImageSrcSet(imageUrl, [1024, 1600, 2048])}
          sizes="90vw"
          alt="Full size sample"
          style={{
            maxWidth: "90vw",
            maxHeight: "80vh",
            borderRadius: 12,
            boxShadow: `0 0 32px 0 ${theme.palette.overlay.scrimHeavy}`,
            background: theme.palette.surface.sunken,
          }}
        />
      </Box>
    </Dialog>
  );
};

export default FullscreenImageDialog;
