/**
 * Turns a sample image into an Open Graph share card.
 *
 * The 1200x630 ratio is what Facebook, Twitter/X, Slack and LinkedIn all crop
 * to; handing them an untransformed portrait upload means they crop it
 * themselves, usually through the middle of the subject. `c_fill` with
 * `g_auto` lets Cloudinary pick the crop, and the explicit size keeps the card
 * well under the 5MB most scrapers will fetch.
 *
 * Non-Cloudinary and already-transformed URLs pass through untouched, matching
 * optimizeImageUrl's behaviour.
 */

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

const OG_TRANSFORM = `f_auto,q_auto,c_fill,g_auto,w_${OG_IMAGE_WIDTH},h_${OG_IMAGE_HEIGHT}`;

export const socialImageUrl = (
  url: string | null | undefined
): string | undefined => {
  if (!url) return undefined;
  if (!url.includes("res.cloudinary.com/") || !url.includes("/upload/v")) {
    return url;
  }
  return url.replace("/upload/", `/upload/${OG_TRANSFORM}/`);
};
