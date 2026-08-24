import React from "react";
import { Box, Container, InputBase, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_ALL_TAGS, GET_ALL_TAGS_OPTIONS } from "../../graphql/tags";
import { GET_FEATURED_PHOTO } from "../../graphql/featured";

const SearchHero: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState("");
  const logoUrl = new URL("../../assets/VISOR.png", import.meta.url).href;

  const { data: tagData } = useQuery(GET_ALL_TAGS, GET_ALL_TAGS_OPTIONS);
  const allTags =
    tagData?.listTags?.filter((tag: any) => tag?.displayName) || [];

  const { data: featuredPhotoData } = useQuery(GET_FEATURED_PHOTO);
  const featuredPhoto = featuredPhotoData?.getFeaturedPhoto;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length === 0) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
      <Stack alignItems="center" spacing={4}>
        <Box
          component="img"
          src={logoUrl}
          alt="VISOR logo"
          sx={{
            height: { xs: 33, md: 44 },
            filter: (theme) =>
              featuredPhoto
                ? `drop-shadow(0 2px 8px ${theme.palette.overlay.scrimStrong})`
                : "none",
          }}
        />
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <InputBase
            placeholder="Search VISOR..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth={false}
            sx={{
              px: 2.5,
              py: 2,
              borderRadius: 6,
              backgroundColor: featuredPhoto
                ? "overlay.scrimStrong"
                : "action.hover",
              backdropFilter: featuredPhoto ? "blur(10px)" : "none",
              color: featuredPhoto ? "overlay.white" : "inherit",
              fontSize: { xs: "1rem", md: "1.05rem" },
              width: { xs: "100%", sm: "80%", md: 600 },
              height: { xs: 44, md: 50 },
              "& ::placeholder": {
                color: featuredPhoto ? "overlay.whiteSoft" : "inherit",
                opacity: 1,
              },
            }}
          />
        </Box>

        {/* Tag shortcuts */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            width: { xs: "100%", sm: "80%", md: 600 },
            mx: "auto",
          }}
        >
          <Typography
            onClick={() => navigate("/search")}
            sx={{
              cursor: "pointer",
              opacity: 0.8,
              transition: "opacity 0.2s",
              whiteSpace: "nowrap",
              flexShrink: 0,
              color: featuredPhoto ? "overlay.white" : "inherit",
              textShadow: (theme) =>
                featuredPhoto
                  ? `0 1px 3px ${theme.palette.overlay.scrimStrong}`
                  : "none",
              "&:hover": {
                textDecoration: "underline",
                textUnderlineOffset: "4px",
              },
            }}
          >
            all
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            sx={{
              overflowX: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              flex: 1,
              scrollSnapType: "x mandatory",
              "& > *": { scrollSnapAlign: "start" },
            }}
          >
            {allTags.map((tag: any) => (
              <Typography
                key={tag.id}
                onClick={() =>
                  navigate(`/search?tag=${encodeURIComponent(tag.displayName)}`)
                }
                sx={{
                  cursor: "pointer",
                  opacity: 0.8,
                  transition: "opacity 0.2s",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  textTransform: "lowercase",
                  color: featuredPhoto ? "overlay.white" : "inherit",
                  textShadow: (theme) =>
                    featuredPhoto
                      ? `0 1px 3px ${theme.palette.overlay.scrimStrong}`
                      : "none",
                }}
              >
                {tag.displayName.toLowerCase()}
              </Typography>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default SearchHero;
