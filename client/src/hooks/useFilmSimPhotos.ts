import { useState } from "react";
import { useMutation } from "@apollo/client";
import {
  MAKE_FEATURED_PHOTO,
  REMOVE_FEATURED_PHOTO,
} from "../graphql/mutations/makeFeaturedPhoto";

export const useFilmSimPhotos = () => {
  const [makeFeaturedPhoto] = useMutation(MAKE_FEATURED_PHOTO);
  const [removeFeaturedPhoto] = useMutation(REMOVE_FEATURED_PHOTO);

  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [currentImageFeatured, setCurrentImageFeatured] =
    useState<boolean>(false);

  const handleImageClick = (
    url: string,
    imageId?: string,
    isFeatured?: boolean
  ) => {
    setFullscreenImage(url);
    if (imageId) {
      setCurrentImageId(imageId);
      setCurrentImageFeatured(isFeatured || false);
    }
  };

  const handleToggleFeaturedPhoto = async () => {
    if (!currentImageId) return;

    try {
      if (currentImageFeatured) {
        await removeFeaturedPhoto({ variables: { imageId: currentImageId } });
        setCurrentImageFeatured(false);
      } else {
        await makeFeaturedPhoto({ variables: { imageId: currentImageId } });
        setCurrentImageFeatured(true);
      }
    } catch (error) {
      // Error toggling featured photo status
    }
  };

  return {
    fullscreenImage,
    setFullscreenImage,
    currentImageId,
    currentImageFeatured,
    handleImageClick,
    handleToggleFeaturedPhoto,
  };
};
