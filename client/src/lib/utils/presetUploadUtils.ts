/// <reference types="vite/client" />

import { ENV_CONFIG } from "config/environment";

export interface ImageInput {
  publicId: string;
  url: string;
}

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (exported for debugging)
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const validatePresetImage = (
  file: File
): { isValid: boolean; error?: string } => {
  // Debug logging
  console.log("File validation:", {
    fileName: file.name,
    fileSize: file.size,
    fileSizeMB: (file.size / 1024 / 1024).toFixed(2),
    maxSize: MAX_FILE_SIZE,
    maxSizeMB: (MAX_FILE_SIZE / 1024 / 1024).toFixed(1),
    isTooBig: file.size > MAX_FILE_SIZE,
  });

  if (file.size > MAX_FILE_SIZE) {
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    const maxSizeMB = (MAX_FILE_SIZE / 1024 / 1024).toFixed(1);
    return {
      isValid: false,
      error: `File size (${fileSizeMB}MB) exceeds the maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: "File must be a JPEG, PNG, or WebP image",
    };
  }

  return { isValid: true };
};

export const uploadPresetImageToCloudinary = async (
  file: File
): Promise<ImageInput> => {
  const cloudName = ENV_CONFIG.CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    throw new Error(
      "Cloudinary cloud name is not configured. Please check your environment variables."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "PresetBeforeAndAfter");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
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
    return {
      publicId: data.public_id,
      url: data.secure_url,
    };
  } catch (error: any) {
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
};
