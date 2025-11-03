import React, { useState, useEffect, useCallback, memo } from "react";
import { Box } from "@mui/material";

interface AnimatedBeforeAfterSliderProps {
  beforeImage?: string;
  afterImage?: string;
  height?: number;
  isMobile?: boolean;
  isHovered?: boolean;
}

const ANIMATION_DURATION = 600;
const DISPLAY_DURATION = 400;
const TOTAL_DURATION =
  ANIMATION_DURATION + DISPLAY_DURATION + ANIMATION_DURATION;

const sliderKeyframes = `
  @keyframes sliderMove {
    0% {
      clip-path: inset(0 100% 0 0);
    }
    ${(ANIMATION_DURATION / TOTAL_DURATION) * 100}% {
      clip-path: inset(0 0% 0 0);
    }
    ${((ANIMATION_DURATION + DISPLAY_DURATION) / TOTAL_DURATION) * 100}% {
      clip-path: inset(0 0% 0 0);
    }
    100% {
      clip-path: inset(0 100% 0 0);
    }
  }
  @keyframes sliderIndicator {
    0% {
      left: 0%;
    }
    ${(ANIMATION_DURATION / TOTAL_DURATION) * 100}% {
      left: 100%;
    }
    ${((ANIMATION_DURATION + DISPLAY_DURATION) / TOTAL_DURATION) * 100}% {
      left: 100%;
    }
    100% {
      left: -10%;
    }
  }
`;

const AnimatedBeforeAfterSlider: React.FC<AnimatedBeforeAfterSliderProps> =
  memo(
    ({
      beforeImage,
      afterImage,
      height,
      isMobile: _isMobile = false,
      isHovered: externalIsHovered,
    }) => {
      const [isAnimating, setIsAnimating] = useState(false);
      const [afterImageLoaded, setAfterImageLoaded] = useState(false);
      const [beforeImageLoaded, setBeforeImageLoaded] = useState(false);
      const [hasTriggeredThisHover, setHasTriggeredThisHover] = useState(false);

      const hasBeforeImage = !!beforeImage;
      const imagesReady =
        afterImageLoaded && (!hasBeforeImage || beforeImageLoaded);

      useEffect(() => {
        if (!isAnimating) return;

        const timer = setTimeout(() => {
          setIsAnimating(false);
        }, TOTAL_DURATION);

        return () => clearTimeout(timer);
      }, [isAnimating]);

      useEffect(() => {
        if (externalIsHovered === undefined) {
          return;
        }

        if (!externalIsHovered) {
          setHasTriggeredThisHover(false);
          return;
        }

        if (
          externalIsHovered &&
          !isAnimating &&
          !hasTriggeredThisHover &&
          imagesReady
        ) {
          setIsAnimating(true);
          setHasTriggeredThisHover(true);
        }
      }, [externalIsHovered, isAnimating, hasTriggeredThisHover, imagesReady]);

      const handleMouseEnter = useCallback(() => {
        if (
          externalIsHovered === undefined &&
          !isAnimating &&
          !hasTriggeredThisHover &&
          imagesReady
        ) {
          setIsAnimating(true);
          setHasTriggeredThisHover(true);
        }
      }, [externalIsHovered, isAnimating, hasTriggeredThisHover, imagesReady]);

      const handleMouseLeave = useCallback(() => {
        if (externalIsHovered === undefined) {
          setHasTriggeredThisHover(false);
        }
      }, [externalIsHovered]);

      return (
        <>
          <style>{sliderKeyframes}</style>
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
              alt="After"
              onLoad={() => setAfterImageLoaded(true)}
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                top: 0,
                left: 0,
                willChange: "auto",
              }}
            />

            <Box
              component="img"
              src={beforeImage}
              alt="Before"
              onLoad={() => setBeforeImageLoaded(true)}
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                top: 0,
                left: 0,
                clipPath: "inset(0 100% 0 0)",
                willChange: "clip-path",
                ...(hasBeforeImage &&
                  imagesReady &&
                  isAnimating && {
                    animation: `sliderMove ${TOTAL_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                  }),
              }}
            />

            {hasBeforeImage && isAnimating && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "2px",
                  height: "100%",
                  backgroundColor: "white",
                  transform: "translateX(-50%)",
                  willChange: "left",
                  animation: `sliderIndicator ${TOTAL_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "10px",
                    height: "10px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  },
                }}
              />
            )}
          </Box>
        </>
      );
    }
  );

AnimatedBeforeAfterSlider.displayName = "AnimatedBeforeAfterSlider";

export default AnimatedBeforeAfterSlider;
