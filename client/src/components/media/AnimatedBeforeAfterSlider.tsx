import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Box } from "@mui/material";

interface AnimatedBeforeAfterSliderProps {
  beforeImage?: string;
  afterImage?: string;
  beforeImageSrcSet?: string;
  afterImageSrcSet?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
  height?: number;
  isMobile?: boolean;
  isHovered?: boolean;
}

const ANIMATION_DURATION = 500;
const DISPLAY_DURATION = 300;

const AnimatedBeforeAfterSlider: React.FC<AnimatedBeforeAfterSliderProps> =
  memo(
    ({
      beforeImage,
      afterImage,
      beforeImageSrcSet,
      afterImageSrcSet,
      sizes,
      loading = "lazy",
      height,
      isMobile: _isMobile = false,
      isHovered: externalIsHovered,
    }) => {
      const [internalHovered, setInternalHovered] = useState(false);
      const [sliderPosition, setSliderPosition] = useState(0);
      const [afterImageLoaded, setAfterImageLoaded] = useState(false);
      const [beforeImageLoaded, setBeforeImageLoaded] = useState(false);

      const isHovered = useMemo(
        () =>
          externalIsHovered !== undefined ? externalIsHovered : internalHovered,
        [externalIsHovered, internalHovered]
      );

      const hasBeforeImage = !!beforeImage;
      const imagesReady =
        afterImageLoaded && (!hasBeforeImage || beforeImageLoaded);

      useEffect(() => {
        if (!hasBeforeImage || !imagesReady) {
          setSliderPosition(0);
          return;
        }

        if (isHovered) {
          setSliderPosition(100);

          const returnTimer = setTimeout(() => {
            setSliderPosition(0);
          }, ANIMATION_DURATION + DISPLAY_DURATION);

          const slideOffTimer = setTimeout(
            () => {
              setSliderPosition(-5);
            },
            ANIMATION_DURATION + DISPLAY_DURATION + ANIMATION_DURATION
          );

          return () => {
            clearTimeout(returnTimer);
            clearTimeout(slideOffTimer);
          };
        } else {
          setSliderPosition(0);
        }
      }, [isHovered, hasBeforeImage, imagesReady]);

      const handleMouseEnter = useCallback(
        (e: React.MouseEvent) => {
          if (externalIsHovered === undefined) {
            e.stopPropagation();
            setInternalHovered(true);
          }
        },
        [externalIsHovered]
      );

      const handleMouseLeave = useCallback(
        (e: React.MouseEvent) => {
          if (externalIsHovered === undefined) {
            e.stopPropagation();
            setInternalHovered(false);
          }
        },
        [externalIsHovered]
      );

      return (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: height || "100%",
            overflow: "hidden",
            borderRadius: height ? 2 : 0,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Box
            component="img"
            src={afterImage}
            srcSet={afterImageSrcSet}
            sizes={afterImageSrcSet ? sizes : undefined}
            loading={loading}
            alt="After"
            onLoad={() => setAfterImageLoaded(true)}
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              top: 0,
              left: 0,
            }}
          />

          <Box
            component="img"
            src={beforeImage}
            srcSet={beforeImageSrcSet}
            sizes={beforeImageSrcSet ? sizes : undefined}
            loading={loading}
            alt="Before"
            onLoad={() => setBeforeImageLoaded(true)}
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              top: 0,
              left: 0,
              clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
              transition:
                hasBeforeImage && imagesReady
                  ? `clip-path ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`
                  : "none",
            }}
          />

          {hasBeforeImage && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: `${sliderPosition}%`,
                width: "3px",
                height: "100%",
                backgroundColor: "overlay.white",
                boxShadow: (theme) =>
                  `0 0 8px ${theme.palette.overlay.whiteSoft}`,
                transform: "translateX(-50%)",
                opacity: isHovered ? 1 : 0,
                pointerEvents: "none",
                transition: imagesReady
                  ? `left ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms ease-in-out`
                  : "none",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "20px",
                  height: "20px",
                  backgroundColor: "overlay.white",
                  borderRadius: "50%",
                  boxShadow: (theme) =>
                    `0 0 6px ${theme.palette.overlay.whiteSoft}, 0 2px 6px ${theme.palette.overlay.scrimMedium}`,
                },
              }}
            />
          )}
        </Box>
      );
    }
  );

AnimatedBeforeAfterSlider.displayName = "AnimatedBeforeAfterSlider";

export default AnimatedBeforeAfterSlider;
