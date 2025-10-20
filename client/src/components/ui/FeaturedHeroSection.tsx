import React from "react";
import { Box, Typography, Chip, Stack, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_FEATURED_ITEMS } from "../../graphql/queries/getFeaturedItems";

interface FeaturedHeroSectionProps {
  type: "preset" | "filmsim";
}

const FeaturedHeroSection: React.FC<FeaturedHeroSectionProps> = ({ type }) => {
  const navigate = useNavigate();
  const { data, loading } = useQuery(GET_FEATURED_ITEMS);

  if (loading) {
    return null;
  }

  const featuredItems =
    type === "preset" ? data?.featuredPreset : data?.featuredFilmSim;
  const item = featuredItems?.[0]; // Get the first featured item of this type

  if (!item) {
    return null; // Don't render if no featured item of this type
  }

  const imageUrl =
    type === "preset" ? item.afterImage?.url : item.sampleImages?.[0]?.url;
  const title = type === "preset" ? item.title : item.name;
  const itemType = type === "preset" ? "Preset" : "Film Simulation";

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: 400, sm: 500, md: 600 },
        overflow: "hidden",
        cursor: "pointer",
        mb: 4,
      }}
      onClick={() => navigate(`/${type}/${item.slug}`)}
    >
      {/* Background Image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      )}

      {/* Dark Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      {/* Content Overlay */}
      <Box
        sx={{
          position: "relative",
          height: "100%",
          width: "100%",
          zIndex: 2,
        }}
      >
        {/* Featured Badge */}
        <Box
          sx={{
            position: "absolute",
            top: 24,
            left: 24,
            backgroundColor: "rgba(255, 215, 0, 0.9)",
            backdropFilter: "blur(10px)",
            px: 2,
            py: 1,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "black",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            ★ Featured {itemType}
          </Typography>
        </Box>

        {/* User Profile Icon - Top Right */}
        <Box
          sx={{
            position: "absolute",
            top: 24,
            right: 24,
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${item.creator.id}`);
          }}
        >
          <Avatar
            src={item.creator.avatar}
            alt={item.creator.username}
            sx={{
              width: 48,
              height: 48,
              border: "2px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            {item.creator.username.charAt(0).toUpperCase()}
          </Avatar>
        </Box>

        {/* Title - Center */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            width: "100%",
            px: 4,
          }}
        >
          <Typography
            variant="h2"
            fontWeight="bold"
            sx={{
              color: "white",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" },
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Bottom Content */}
        <Box
          sx={{
            position: "absolute",
            bottom: 24,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            px: 4,
          }}
        >
          {/* Description - Bottom Left */}
          {item.description && (
            <Box sx={{ maxWidth: "50%" }}>
              <Typography
                variant="h6"
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  lineHeight: 1.6,
                  textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {item.description}
              </Typography>
            </Box>
          )}

          {/* Tags - Bottom Right */}
          {item.tags && item.tags.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: "wrap", gap: 1, justifyContent: "flex-end" }}
            >
              {item.tags.slice(0, 3).map((tag: any) => (
                <Chip
                  key={tag.id}
                  label={tag.displayName}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `/search?tag=${encodeURIComponent(
                        tag.displayName.toLowerCase()
                      )}`
                    );
                  }}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    backdropFilter: "blur(10px)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                    },
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default FeaturedHeroSection;
