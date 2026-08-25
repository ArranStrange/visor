export const FILM_SIM_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  CLOUDINARY_PRESET: "FilmSimSamples",
  CLOUDINARY_FOLDER: "filmsims",
} as const;

export const DEFAULT_FILM_SIM_SETTINGS = {
  dynamicRange: null,
  filmSimulation: "PROVIA",
  whiteBalance: "AUTO",
  wbShift: { r: 0, b: 0 },
  color: 0,
  sharpness: 0,
  highlight: 0,
  shadow: 0,
  noiseReduction: 0,
  grainEffect: "OFF",
  clarity: 0,
  colorChromeEffect: "OFF",
  colorChromeFxBlue: "OFF",
} as const;
