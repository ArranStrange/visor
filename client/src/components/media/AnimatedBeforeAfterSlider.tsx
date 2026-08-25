import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from "react";
import { Box, useMediaQuery } from "@mui/material";

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
// Pause on the "after" image between sweeps, so the loop reads as a
// deliberate peek rather than a strobe.
const REST_DURATION = 900;

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
      isMobile = false,
      isHovered: externalIsHovered,
    }) => {
      const [internalHovered, setInternalHovered] = useState(false);
      const [sliderPosition, setSliderPosition] = useState(0);
      const [afterImageLoaded, setAfterImageLoaded] = useState(false);
      const [beforeImageLoaded, setBeforeImageLoaded] = useState(false);
      const [beforeImageErrored, setBeforeImageErrored] = useState(false);
      const prefersReducedMotion = useMediaQuery(
        "(prefers-reduced-motion: reduce)"
      );

      const isHovered = useMemo(
        () =>
          externalIsHovered !== undefined ? externalIsHovered : internalHovered,
        [externalIsHovered, internalHovered]
      );

      // React's onLoad never fires for an image that is already complete
      // when the handler attaches — cached images on back-navigation,
      // grid remounts, and lazy images that finish before hydration. That
      // was the "hover randomly does nothing" bug: imagesReady stayed
      // false forever for exactly those cards. A callback ref checks
      // completeness at attach time; onLoad still covers the normal path.
      const attachLoadedCheck = useCallback(
        (setLoaded: (v: boolean) => void) => (node: HTMLImageElement | null) => {
          if (node && node.complete && node.naturalWidth > 0) {
            setLoaded(true);
          }
        },
        []
      );
      const beforeRef = useMemo(
        () => attachLoadedCheck(setBeforeImageLoaded),
        [attachLoadedCheck]
      );
      const afterRef = useMemo(
        () => attachLoadedCheck(setAfterImageLoaded),
        [attachLoadedCheck]
      );

      // The before image must never be native-lazy: it's fully clipped
      // until the animation runs, and Chromium defers lazy-loading of
      // hidden images indefinitely — a deadlock where the image only
      // unhides on hover and hover only animates once it loads. Instead
      // it mounts eagerly on the first hover and stays mounted, so the
      // first peek costs one fetch and every later one is instant.
      const [beforeArmed, setBeforeArmed] = useState(false);
      useEffect(() => {
        if (isHovered) setBeforeArmed(true);
      }, [isHovered]);

      // A broken before-image behaves like no before-image: the card
      // shows the after shot and hover does nothing, rather than waiting
      // forever on a load that already failed.
      const hasBeforeImage = !!beforeImage && !beforeImageErrored;
      const imagesReady =
        afterImageLoaded && (!hasBeforeImage || beforeImageLoaded);

      useEffect(() => {
        if (!hasBeforeImage || !imagesReady || !isHovered) {
          setSliderPosition(0);
          return;
        }

        // Reduced motion: no sweep — hold the comparison while hovered.
        // On mobile "hovered" never ends (tap-to-reveal has no leave
        // event), so show the before briefly and swap back instead of
        // holding it forever.
        if (prefersReducedMotion && !isMobile) {
          setSliderPosition(100);
          return () => setSliderPosition(0);
        }

        let cancelled = false;
        const timers: ReturnType<typeof setTimeout>[] = [];
        const at = (fn: () => void, ms: number) => {
          timers.push(
            setTimeout(() => {
              if (!cancelled) fn();
            }, ms)
          );
        };

        // Mobile: one-shot peek. The first tap reveals the before image
        // once (alongside the tag/creator overlays); the second tap
        // navigates. isHovered stays true until the overlays dismiss, so
        // a loop here would sweep forever while the user scrolls.
        //
        // Desktop: loop while hovered. The old one-shot dead-ended after
        // a single sweep, so a pointer resting on the card saw nothing
        // until it fully left and re-entered.
        const cycle = () => {
          setSliderPosition(100);
          at(() => setSliderPosition(0), ANIMATION_DURATION + DISPLAY_DURATION);
          if (!isMobile) {
            at(
              cycle,
              ANIMATION_DURATION +
                DISPLAY_DURATION +
                ANIMATION_DURATION +
                REST_DURATION
            );
          }
        };
        cycle();

        return () => {
          cancelled = true;
          timers.forEach(clearTimeout);
          setSliderPosition(0);
        };
      }, [isHovered, hasBeforeImage, imagesReady, prefersReducedMotion, isMobile]);

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
            ref={afterRef}
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

          {!!beforeImage && beforeArmed && (
            <Box
              component="img"
              ref={beforeRef}
              src={beforeImage}
              srcSet={beforeImageSrcSet}
              sizes={beforeImageSrcSet ? sizes : undefined}
              loading="eager"
              alt="Before"
              onLoad={() => setBeforeImageLoaded(true)}
              onError={() => setBeforeImageErrored(true)}
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                top: 0,
                left: 0,
              }}
              // style, not sx: these change on every animation tick, and
              // sx would mint a new emotion class per change.
              style={{
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                transition:
                  hasBeforeImage && imagesReady && !prefersReducedMotion
                    ? `clip-path ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`
                    : "none",
              }}
            />
          )}

          {hasBeforeImage && (
            <Box
              // Animated values live in style (see the before image).
              style={{
                left: `${sliderPosition}%`,
                // Follows the sweep rather than the hover: hides during
                // the rest phase between loops instead of parking a
                // hairline at the card's left edge.
                opacity: sliderPosition > 0 ? 1 : 0,
                transition:
                  imagesReady && !prefersReducedMotion
                    ? `left ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease-in-out`
                    : "none",
              }}
              sx={{
                position: "absolute",
                top: 0,
                width: "3px",
                height: "100%",
                backgroundColor: "overlay.white",
                boxShadow: (theme) =>
                  `0 0 8px ${theme.palette.overlay.whiteSoft}`,
                transform: "translateX(-50%)",
                pointerEvents: "none",
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
