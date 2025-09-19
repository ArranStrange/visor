import { useState } from "react";

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

  const uploadToCloudinary = async (file: File): Promise<UploadResult> => {
    console.log("Starting Cloudinary upload for file:", file.name);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    try {
      console.log("Uploading to Cloudinary...");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Cloudinary upload error:", errorData);
        throw new Error(
          `Failed to upload image to Cloudinary: ${
            errorData.error?.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      console.log("Cloudinary upload response:", data);

      const publicId = data.public_id;
      if (!publicId) {
        throw new Error("No public_id received from Cloudinary");
      }

      return {
        publicId,
        url: data.secure_url,
      };
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  };

  const uploadImages = async (
    files: File[],
    onSuccess: (files: File[], urls: UploadResult[]) => void
  ) => {
    setFileError(null);

    if (files.length === 0) {
      console.log("No files selected");
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
      console.log("No valid files after validation");
      return;
    }

    try {
      setIsUploading(true);
      console.log("Starting upload process...");

      const uploadPromises = validFiles.map(async (file) => {
        const result = await uploadToCloudinary(file);
        return result;
      });

      const uploadedImages = await Promise.all(uploadPromises);
      console.log("All images uploaded successfully:", uploadedImages);

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
