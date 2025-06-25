import React, { useState, useRef, useEffect } from "react";
import { CloudinaryOptimizer } from "../utils/cloudinary";

interface LazyImageProps {
  src: string;
  alt: string;
  aspectRatio?: "3:4" | "2:3";
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  aspectRatio = "3:4",
  className,
  style,
  onLoad,
  onError,
}) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver;
    let didCancel = false;

    if (imageRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (
              !didCancel &&
              (entry.intersectionRatio > 0 || entry.isIntersecting)
            ) {
              setIsInView(true);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.01,
          rootMargin: "50px", // Start loading 50px before entering viewport
        }
      );
      observer.observe(imageRef.current);
    }

    return () => {
      didCancel = true;
      if (observer && observer.unobserve) {
        observer.unobserve(imageRef.current!);
      }
    };
  }, []);

  useEffect(() => {
    if (isInView && src) {
      // Get optimized image URL
      const optimizedUrl = CloudinaryOptimizer.getThumbnail(src, aspectRatio);
      setImageSrc(optimizedUrl);
    }
  }, [isInView, src, aspectRatio]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    // Fallback to original image if Cloudinary optimization fails
    if (imageSrc !== src) {
      setImageSrc(src);
    } else {
      onError?.();
    }
  };

  return (
    <img
      ref={imageRef}
      src={imageSrc}
      alt={alt}
      className={className}
      style={{
        ...style,
        opacity: isLoaded ? 1 : 0,
        transition: "opacity 0.3s ease-in-out",
        filter: isLoaded ? "none" : "blur(10px)",
      }}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default LazyImage;
