import { useMemo } from "react";
import { CloudinaryOptimizer } from "lib/utils/cloudinary";

export const useCloudinary = (
  url: string,
  aspectRatio: "3:4" | "2:3" = "3:4"
) => {
  const optimizedUrls = useMemo(() => {
    if (!url) return null;

    return {
      thumbnail: CloudinaryOptimizer.getThumbnail(url, aspectRatio),
      progressive: CloudinaryOptimizer.getProgressive(url),
      responsive: CloudinaryOptimizer.getResponsiveSrcSet(url, aspectRatio),
      lazyLoad: CloudinaryOptimizer.getLazyLoadUrl(url, aspectRatio),
    };
  }, [url, aspectRatio]);

  return optimizedUrls;
};
