import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import type { DocumentNode } from "@apollo/client";
import { MAKE_FEATURED_PHOTO, REMOVE_FEATURED_PHOTO } from "../graphql/featured";
import { uploadToCloudinary } from "../utils/cloudinary";

// Stand-in mutation doc so useMutation always has something valid to parse
// even when the caller doesn't support adding photos yet (e.g. film sims).
const NOOP_ADD_PHOTO = gql`
  mutation NoopAddPhoto {
    __typename
  }
`;

interface UseContentPhotosOptions {
  contentId: string;
  addPhotoMutation?: DocumentNode;
  reloadOnFeaturedToggle?: boolean;
}

export const useContentPhotos = ({
  contentId,
  addPhotoMutation,
  reloadOnFeaturedToggle = false,
}: UseContentPhotosOptions) => {
  const [addPhotoToContent, { loading: addingPhoto }] = useMutation(
    addPhotoMutation ?? NOOP_ADD_PHOTO
  );
  const [makeFeaturedPhoto] = useMutation(MAKE_FEATURED_PHOTO);
  const [removeFeaturedPhoto] = useMutation(REMOVE_FEATURED_PHOTO);

  const [addPhotoDialogOpen, setAddPhotoDialogOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoCaption, setPhotoCaption] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [currentImageFeatured, setCurrentImageFeatured] =
    useState<boolean>(false);

  return {
    addPhotoDialogOpen,
    setAddPhotoDialogOpen,
    photoFile,
    photoCaption,
    setPhotoCaption,
    uploadingPhoto,
    fullscreenImage,
    setFullscreenImage,
    currentImageId,
    currentImageFeatured,
    addingPhoto,
    handlePhotoFileChange,
    handlePhotoUpload,
    handleImageClick,
    handleToggleFeaturedPhoto,
  };

  function handlePhotoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
    }
  }

  async function handlePhotoUpload() {
    if (!photoFile || !addPhotoMutation) return;

    try {
      setUploadingPhoto(true);

      const { url: imageUrl } = await uploadToCloudinary(photoFile, {
        uploadPreset: "PresetSamples",
        folder: "presets",
      });

      await addPhotoToContent({
        variables: {
          presetId: contentId,
          imageUrl,
          caption: photoCaption || undefined,
        },
      });

      setPhotoFile(null);
      setPhotoCaption("");
      setAddPhotoDialogOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error uploading photo:", error);
    } finally {
      setUploadingPhoto(false);
    }
  }

  function handleImageClick(
    url: string,
    imageId?: string,
    isFeatured?: boolean
  ) {
    setFullscreenImage(url);
    if (imageId) {
      setCurrentImageId(imageId);
      setCurrentImageFeatured(isFeatured || false);
    }
  }

  async function handleToggleFeaturedPhoto() {
    if (!currentImageId) return;

    try {
      if (currentImageFeatured) {
        await removeFeaturedPhoto({ variables: { imageId: currentImageId } });
        setCurrentImageFeatured(false);
      } else {
        await makeFeaturedPhoto({ variables: { imageId: currentImageId } });
        setCurrentImageFeatured(true);
      }
      if (reloadOnFeaturedToggle) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error toggling featured photo status:", error);
    }
  }
};
