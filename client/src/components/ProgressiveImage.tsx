import React, { useState, useRef, useEffect } from "react";
import { CloudinaryOptimizer } from "../utils/cloudinary";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  aspectRatio?: "3:4" | "2:3";
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  aspectRatio = "3:4",
  className,
  style,
  onLoad,
  onError,
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [showProgressive, setShowProgressive] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    let didCancel = false;

    if (imageRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (
              !didCancel &&
              (entry.intersectionRatio > 0 || entry.isIntersecting)
            ) {
              setIsInView(true);
              // Safely unobserve
              if (observerRef.current && entry.target) {
                observerRef.current.unobserve(entry.target);
              }
            }
          });
        },
        {
          threshold: 0.01,
          rootMargin: "100px", // Start loading 100px before entering viewport
        }
      );
      observerRef.current.observe(imageRef.current);
    }

    return () => {
      didCancel = true;
      // Safely cleanup observer
      if (observerRef.current && imageRef.current) {
        try {
          observerRef.current.unobserve(imageRef.current);
        } catch (error) {
          // Ignore errors during cleanup
        }
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (isInView && src) {
      // Start with progressive (blurred) image
      const progressiveUrl = CloudinaryOptimizer.getProgressive(src);
      setCurrentSrc(progressiveUrl);
      setShowProgressive(true);

      // Load the full quality image
      const fullImage = new Image();
      fullImage.onload = () => {
        const optimizedUrl = CloudinaryOptimizer.getThumbnail(src, aspectRatio);
        setCurrentSrc(optimizedUrl);
        setShowProgressive(false);
        setIsLoaded(true);
        onLoad?.();
      };
      fullImage.onerror = () => {
        // Fallback to original image if Cloudinary fails
        setCurrentSrc(src);
        setShowProgressive(false);
        setIsLoaded(true);
        onError?.();
      };
      fullImage.src = CloudinaryOptimizer.getThumbnail(src, aspectRatio);
    }
  }, [isInView, src, aspectRatio, onLoad, onError]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <img
        ref={imageRef}
        src={currentSrc}
        alt={alt}
        className={className}
        style={{
          ...style,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: showProgressive ? "blur(20px)" : "none",
          transform: showProgressive ? "scale(1.1)" : "scale(1)",
          transition: isLoaded
            ? "filter 0.3s ease-out, transform 0.3s ease-out"
            : "none",
        }}
        loading="lazy"
      />
    </div>
  );
};

export default ProgressiveImage;
