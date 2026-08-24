import { useState } from "react";
import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import {
  MAKE_FEATURED_PHOTO,
  REMOVE_FEATURED_PHOTO,
} from "../graphql/mutations/makeFeaturedPhoto";
import { uploadToCloudinary } from "../utils/cloudinary";

const ADD_PHOTO_TO_PRESET = gql`
  mutation AddPhotoToPreset(
    $presetId: ID!
    $imageUrl: String!
    $caption: String
  ) {
    addPhotoToPreset(
      presetId: $presetId
      imageUrl: $imageUrl
      caption: $caption
    ) {
      id
      url
      caption
    }
  }
`;

export const usePresetPhotos = (presetId: string) => {
  const [addPhotoToPreset, { loading: addingPhoto }] =
    useMutation(ADD_PHOTO_TO_PRESET);
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

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;

    try {
      setUploadingPhoto(true);

      const { url: imageUrl } = await uploadToCloudinary(photoFile, {
        uploadPreset: "PresetSamples",
        folder: "presets",
      });

      await addPhotoToPreset({
        variables: {
          presetId,
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
  };

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
      window.location.reload();
    } catch (error) {
      console.error("Error toggling featured photo status:", error);
    }
  };

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
};
