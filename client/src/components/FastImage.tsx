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
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  // Get optimized URL immediately
  const optimizedSrc = CloudinaryOptimizer.getThumbnail(src, aspectRatio);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setHasError(true);

    // Fallback to original if Cloudinary fails
    if (e.currentTarget.src !== src) {
      e.currentTarget.src = src;
    } else {
      onError?.();
    }
  };

  const spinnerStyle: React.CSSProperties = {
    width: "20px",
    height: "20px",
    border: "2px solid #444",
    borderTop: "2px solid #90caf9",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };

  return (
    <div style={{ position: "relative", ...style }}>
      <img
        src={optimizedSrc}
        alt={alt}
        className={className}
        style={{
          ...style,
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.3s ease-in-out",
        }}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        role="img"
        aria-label={alt}
      />
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#2a2a2a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-hidden="true"
        >
          <div style={spinnerStyle} />
        </div>
      )}
      {hasError && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#2a2a2a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#cccccc",
            fontSize: "0.875rem",
          }}
          aria-hidden="true"
        >
          Image unavailable
        </div>
      )}
    </div>
  );
};

export default FastImage;
