import { describe, expect, it } from "vitest";
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  socialImageUrl,
} from "../socialImage";

const CLOUDINARY_URL =
  "https://res.cloudinary.com/demo/image/upload/v123/photo.jpg";

describe("socialImageUrl", () => {
  it("crops to the share-card ratio every scraper uses", () => {
    // Without the explicit crop, a portrait upload is cropped by the scraper
    // itself, usually through the middle of the subject.
    expect(socialImageUrl(CLOUDINARY_URL)).toBe(
      "https://res.cloudinary.com/demo/image/upload/" +
        `f_auto,q_auto,c_fill,g_auto,w_${OG_IMAGE_WIDTH},h_${OG_IMAGE_HEIGHT}/v123/photo.jpg`
    );
  });

  it("uses 1200x630", () => {
    expect([OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT]).toEqual([1200, 630]);
  });

  it("leaves a non-Cloudinary URL alone", () => {
    expect(socialImageUrl("https://images.example.com/photo.jpg")).toBe(
      "https://images.example.com/photo.jpg"
    );
  });

  it("returns undefined for a missing image rather than a broken URL", () => {
    // A preset with no after image must produce no og:image at all, which is
    // what makes the card fall back to the site default.
    expect(socialImageUrl(undefined)).toBeUndefined();
    expect(socialImageUrl(null)).toBeUndefined();
    expect(socialImageUrl("")).toBeUndefined();
  });
});
