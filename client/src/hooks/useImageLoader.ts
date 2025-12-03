import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { CloudinaryOptimizer } from "lib/utils/cloudinary";

interface UseImageLoaderOptions {
  src: string;
  aspectRatio?: "3:4" | "2:3" | "4:5";
  loading?: "lazy" | "eager" | "progressive";
  lazy?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  rootMargin?: string; // Configurable rootMargin for Intersection Observer
}

interface UseImageLoaderReturn {
  imageRef: React.RefObject<HTMLImageElement>;
  imageSrc: string;
  isLoaded: boolean;
  loadingMode: "lazy" | "eager" | "progressive";
  handleLoad: () => void;
  handleError: () => void;
  progressiveStyles: React.CSSProperties;
  standardStyles: React.CSSProperties;
  needsProgressiveWrapper: boolean;
}

export function useImageLoader({
  src,
  aspectRatio = "3:4",
  loading = "lazy",
  lazy = true,
  onLoad,
  onError,
  rootMargin = "100px",
}: UseImageLoaderOptions): UseImageLoaderReturn {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [showProgressive, setShowProgressive] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // Determine loading mode
  const loadingMode = useMemo(
    () =>
      loading === "progressive"
        ? "progressive"
        : lazy === false
        ? "eager"
        : "lazy",
    [loading, lazy]
  );

  // Intersection Observer for lazy/progressive loading
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
      { rootMargin }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, [loadingMode, rootMargin]);

  // Load image when in view
  useEffect(() => {
    if (!isInView || !src) return;

    if (loadingMode === "progressive") {
      // Progressive loading: show low-quality first, then high-quality
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
      // Standard loading: just load optimized image
      const optimizedUrl = CloudinaryOptimizer.getThumbnail(src, aspectRatio);
      setImageSrc(optimizedUrl);
    }
  }, [isInView, src, aspectRatio, loadingMode, onLoad, onError]);

  const handleLoad = useCallback(() => {
    if (!isLoaded) {
      setIsLoaded(true);
      onLoad?.();
    }
  }, [isLoaded, onLoad]);

  const handleError = useCallback(() => {
    if (imageSrc !== src) {
      setImageSrc(src);
    } else {
      onError?.();
    }
  }, [imageSrc, src, onError]);

  // Progressive loading styles
  const progressiveStyles = useMemo(
    () =>
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
        : {},
    [loadingMode, showProgressive, isLoaded]
  );

  // Standard loading styles
  const standardStyles = useMemo(
    () =>
      loadingMode !== "progressive"
        ? {
            opacity: isLoaded ? 1 : 0.7,
            filter: isLoaded ? "none" : "blur(8px)",
            transition: "opacity 0.3s ease-in-out, filter 0.3s ease-in-out",
          }
        : {},
    [loadingMode, isLoaded]
  );

  const needsProgressiveWrapper = loadingMode === "progressive";

  return {
    imageRef,
    imageSrc,
    isLoaded,
    loadingMode,
    handleLoad,
    handleError,
    progressiveStyles,
    standardStyles,
    needsProgressiveWrapper,
  };
}

