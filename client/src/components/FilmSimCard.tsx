import React from "react";
import {
  Card,
  Typography,
  Box,
  Chip,
  Stack,
  Avatar,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import AddToListDialog from "./AddToListDialog";
import FastImage from "./FastImage";

interface FilmSimCardProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  tags?: Array<{
    id?: string;
    displayName: string;
  }>;
  creator?: {
    username: string;
    avatar?: string;
    id?: string;
  };
  settings?: {
    dynamicRange?: string;
    highlight?: string;
    shadow?: string;
    colour?: string;
    sharpness?: string;
    noiseReduction?: string;
    grainEffect?: string;
    clarity?: string;
    whiteBalance?: string;
    wbShift?: {
      r: number;
      b: number;
    };
  };
}

const FilmSimCard: React.FC<FilmSimCardProps> = ({
  id,
  name,
  slug,
  thumbnail,
  tags = [],
  creator,
}) => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = React.useState(false);
  const [addToListOpen, setAddToListOpen] = React.useState(false);
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
    if (!addToListOpen) {
      if (isMobile) {
        // On mobile: first click shows options, second click navigates
        if (!showOptions) {
          setShowOptions(true);
        } else {
          navigate(`/filmsim/${slug}`);
        }
      } else {
        // On desktop: direct navigation
        navigate(`/filmsim/${slug}`);
      }
    }
  };

  const handleAddToList = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAddToListOpen(true);
  };

  const handleCloseDialog = () => {
    setAddToListOpen(false);
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
        aspectRatio: "2/3",
        borderRadius: 1,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s ease-in-out, boxShadow 0.2s ease-in-out",
        "&:hover .tags-container": {
          opacity: 1,
        },
        "&:hover .creator-avatar": {
          opacity: 1,
        },
        "&:hover .add-to-list-button": {
          opacity: 1,
        },
        // Mobile: show options when showOptions is true
        "@media (hover: none)": {
          "& .tags-container": {
            opacity: showOptions ? 1 : 0,
          },
          "& .creator-avatar": {
            opacity: showOptions ? 1 : 0,
          },
          "& .add-to-list-button": {
            opacity: showOptions ? 1 : 0,
          },
        },
      }}
      onClick={handleClick}
    >
      <FastImage
        src={thumbnail || "/placeholder-image.jpg"}
        alt={name}
        aspectRatio="2:3"
        onLoad={() => setLoaded(true)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Add to List Button */}
      <Box
        className="add-to-list-button"
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 10,
          opacity: 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        <IconButton
          onClick={handleAddToList}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            width: 32,
            height: 32,
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.9)",
            },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Creator Avatar */}
      {creator && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 2,
            opacity: 0,
            transition: "opacity 0.3s ease-in-out",
            cursor: "pointer",
          }}
          className="creator-avatar"
          onClick={(e) => {
            e.stopPropagation();
            if (creator.id) {
              navigate(`/profile/${creator.id}`);
            }
          }}
        >
          <Avatar
            src={creator.avatar}
            alt={creator.username}
            sx={{
              width: 32,
              height: 32,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
            }}
          >
            {creator.username.charAt(0).toUpperCase()}
          </Avatar>
        </Box>
      )}

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
            color: "rgba(255, 255, 255, 0.5)",
            textShadow: "2px 2px 8px rgba(0,0,0,0.7)",
            lineHeight: 1.2,
            transition: "color 0.8s ease-in-out",
          }}
        >
          {name}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.5)",
            textShadow: "1px 1px 4px rgba(0,0,0,0.7)",
            lineHeight: 1.2,
            transition: "color 0.8s ease-in-out",
          }}
        >
          Film Sim
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
          {(tags ?? [])
            .slice(0, 3)
            .reverse()
            .map((tag, index) => (
              <Chip
                key={`${id}-tag-${index}-${tag.id ?? tag.displayName}`}
                label={tag.displayName}
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
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(
                    `/search?tag=${encodeURIComponent(tag.displayName)}`
                  );
                }}
              />
            ))}
        </Stack>
      </Box>

      <AddToListDialog
        open={addToListOpen}
        onClose={handleCloseDialog}
        filmSimId={id}
        itemName={name}
      />
    </Card>
  );
};

export default FilmSimCard;
