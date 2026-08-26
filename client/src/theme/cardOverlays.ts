import { SxProps, Theme } from "@mui/material/styles";

export const overlayButtonStyles: SxProps<Theme> = {
  position: "absolute",
  top: (theme) => theme.spacing(1.5),
  right: (theme) => theme.spacing(1.5),
  zIndex: 10,
  opacity: 0,
  transition: "opacity 0.3s ease-in-out",
};

export const overlayAvatarStyles: SxProps<Theme> = {
  position: "absolute",
  top: (theme) => theme.spacing(1.5),
  left: (theme) => theme.spacing(1.5),
  zIndex: 2,
  opacity: 0,
  transition: "opacity 0.3s ease-in-out",
  cursor: "pointer",
};

export const overlayTitleContainerStyles: SxProps<Theme> = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  transition: "background-color 0.3s ease-in-out",
  p: 2,
};

export const overlayTagsContainerStyles: SxProps<Theme> = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  p: 1.5,
  background: (theme) => theme.palette.overlay.scrimRamp,
  opacity: 0,
  transition: "opacity 0.3s ease-in-out",
  display: "flex",
  flexWrap: "wrap",
  gap: 0.5,
  justifyContent: "flex-start",
};

// Card hover styles
export const getCardHoverStyles = (showOptions: boolean) => ({
  "&:hover .tags-overlay": {
    opacity: 1,
  },
  // No darkening on hover — the creator avatar and slider animation
  // already signal the hover state, and dimming fights the photo.
  "&:hover .creator-avatar": {
    opacity: 1,
  },
  "&:hover .add-to-list-button": {
    opacity: 1,
  },
  "@media (hover: none)": {
    "& .tags-overlay": {
      opacity: showOptions ? 1 : 0,
    },
    "& .creator-avatar": {
      opacity: showOptions ? 1 : 0,
    },
    "& .add-to-list-button": {
      opacity: showOptions ? 1 : 0,
    },
  },
});
