import React, { useState, useRef, useEffect } from "react";
import { Box } from "@mui/material";

interface BeforeAfterSliderProps {
  beforeImage?: string;
  afterImage?: string;
  height?: number;
}

const PLACEHOLDER_BEFORE_IMAGE =
  "https://images.squarespace-cdn.com/content/v1/6373cb8313c0a95dd854d566/1673048455010-8BUUZ6KQ57VONKNAI7TO/TaraShupe_Photography_Humanitarian_Photographer_Female_Storyteller_NGO_WomenFilmmakers_before-after-lightroom-edits052.jpg?format=1500w";

const PLACEHOLDER_AFTER_IMAGE =
  "https://images.squarespace-cdn.com/content/v1/6373cb8313c0a95dd854d566/1673048458349-QJWKE73PW72A8FRIZDG9/TaraShupe_Photography_Humanitarian_Photographer_Female_Storyteller_NGO_WomenFilmmakers_before-after-lightroom-edits053.jpg?format=1500w";

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  height = 400,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    isDragging.current = true;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    e.preventDefault();
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        height: height,
        overflow: "hidden",
        borderRadius: 2,
        cursor: "col-resize",
        userSelect: "none",
        touchAction: "none",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* After Image (full width, background) */}
      <Box
        component="img"
        src={afterImage || PLACEHOLDER_AFTER_IMAGE}
        alt="After"
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          top: 0,
          left: 0,
        }}
      />

      {/* Before Image (clipped, on top) */}
      <Box
        component="img"
        src={beforeImage || PLACEHOLDER_BEFORE_IMAGE}
        alt="Before"
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          top: 0,
          left: 0,
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          transition: "clip-path 0.1s",
        }}
      />

      {/* Slider Line */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: `${sliderPosition}%`,
          width: "2px",
          height: "100%",
          backgroundColor: "white",
          transform: "translateX(-50%)",
          cursor: "col-resize",
          "&::before": {
            content: '""',
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "40px",
            height: "40px",
            backgroundColor: "white",
            borderRadius: "50%",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          },
        }}
      />
    </Box>
  );
};

export default BeforeAfterSlider;
