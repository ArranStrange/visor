import { uploadToCloudinary } from "@/utils/cloudinary";

export interface ImageInput {
  publicId: string;
  url: string;
}

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (exported for debugging)
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const validatePresetImage = (
  file: File
): { isValid: boolean; error?: string } => {
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

/**
 * Upload the original .xmp file to Cloudinary as a raw resource so preset
 * settings can always be re-derived from the source file.
 */
export const uploadXmpToCloudinary = async (file: File): Promise<string> => {
  const { url } = await uploadToCloudinary(file, {
    uploadPreset: "PresetBeforeAndAfter",
    resourceType: "raw",
  });
  return url;
};

export const uploadPresetImageToCloudinary = async (
  file: File
): Promise<ImageInput> => {
  const { url, publicId } = await uploadToCloudinary(file, {
    uploadPreset: "PresetBeforeAndAfter",
  });
  return { publicId: publicId ?? "", url };
};
