import React, { memo } from "react";
import { useImageLoader } from "../../hooks/useImageLoader";

interface ImageProps {
  src: string;
  alt: string;
  aspectRatio?: "3:4" | "2:3" | "4:5";
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  loading?: "lazy" | "eager" | "progressive";
  lazy?: boolean; // For backward compatibility
}

const ImageOptimizer: React.FC<ImageProps> = memo(
  ({
    src,
    alt,
    aspectRatio = "3:4",
    className,
    style,
    onLoad,
    onError,
    loading = "lazy",
    lazy = true,
  }) => {
    const {
      imageRef,
      imageSrc,
      loadingMode,
      handleLoad,
      handleError,
      progressiveStyles,
      standardStyles,
      needsProgressiveWrapper,
    } = useImageLoader({
      src,
      aspectRatio,
      loading,
      lazy,
      onLoad,
      onError,
      rootMargin: "100px", // Maintain current behavior
    });

    const imageElement = (
      <img
        ref={imageRef}
        src={imageSrc}
        alt={alt}
        className={className}
        style={{
          ...style,
          ...progressiveStyles,
          ...standardStyles,
        }}
        onLoad={handleLoad}
        onError={handleError}
        loading={loadingMode === "progressive" ? "lazy" : loadingMode}
      />
    );

    if (needsProgressiveWrapper) {
      return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          {imageElement}
        </div>
      );
    }

    return imageElement;
  }
);

ImageOptimizer.displayName = "ImageOptimizer";

export default ImageOptimizer;
