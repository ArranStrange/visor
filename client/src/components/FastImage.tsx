import React from "react";
import { CloudinaryOptimizer } from "../utils/cloudinary";

interface FastImageProps {
  src: string;
  alt: string;
  aspectRatio?: "3:4" | "2:3" | "4:5";
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

const FastImage: React.FC<FastImageProps> = ({
  src,
  alt,
  aspectRatio = "3:4",
  className,
  style,
  onLoad,
  onError,
}) => {
  // Get optimized URL immediately
  const optimizedSrc = CloudinaryOptimizer.getThumbnail(src, aspectRatio);

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onLoad={onLoad}
      onError={(e) => {
        // Fallback to original if Cloudinary fails
        if (e.currentTarget.src !== src) {
          e.currentTarget.src = src;
        } else {
          onError?.();
        }
      }}
    />
  );
};

export default FastImage;
