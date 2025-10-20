import React from "react";
import { Box, Typography, Chip, Stack, Avatar, Container } from "@mui/material";
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
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          pb: 4,
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

        {/* Main Content */}
        <Box sx={{ maxWidth: "70%" }}>
          {/* Title */}
          <Typography
            variant="h2"
            fontWeight="bold"
            sx={{
              color: "white",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" },
              mb: 2,
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            {title}
          </Typography>

          {/* Description */}
          {item.description && (
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255, 255, 255, 0.9)",
                mb: 3,
                lineHeight: 1.6,
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                maxWidth: "80%",
              }}
            >
              {item.description}
            </Typography>
          )}

          {/* Creator's Notes */}
          {item.notes && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  mb: 1,
                }}
              >
                Creator's Notes
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontStyle: "italic",
                  lineHeight: 1.6,
                  pl: 2,
                  borderLeft: "3px solid #FFD700",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                {item.notes}
              </Typography>
            </Box>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}
            >
              {item.tags.slice(0, 4).map((tag) => (
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

          {/* Creator */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
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
                width: 56,
                height: 56,
                border: "2px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              {item.creator.username.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  display: "block",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                Created by
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                {item.creator.username}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturedHeroSection;
