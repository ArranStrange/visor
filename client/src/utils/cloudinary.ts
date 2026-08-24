import { ENV_CONFIG } from "../config/environment";

export interface CloudinaryUploadOptions {
  uploadPreset: string;
  folder?: string;
  resourceType?: "image" | "raw";
}

export interface CloudinaryUploadResult {
  url: string;
  publicId?: string;
}

type CloudinaryAspectRatio = "1:1" | "3:4" | "2:3" | "4:5";

const THUMBNAIL_DIMENSIONS: Record<
  CloudinaryAspectRatio,
  { width: number; height: number }
> = {
  "1:1": { width: 300, height: 300 },
  "3:4": { width: 300, height: 400 },
  "2:3": { width: 300, height: 450 },
  "4:5": { width: 300, height: 375 },
};

export const uploadToCloudinary = async (
  file: File,
  { uploadPreset, folder, resourceType = "image" }: CloudinaryUploadOptions
): Promise<CloudinaryUploadResult> => {
  const cloudName = ENV_CONFIG.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error(
      "Cloudinary cloud name is not configured. Please check your environment variables."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  if (folder) {
    formData.append("folder", folder);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to upload to Cloudinary: ${
        errorData.error?.message || "Unknown error"
      }`
    );
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
};

export class CloudinaryOptimizer {
  private static isCloudinaryUrl(url: string): boolean {
    return Boolean(url && url.includes("cloudinary.com"));
  }

  static optimize(
    url: string,
    options: {
      width?: number;
      height?: number;
      quality?: number | "auto";
      format?: "auto" | "webp" | "avif";
      crop?: "fill" | "scale" | "fit";
      gravity?: "auto" | "face" | "center";
      blur?: number;
    } = {}
  ): string {
    if (!this.isCloudinaryUrl(url)) return url;

    const {
      width,
      height,
      quality = "auto",
      format = "auto",
      crop = "fill",
      gravity = "auto",
      blur,
    } = options;

    let transformations = `f_${format},q_${quality},c_${crop}`;

    if (width) transformations += `,w_${width}`;
    if (height) transformations += `,h_${height}`;
    if (gravity !== "auto") transformations += `,g_${gravity}`;
    if (blur) transformations += `,e_blur:${blur}`;

    return url.replace("/upload/", `/upload/${transformations}/`);
  }

  static getThumbnail(
    url: string,
    aspectRatio: CloudinaryAspectRatio = "3:4"
  ): string {
    const dimensions = THUMBNAIL_DIMENSIONS[aspectRatio];

    return this.optimize(url, {
      ...dimensions,
      crop: "fill",
      gravity: "auto",
      quality: "auto",
    });
  }

  static getProgressive(url: string): string {
    return this.optimize(url, {
      width: 50,
      quality: 10,
      crop: "scale",
      blur: 1000,
    });
  }

  static getResponsiveSrcSet(
    url: string,
    aspectRatio: CloudinaryAspectRatio = "3:4"
  ): {
    mobile: string;
    tablet: string;
    desktop: string;
  } {
    const baseOptions = {
      crop: "fill" as const,
      gravity: "auto" as const,
      quality: "auto" as const,
    };

    if (aspectRatio === "1:1") {
      return {
        mobile: this.optimize(url, { ...baseOptions, width: 200, height: 200 }),
        tablet: this.optimize(url, { ...baseOptions, width: 300, height: 300 }),
        desktop: this.optimize(url, {
          ...baseOptions,
          width: 400,
          height: 400,
        }),
      };
    } else if (aspectRatio === "3:4") {
      return {
        mobile: this.optimize(url, { ...baseOptions, width: 200, height: 267 }),
        tablet: this.optimize(url, { ...baseOptions, width: 300, height: 400 }),
        desktop: this.optimize(url, {
          ...baseOptions,
          width: 400,
          height: 533,
        }),
      };
    } else if (aspectRatio === "2:3") {
      return {
        mobile: this.optimize(url, { ...baseOptions, width: 200, height: 300 }),
        tablet: this.optimize(url, { ...baseOptions, width: 300, height: 450 }),
        desktop: this.optimize(url, {
          ...baseOptions,
          width: 400,
          height: 600,
        }),
      };
    } else {
      // 4:5 ratio
      return {
        mobile: this.optimize(url, { ...baseOptions, width: 200, height: 250 }),
        tablet: this.optimize(url, { ...baseOptions, width: 300, height: 375 }),
        desktop: this.optimize(url, {
          ...baseOptions,
          width: 400,
          height: 500,
        }),
      };
    }
  }

  static getLazyLoadUrl(
    url: string,
    aspectRatio: CloudinaryAspectRatio = "3:4"
  ): {
    placeholder: string;
    full: string;
  } {
    return {
      placeholder: this.getProgressive(url),
      full: this.getThumbnail(url, aspectRatio),
    };
  }
}

export const optimizeImageUrl = (
  url: string | null | undefined,
  width = 800
): string | undefined => {
  if (!url) return undefined;
  if (!url.includes("res.cloudinary.com/") || !url.includes("/upload/v")) {
    return url;
  }
  return url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`);
};

export const getResponsiveImageSrcSet = (
  url: string | null | undefined,
  widths: readonly number[]
): string | undefined => {
  if (
    !url ||
    !url.includes("res.cloudinary.com/") ||
    !url.includes("/upload/v")
  ) {
    return undefined;
  }

  return widths
    .map((width) => `${optimizeImageUrl(url, width)} ${width}w`)
    .join(", ");
};
