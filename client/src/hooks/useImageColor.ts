import { useState, useEffect } from "react";

// Simple color palette for different image types
const colorPalettes = {
  warm: "#f8f4f0", // Warm off-white
  cool: "#f0f4f8", // Cool off-white
  neutral: "#f8f8f8", // Neutral off-white
  dark: "#f0f0f0", // Slightly darker
  light: "#fafafa", // Very light
};

// Simple hash-based color selection (much faster than canvas analysis)
const getColorFromUrl = (url: string): string => {
  if (!url || url === "/placeholder-image.jpg") {
    return colorPalettes.neutral;
  }

  // Create a simple hash from the URL
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use hash to select a color palette
  const colors = Object.values(colorPalettes);
  const colorIndex = Math.abs(hash) % colors.length;

  return colors[colorIndex];
};

export const useImageColor = (imageUrl: string | undefined) => {
  const [offWhiteColor, setOffWhiteColor] = useState<string>(
    colorPalettes.neutral
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setOffWhiteColor(colorPalettes.neutral);
      setIsAnalyzing(false);
      return;
    }

    // Skip analysis for placeholder images
    if (imageUrl === "/placeholder-image.jpg") {
      setOffWhiteColor(colorPalettes.neutral);
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);

    // Use requestAnimationFrame for better performance
    const frameId = requestAnimationFrame(() => {
      const color = getColorFromUrl(imageUrl);
      setOffWhiteColor(color);
      setIsAnalyzing(false);
    });

    return () => cancelAnimationFrame(frameId);
  }, [imageUrl]);

  return {
    offWhiteColor,
    isAnalyzing,
  };
};
