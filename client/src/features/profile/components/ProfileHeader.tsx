import React from "react";
import { Avatar, Box, IconButton, Alert, CircularProgress } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

export interface ProfileHeaderProps {
  avatarUrl?: string;
  avatarAlt: string;
  avatarSize?: number | { xs: number; md: number };
  onAvatarChange?: (file: File) => void;
  avatarUploading?: boolean;
  avatarError?: string | null;
  children?: React.ReactNode;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  avatarUrl,
  avatarAlt,
  avatarSize = 150,
  onAvatarChange,
  avatarUploading = false,
  avatarError,
  children,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onAvatarChange?.(file);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Box position="relative">
        <Avatar
          src={avatarUrl}
          alt={avatarAlt}
          sx={{ width: avatarSize, height: avatarSize }}
        />
        {avatarUploading && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor="overlay.scrimStrong"
            borderRadius="50%"
          >
            <CircularProgress size={40} />
          </Box>
        )}
      </Box>

      {onAvatarChange && (
        <IconButton color="primary" component="label" disabled={avatarUploading}>
          <input hidden accept="image/*" type="file" onChange={handleFileChange} />
          <PhotoCameraIcon />
        </IconButton>
      )}

      {avatarError && (
        <Alert severity="error" sx={{ width: "100%", typography: "caption" }}>
          {avatarError}
        </Alert>
      )}

      {children}
    </Box>
  );
};

export default ProfileHeader;
