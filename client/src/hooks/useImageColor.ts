import { useState, useEffect, useRef } from "react";

interface ColorData {
  r: number;
  g: number;
  b: number;
  count: number;
}

export const useImageColor = (imageUrl: string) => {
  const [offWhiteColor, setOffWhiteColor] = useState<string>("#f8f8f8");
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!imageUrl || imageUrl === "/placeholder-image.jpg") {
      console.log("useImageColor: Using default color for placeholder");
      setOffWhiteColor("#f8f8f8");
      setImageDimensions(null);
      return;
    }

    console.log("useImageColor: Analyzing image:", imageUrl);

    const analyzeImage = async () => {
      setIsAnalyzing(true);

      try {
        const canvas = canvasRef.current || document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          console.log("useImageColor: No canvas context available");
          setOffWhiteColor("#f8f8f8");
          setImageDimensions(null);
          return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
          console.log(
            "useImageColor: Image loaded, dimensions:",
            img.width,
            "x",
            img.height
          );

          // Store image dimensions
          setImageDimensions({ width: img.width, height: img.height });

          // Set canvas size (we'll scale down for performance)
          const scale = 0.1; // Analyze 10% of the image for performance
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          console.log(
            "useImageColor: Canvas size:",
            canvas.width,
            "x",
            canvas.height
          );

          // Draw the image to canvas
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          console.log("useImageColor: Image data length:", data.length);

          // Sample colors from the image
          const colors: ColorData[] = [];
          const colorMap = new Map<string, ColorData>();

          // Sample every 4th pixel for performance
          for (let i = 0; i < data.length; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Skip very dark or very light pixels
            const brightness = (r + g + b) / 3;
            if (brightness < 30 || brightness > 225) continue;

            // Quantize colors to reduce noise
            const quantizedR = Math.floor(r / 32) * 32;
            const quantizedG = Math.floor(g / 32) * 32;
            const quantizedB = Math.floor(b / 32) * 32;

            const key = `${quantizedR},${quantizedG},${quantizedB}`;

            if (colorMap.has(key)) {
              colorMap.get(key)!.count++;
            } else {
              colorMap.set(key, {
                r: quantizedR,
                g: quantizedG,
                b: quantizedB,
                count: 1,
              });
            }
          }

          console.log("useImageColor: Found", colorMap.size, "unique colors");

          // Convert map to array and sort by frequency
          const sortedColors = Array.from(colorMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Take top 5 most frequent colors

          console.log("useImageColor: Top colors:", sortedColors);

          if (sortedColors.length === 0) {
            console.log("useImageColor: No valid colors found, using default");
            setOffWhiteColor("#f8f8f8");
            return;
          }

          // Calculate weighted average of dominant colors
          let totalWeight = 0;
          let weightedR = 0;
          let weightedG = 0;
          let weightedB = 0;

          sortedColors.forEach((color, index) => {
            const weight = color.count * (1 / (index + 1)); // Give more weight to more frequent colors
            totalWeight += weight;
            weightedR += color.r * weight;
            weightedG += color.g * weight;
            weightedB += color.b * weight;
          });

          const avgR = Math.round(weightedR / totalWeight);
          const avgG = Math.round(weightedG / totalWeight);
          const avgB = Math.round(weightedB / totalWeight);

          console.log("useImageColor: Average dominant color:", {
            r: avgR,
            g: avgG,
            b: avgB,
          });

          // Create an off-white color influenced by the dominant colors
          // Mix the dominant color with white (60% white, 40% dominant color) - subtle effect
          const whiteInfluence = 0.6;
          const dominantInfluence = 0.4;

          const finalR = Math.round(
            255 * whiteInfluence + avgR * dominantInfluence
          );
          const finalG = Math.round(
            255 * whiteInfluence + avgG * dominantInfluence
          );
          const finalB = Math.round(
            255 * whiteInfluence + avgB * dominantInfluence
          );

          const offWhite = `rgb(${finalR}, ${finalG}, ${finalB})`;
          console.log("useImageColor: Final off-white color:", offWhite);
          setOffWhiteColor(offWhite);
        };

        img.onerror = (error) => {
          console.error("useImageColor: Image load error:", error);
          setOffWhiteColor("#f8f8f8");
          setImageDimensions(null);
        };

        img.src = imageUrl;
      } catch (error) {
        console.error("Error analyzing image color:", error);
        setOffWhiteColor("#f8f8f8");
        setImageDimensions(null);
      } finally {
        setIsAnalyzing(false);
      }
    };

    // Debounce the analysis to avoid excessive processing
    const timeoutId = setTimeout(analyzeImage, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [imageUrl]);

  return { offWhiteColor, imageDimensions, isAnalyzing };
};
