import { describe, expect, it } from "vitest";
import { getResponsiveImageSrcSet, optimizeImageUrl } from "../cloudinary";

const CLOUDINARY_URL =
  "https://res.cloudinary.com/demo/image/upload/v123/photo.jpg";

describe("Cloudinary image URL helpers", () => {
  it("inserts an image transform into a Cloudinary upload URL", () => {
    expect(optimizeImageUrl(CLOUDINARY_URL, 640)).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_640/v123/photo.jpg"
    );
  });

  it("leaves an already-transformed URL unchanged", () => {
    const transformedUrl =
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_320/v123/photo.jpg";

    expect(optimizeImageUrl(transformedUrl, 640)).toBe(transformedUrl);
  });

  it("leaves a non-Cloudinary URL unchanged and provides no srcset", () => {
    const externalUrl = "https://images.example.com/photo.jpg";

    expect(optimizeImageUrl(externalUrl, 640)).toBe(externalUrl);
    expect(getResponsiveImageSrcSet(externalUrl, [320, 640])).toBeUndefined();
  });

  it("uses each requested width in the URL and its width descriptor", () => {
    expect(getResponsiveImageSrcSet(CLOUDINARY_URL, [240, 480, 960])).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_240/v123/photo.jpg 240w, " +
        "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_480/v123/photo.jpg 480w, " +
        "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_960/v123/photo.jpg 960w"
    );
  });
});
