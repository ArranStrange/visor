import { useMemo } from "react";
import {
  CloudinaryOptimizer,
  getResponsiveImageSrcSet,
} from "../utils/cloudinary";

export const useCloudinary = (
  url: string,
  aspectRatio: "1:1" | "3:4" | "2:3" | "4:5" = "3:4"
) => {
  const optimizedUrls = useMemo(() => {
    if (!url) return null;

    return {
      thumbnail: CloudinaryOptimizer.getThumbnail(url, aspectRatio),
      progressive: CloudinaryOptimizer.getProgressive(url),
      responsive: CloudinaryOptimizer.getResponsiveSrcSet(url, aspectRatio),
      srcSet: getResponsiveImageSrcSet(url, [200, 300, 400]),
      lazyLoad: CloudinaryOptimizer.getLazyLoadUrl(url, aspectRatio),
    };
  }, [url, aspectRatio]);

  return optimizedUrls;
};
