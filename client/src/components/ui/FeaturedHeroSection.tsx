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
  // Hooks must run on every render to keep order stable
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const touchStartX = React.useRef<number | null>(null);
  const isNavigating = React.useRef(false);
  const NAVIGATION_COOLDOWN_MS = 350;

  const item = featuredItems?.[0];
  // If there is no featured item, render nothing to avoid hook order changes elsewhere
  if (!item) {
    return <Box sx={{ width: { xs: "100%", md: "70%" }, mx: "auto", height: "40vh" }} />;
  }

  const images: string[] =
    type === "preset"
      ? [item.afterImage?.url].filter(Boolean)
      : (item.sampleImages || [])
          .map((s: { url?: string }) => s?.url)
          .filter(Boolean);

  const imageUrl = images[currentIndex] || "";

  // Navigation helpers (defined after images are known)
  const goNext = () => {
    if (images.length < 2) return;
    setCurrentIndex((p) => (p + 1) % images.length);
  };

  const goPrev = () => {
    if (images.length < 2) return;
    setCurrentIndex((p) => (p - 1 + images.length) % images.length);
  };
  const onWheel = (e: React.WheelEvent) => {
    // Only react to horizontal wheel gestures; ignore vertical scrolling
    if (images.length < 2 || isNavigating.current) return;
    const deltaX = e.deltaX;
    if (Math.abs(deltaX) < 10) return;
    isNavigating.current = true;
    if (deltaX > 0) goNext();
    else goPrev();
    setTimeout(() => {
      isNavigating.current = false;
    }, NAVIGATION_COOLDOWN_MS);
    e.preventDefault();
  };
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (
      images.length < 2 ||
      touchStartX.current === null ||
      isNavigating.current
    )
      return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 30) {
      isNavigating.current = true;
      if (dx < 0) goNext();
      else goPrev();
      setTimeout(() => {
        isNavigating.current = false;
      }, NAVIGATION_COOLDOWN_MS);
    }
    touchStartX.current = null;
  };

  const title = type === "preset" ? item.title : item.name;

  return (
    <Box
      sx={{
        width: { xs: "100%", md: "70%" },
        mx: "auto",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: { xs: 2, md: 3 },
        py: { xs: 2, md: 4 },
      }}
    >
      {/* Header Row: Title, Description, Avatar */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr auto", md: "1fr 1fr auto" },
          columnGap: { xs: 1, md: 2 },
          rowGap: { xs: 1, md: 1.5 },
          alignItems: "center",
          px: { xs: 1.5, sm: 2, md: 0 },
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontWeight: 900,
            letterSpacing: { xs: -0.5, md: -1 },
            fontSize: { xs: "2rem", sm: "2.6rem", md: "4rem" },
            lineHeight: 1.03,
            whiteSpace: "pre-wrap",
            color: "text.primary",
            textTransform: "uppercase",
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
                fontSize: { md: "0.88rem", lg: "0.96rem" },
                lineHeight: 1.55,
              }}
            >
              {item.description}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
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
          flex: 1,
          minHeight: { xs: 300, md: 420 },
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

        {/* Pagination dots overlay on image */}
        {images.length > 1 && (
          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 8,
              display: "flex",
              justifyContent: "center",
              gap: 1.25,
              pointerEvents: "auto",
              backgroundColor: "rgba(0,0,0,0.7)",
              py: 0.5,
              px: 1,
              borderRadius: 999,
              width: "fit-content",
              mx: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((_, idx) => (
              <Box
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                sx={{
                  width: idx === currentIndex ? 12 : 10,
                  height: idx === currentIndex ? 12 : 10,
                  borderRadius: "50%",
                  backgroundColor:
                    idx === currentIndex ? "#FFFFFF" : "transparent",
                  border:
                    idx === currentIndex
                      ? "2px solid #FFFFFF"
                      : "2px solid rgba(255,255,255,0.9)",
                  cursor: "pointer",
                  transition: "all .2s ease",
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FeaturedHeroSection;
