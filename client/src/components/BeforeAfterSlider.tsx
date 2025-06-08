import React, { useRef, useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  height?: number; // optional fixed height
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  height = 400,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const theme = useTheme();

  const startDragging = () => setIsDragging(true);
  const stopDragging = () => setIsDragging(false);

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const newPos = Math.max(0, Math.min((offsetX / rect.width) * 100, 100));
    setSliderPosition(newPos);
  };

  useEffect(() => {
    const moveHandler = (e: MouseEvent | TouchEvent) => handleMove(e);
    const upHandler = () => stopDragging();

    if (isDragging) {
      window.addEventListener("mousemove", moveHandler);
      window.addEventListener("touchmove", moveHandler);
      window.addEventListener("mouseup", upHandler);
      window.addEventListener("touchend", upHandler);
    }

    return () => {
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("touchmove", moveHandler);
      window.removeEventListener("mouseup", upHandler);
      window.removeEventListener("touchend", upHandler);
    };
  }, [isDragging]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        height,
        overflow: "hidden",
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {/* After Image (full width) */}
      <Box
        component="img"
        src={afterImage}
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

      {/* Before Image (clipped) */}
      <Box
        component="img"
        src={beforeImage}
        alt="Before"
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          top: 0,
          left: 0,
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
      />

      {/* Slider handle */}
      <Box
        onMouseDown={startDragging}
        onTouchStart={startDragging}
        sx={{
          position: "absolute",
          top: 0,
          left: `${sliderPosition}%`,
          transform: "translateX(-50%)",
          height: "100%",
          width: 2,
          backgroundColor: "#fff",
          zIndex: 2,
          cursor: "ew-resize",
        }}
      />

      {/* Handle indicator */}
      <Box
        onMouseDown={startDragging}
        onTouchStart={startDragging}
        sx={{
          position: "absolute",
          top: "50%",
          left: `${sliderPosition}%`,
          transform: "translate(-50%, -50%)",
          width: 24,
          height: 24,
          borderRadius: "50%",
          backgroundColor: "#fff",
          border: `2px solid ${theme.palette.text.secondary}`,
          zIndex: 3,
        }}
      />

      {/* Labels */}
      <Typography
        variant="caption"
        sx={{
          position: "absolute",
          top: 8,
          left: 12,
          color: "#fff",
          backgroundColor: "rgba(0,0,0,0.5)",
          px: 1,
          borderRadius: 1,
          zIndex: 4,
        }}
      >
        Before
      </Typography>
      <Typography
        variant="caption"
        sx={{
          position: "absolute",
          top: 8,
          right: 12,
          color: "#fff",
          backgroundColor: "rgba(0,0,0,0.5)",
          px: 1,
          borderRadius: 1,
          zIndex: 4,
        }}
      >
        After
      </Typography>
    </Box>
  );
};

export default BeforeAfterSlider;
