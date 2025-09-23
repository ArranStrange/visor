import React, { useState, useRef, useEffect } from "react";
import { CloudinaryOptimizer } from "../utils/cloudinary";

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

const ImageOptimizer: React.FC<ImageProps> = ({
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
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [showProgressive, setShowProgressive] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const loadingMode =
    loading === "progressive"
      ? "progressive"
      : lazy === false
      ? "eager"
      : "lazy";

  useEffect(() => {
    if (loadingMode === "eager") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "50px" }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, [loadingMode]);

  useEffect(() => {
    if (!isInView || !src) return;

    if (loadingMode === "progressive") {
      const progressiveUrl = CloudinaryOptimizer.getProgressive(src);
      setImageSrc(progressiveUrl);
      setShowProgressive(true);

      const fullImage = new Image();
      fullImage.onload = () => {
        const optimizedUrl = CloudinaryOptimizer.getThumbnail(src, aspectRatio);
        setImageSrc(optimizedUrl);
        setShowProgressive(false);
        setIsLoaded(true);
        onLoad?.();
      };
      fullImage.onerror = () => {
        setImageSrc(src);
        setShowProgressive(false);
        setIsLoaded(true);
        onError?.();
      };
      fullImage.src = CloudinaryOptimizer.getThumbnail(src, aspectRatio);
    } else {
      const optimizedUrl = CloudinaryOptimizer.getThumbnail(src, aspectRatio);
      setImageSrc(optimizedUrl);
    }
  }, [isInView, src, aspectRatio, loadingMode, onLoad, onError]);

  const handleLoad = () => {
    if (!isLoaded) {
      setIsLoaded(true);
      onLoad?.();
    }
  };

  const handleError = () => {
    if (imageSrc !== src) {
      setImageSrc(src);
    } else {
      onError?.();
    }
  };

  const progressiveStyles =
    loadingMode === "progressive"
      ? {
          position: "absolute" as const,
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover" as const,
          filter: showProgressive ? "blur(20px)" : "none",
          transform: showProgressive ? "scale(1.1)" : "scale(1)",
          transition: isLoaded
            ? "filter 0.3s ease-out, transform 0.3s ease-out"
            : "none",
        }
      : {};

  const standardStyles =
    loadingMode !== "progressive"
      ? {
          opacity: isLoaded ? 1 : 0.7,
          filter: isLoaded ? "none" : "blur(8px)",
          transition: "opacity 0.3s ease-in-out, filter 0.3s ease-in-out",
        }
      : {};

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

  if (loadingMode === "progressive") {
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {imageElement}
      </div>
    );
  }

  return imageElement;
};

export default ImageOptimizer;
