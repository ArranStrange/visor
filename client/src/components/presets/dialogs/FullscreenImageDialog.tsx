import React from "react";
import {
  Dialog,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

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
  if (!imageUrl) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: "rgba(0,0,0,0.95)",
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
          background: "rgba(0,0,0,0.3)",
          "&:hover": { background: "rgba(0,0,0,0.5)" },
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
            color: isFeatured ? "#FFD700" : "white",
            zIndex: 10,
            background: "rgba(0,0,0,0.3)",
            "&:hover": { background: "rgba(0,0,0,0.5)" },
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
          src={imageUrl}
          alt="Full size sample"
          style={{
            maxWidth: "90vw",
            maxHeight: "80vh",
            borderRadius: 12,
            boxShadow: "0 0 32px 0 rgba(0,0,0,0.7)",
            background: "#111",
          }}
        />
      </Box>
    </Dialog>
  );
};

export default FullscreenImageDialog;

