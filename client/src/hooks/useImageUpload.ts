import { useState } from "react";
import { uploadToCloudinary } from "../utils/cloudinary";

interface UploadResult {
  publicId: string;
  url: string;
}

interface UseImageUploadOptions {
  maxFileSize?: number;
  allowedTypes?: string[];
  uploadPreset?: string;
  folder?: string;
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
  const {
    maxFileSize = 25 * 1024 * 1024, // 25MB default
    allowedTypes = ["image/jpeg", "image/png", "image/webp"],
    uploadPreset = "FilmSimSamples",
    folder = "filmsims",
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    if (file.size > maxFileSize) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
      const maxSizeMB = maxFileSize / 1024 / 1024;
      return {
        isValid: false,
        error: `File "${file.name}" is too large (${fileSizeMB}MB). Maximum size is ${maxSizeMB}MB. Please use a smaller file.`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File "${file.name}" is not a supported image type. Please use JPEG, PNG, or WebP`,
      };
    }

    return { isValid: true };
  };

  const uploadImages = async (
    files: File[],
    onSuccess: (files: File[], urls: UploadResult[]) => void
  ) => {
    setFileError(null);

    if (files.length === 0) {
      return;
    }

    const validFiles: File[] = [];
    for (const file of files) {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        setFileError(validation.error || "Invalid file");
        return;
      }
    }

    if (validFiles.length === 0) {
      return;
    }

    try {
      setIsUploading(true);

      const uploadPromises = validFiles.map(async (file) => {
        const { url, publicId } = await uploadToCloudinary(file, {
          uploadPreset,
          folder,
        });
        if (!publicId) {
          throw new Error("No public_id received from Cloudinary");
        }
        return { publicId, url };
      });

      const uploadedImages = await Promise.all(uploadPromises);

      onSuccess(validFiles, uploadedImages);
    } catch (error) {
      setFileError(
        `Failed to upload images to Cloudinary: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    fileError,
    setFileError,
    uploadImages,
    validateFile,
  };
};
