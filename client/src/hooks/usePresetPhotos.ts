import { useState } from "react";
import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import {
  MAKE_FEATURED_PHOTO,
  REMOVE_FEATURED_PHOTO,
} from "../graphql/mutations/makeFeaturedPhoto";

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

const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
  apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
};

const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "PresetSamples");
  formData.append("folder", "presets");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to upload image to Cloudinary: ${
          errorData.error?.message || "Unknown error"
        }`
      );
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

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

      const imageUrl = await uploadToCloudinary(photoFile);

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
