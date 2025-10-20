import React from "react";
import { Box, Typography, Avatar, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_FEATURED_ITEMS } from "../../graphql/queries/getFeaturedItems";

const squareImageStyles = {
  width: "100%",
  aspectRatio: "1 / 1",
  borderRadius: 2,
  overflow: "hidden",
  boxShadow: 3,
};

const FeaturedListHero: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading } = useQuery(GET_FEATURED_ITEMS);

  if (loading) return null;

  const list = data?.featuredUserLists?.[0];
  if (!list) return null;

  const images: string[] = [
    ...(list.presets || []).map((p: any) => p?.afterImage?.url).filter(Boolean),
    ...(list.filmSims || [])
      .map((f: any) => f?.sampleImages?.[0]?.url)
      .filter(Boolean),
  ].slice(0, 3);

  const tiles: Array<{ type: "image"; src: string } | { type: "info" }> = [
    ...images.map((src: string) => ({ type: "image" as const, src })),
  ];

  tiles.splice(Math.min(1, tiles.length), 0, { type: "info" });

  return (
    <Box sx={{ py: { xs: 3, md: 6 } }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 } }}>
        {/* Horizontal image scroller */}
        <Box
          sx={{
            display: { xs: "grid", md: "flex" },
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "unset" },
            gap: { xs: 1.25, sm: 1.5, md: 2 },
            justifyContent: { md: "center" },
            overflowX: { xs: "visible", md: "auto" },
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            pb: 1,
            mb: { xs: 2, md: 3 },
            width: { xs: "100%", md: "90vw" },
            mx: "auto",
          }}
        >
          {tiles.map((tile, idx) => {
            const commonSx = {
              flex: { xs: "0 0 auto", sm: "0 0 200px", md: "0 0 240px" },
              ...squareImageStyles,
            } as const;

            if (tile.type === "image") {
              return (
                <Box
                  key={`featured-tile-img-${idx}`}
                  sx={{ ...commonSx, boxShadow: 2 }}
                >
                  <img
                    src={tile.src}
                    alt={`${list.name} ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              );
            }

            // Info tile
            return (
              <Box
                key={`featured-tile-info-${idx}`}
                sx={{
                  ...commonSx,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  p: 2,
                  boxShadow: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    src={list.owner?.avatar}
                    alt={list.owner?.username}
                    sx={{ width: 28, height: 28, cursor: "pointer" }}
                    onClick={() => navigate(`/profile/${list.owner?.id}`)}
                  >
                    {list.owner?.username?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    Featured List
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 900, mb: 0.5, lineHeight: 1.15 }}
                    noWrap
                    title={list.name}
                  >
                    {list.name}
                  </Typography>
                  {list.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: (t) => t.palette.text.secondary,
                        display: "-webkit-box",
                        WebkitLineClamp: 3 as any,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {list.description}
                    </Typography>
                  )}
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => navigate(`/list/${list.id}`)}
                >
                  View List
                </Button>
              </Box>
            );
          })}
        </Box>

        {/* Text block removed; info shown inline within the scroller */}
      </Container>
    </Box>
  );
};

export default FeaturedListHero;
