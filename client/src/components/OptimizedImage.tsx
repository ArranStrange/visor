import React, { useState, useEffect } from "react";
import { CloudinaryOptimizer } from "../utils/cloudinary";

interface OptimizedImageProps {
  src: string;
  alt: string;
  aspectRatio?: "3:4" | "2:3";
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  aspectRatio = "3:4",
  className,
  style,
  onLoad,
  onError,
  lazy = true,
}) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!src) return;

    setIsLoading(true);
    setIsLoaded(false);

    const optimizedUrl = CloudinaryOptimizer.getThumbnail(src, aspectRatio);
    setImageSrc(optimizedUrl);

    const img = new Image();
    img.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
      onLoad?.();
    };
    img.onerror = () => {
      setImageSrc(src);
      setIsLoaded(true);
      setIsLoading(false);
      onError?.();
    };
    img.src = optimizedUrl;
  }, [src, aspectRatio, onLoad, onError]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={{
        ...style,
        opacity: isLoaded ? 1 : 0.7,
        filter: isLoading ? "blur(8px)" : "none",
        transition: "opacity 0.3s ease-in-out, filter 0.3s ease-in-out",
      }}
      loading={lazy ? "lazy" : "eager"}
      onLoad={() => {
        if (!isLoaded) {
          setIsLoaded(true);
          setIsLoading(false);
          onLoad?.();
        }
      }}
      onError={() => {
        if (imageSrc !== src) {
          setImageSrc(src);
        }
        setIsLoaded(true);
        setIsLoading(false);
        onError?.();
      }}
    />
  );
};

export default OptimizedImage;
