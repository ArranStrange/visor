import React from "react";
import { Box, Typography, Chip, Stack, Avatar, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_FEATURED_ITEMS } from "../../graphql/queries/getFeaturedItems";

interface FeaturedItem {
  id: string;
  title?: string;
  name?: string;
  slug: string;
  description: string;
  notes: string;
  afterImage?: { url: string };
  sampleImages?: { url: string }[];
  tags: { id: string; displayName: string }[];
  creator: {
    id: string;
    username: string;
    avatar?: string;
  };
}

const FeaturedSection: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading } = useQuery(GET_FEATURED_ITEMS);

  if (loading || (!data?.featuredPreset?.[0] && !data?.featuredFilmSim?.[0])) {
    return null; // Don't show anything if loading or no featured items
  }

  const featuredPreset: FeaturedItem | null = data?.featuredPreset?.[0] || null;
  const featuredFilmSim: FeaturedItem | null =
    data?.featuredFilmSim?.[0] || null;

  const renderFeaturedItem = (
    item: FeaturedItem,
    type: "preset" | "filmsim"
  ) => {
    const imageUrl =
      type === "preset" ? item.afterImage?.url : item.sampleImages?.[0]?.url;
    const title = type === "preset" ? item.title : item.name;
    const itemType = type === "preset" ? "Preset" : "Film Simulation";

    return (
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 3,
          cursor: "pointer",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: 6,
          },
          mb: 4,
        }}
        onClick={() => navigate(`/${type}/${item.slug}`)}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            minHeight: { xs: "auto", md: 400 },
          }}
        >
          {/* Image Section */}
          <Box
            sx={{
              flex: { xs: "none", md: "0 0 50%" },
              height: { xs: 300, md: "auto" },
              position: "relative",
              overflow: "hidden",
            }}
          >
            {imageUrl && (
              <img
                src={imageUrl}
                alt={title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}
            <Box
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(10px)",
                px: 2,
                py: 0.5,
                borderRadius: 2,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "#FFD700",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                ★ Featured {itemType}
              </Typography>
            </Box>
          </Box>

          {/* Content Section */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 3, md: 4 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {/* Title */}
            <Typography
              variant="h3"
              fontWeight="bold"
              gutterBottom
              sx={{
                fontSize: { xs: "1.75rem", md: "2.5rem" },
                mb: 2,
              }}
            >
              {title}
            </Typography>

            {/* Description */}
            {item.description && (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 2, lineHeight: 1.7 }}
              >
                {item.description}
              </Typography>
            )}

            {/* Creator's Notes */}
            {item.notes && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                  }}
                >
                  Creator's Notes
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontStyle: "italic",
                    lineHeight: 1.6,
                    pl: 2,
                    borderLeft: "3px solid",
                    borderColor: "primary.main",
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
                {item.tags.map((tag) => (
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
                      "&:hover": {
                        backgroundColor: "primary.main",
                        color: "white",
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
                pt: 2,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${item.creator.id}`);
              }}
            >
              <Avatar
                src={item.creator.avatar}
                alt={item.creator.username}
                sx={{ width: 48, height: 48 }}
              >
                {item.creator.username.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Created by
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {item.creator.username}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ mb: 6 }}>
      {featuredPreset && renderFeaturedItem(featuredPreset, "preset")}
      {featuredFilmSim && renderFeaturedItem(featuredFilmSim, "filmsim")}
    </Box>
  );
};

export default FeaturedSection;
