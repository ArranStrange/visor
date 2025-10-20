import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_FEATURED_ITEMS } from "../../graphql/queries/getFeaturedItems";

interface FeaturedHeroSectionProps {
  type: "preset" | "filmsim";
}

const FeaturedHeroSection: React.FC<FeaturedHeroSectionProps> = ({ type }) => {
  const navigate = useNavigate();
  const { data, loading } = useQuery(GET_FEATURED_ITEMS);

  if (loading) return null;

  const featuredItems =
    type === "preset" ? data?.featuredPreset : data?.featuredFilmSim;
  const item = featuredItems?.[0];
  if (!item) return null;

  const images: string[] =
    type === "preset"
      ? [item.afterImage?.url].filter(Boolean)
      : (item.sampleImages || [])
          .map((s: { url?: string }) => s?.url)
          .filter(Boolean);

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const imageUrl = images[currentIndex] || "";

  // Wheel and touch navigation
  const touchStartX = React.useRef<number | null>(null);
  const onWheel = (e: React.WheelEvent) => {
    if (images.length < 2) return;
    if (e.deltaY > 0) setCurrentIndex((p) => (p + 1) % images.length);
    else if (e.deltaY < 0)
      setCurrentIndex((p) => (p - 1 + images.length) % images.length);
  };
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (images.length < 2 || touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 30) {
      if (dx < 0) setCurrentIndex((p) => (p + 1) % images.length);
      else setCurrentIndex((p) => (p - 1 + images.length) % images.length);
    }
    touchStartX.current = null;
  };

  const title = type === "preset" ? item.title : item.name;

  return (
    <Box sx={{ width: { xs: "100%", md: "70%" }, mx: "auto", mb: 6 }}>
      {/* Header Row: Title, Description, Avatar */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr auto", md: "1fr 1fr auto" },
          gap: { xs: 1.5, md: 3 },
          alignItems: "center",
          mb: { xs: 2, md: 3 },
          px: { xs: 1.5, sm: 2, md: 0 },
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontWeight: 900,
            letterSpacing: { xs: -0.5, md: -1 },
            fontSize: { xs: "2.2rem", sm: "2.8rem", md: "4.25rem" },
            lineHeight: 1.03,
            whiteSpace: "pre-wrap",
            color: "text.primary",
          }}
        >
          {title}
        </Typography>

        <Box sx={{ display: { xs: "none", md: "block" } }}>
          {item.description && (
            <Typography
              variant="body1"
              sx={{
                color: (theme) => theme.palette.text.secondary,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                fontSize: { md: "1.05rem", lg: "1.12rem" },
                lineHeight: 1.7,
              }}
            >
              {item.description}
            </Typography>
          )}
        </Box>

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}
          onClick={() => navigate(`/profile/${item.creator.id}`)}
        >
          <Avatar
            src={item.creator.avatar}
            alt={item.creator.username}
            sx={{
              width: { xs: 40, sm: 46 },
              height: { xs: 40, sm: 46 },
              cursor: "pointer",
              boxShadow: 3,
            }}
          >
            {item.creator.username.charAt(0).toUpperCase()}
          </Avatar>
        </Box>
      </Box>

      {/* Image Area (uninterrupted) */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: 360, sm: 480, md: 620 },
          overflow: "hidden",
          borderRadius: { xs: 2, md: 3 },
          cursor: "pointer",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          transition: "transform .25s ease, box-shadow .25s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
          },
        }}
        onClick={() => navigate(`/${type}/${item.slug}`)}
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </Box>

      {/* Pagination dots */}
      {images.length > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1.25, mt: 2 }}>
          {images.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              sx={{
                width: idx === currentIndex ? 10 : 8,
                height: idx === currentIndex ? 10 : 8,
                borderRadius: "50%",
                backgroundColor: idx === currentIndex ? "#556cd6" : "rgba(0,0,0,0.25)",
                cursor: "pointer",
                transition: "all .2s ease",
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FeaturedHeroSection;
