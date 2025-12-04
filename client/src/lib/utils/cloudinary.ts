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
    aspectRatio: "3:4" | "2:3" | "4:5" = "3:4"
  ): string {
    const dimensions =
      aspectRatio === "3:4"
        ? { width: 300, height: 400 }
        : aspectRatio === "2:3"
        ? { width: 300, height: 450 }
        : { width: 300, height: 375 }; // 4:5 ratio

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
    aspectRatio: "3:4" | "2:3" | "4:5" = "3:4"
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

    if (aspectRatio === "3:4") {
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
    aspectRatio: "3:4" | "2:3" | "4:5" = "3:4"
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
