import { FilmSimFormState } from "../../types/filmSim";

export function buildFilmSimVariables(formState: FilmSimFormState) {
  return {
    name: formState.title,
    description: formState.description,
    settings: {
      dynamicRange: formState.settings.dynamicRange,
      filmSimulation: formState.settings.filmSimulation,
      whiteBalance: formState.settings.whiteBalance,
      wbShift: {
        r: formState.settings.wbShift.r || 0,
        b: formState.settings.wbShift.b || 0,
      },
      color: formState.settings.color || 0,
      sharpness: formState.settings.sharpness || 0,
      highlight: formState.settings.highlight || 0,
      shadow: formState.settings.shadow || 0,
      noiseReduction: formState.settings.noiseReduction || 0,
      grainEffect: formState.settings.grainEffect,
      clarity: formState.settings.clarity || 0,
      colorChromeEffect: formState.settings.colorChromeEffect,
      colorChromeFxBlue: formState.settings.colorChromeFxBlue,
    },
    notes: formState.notes,
    tags: formState.tags.map((tag) => tag.toLowerCase()),
    compatibleSensors: formState.compatibleSensors,
    sampleImages: formState.uploadedImageUrls.map((img) => ({
      publicId: img.publicId,
      url: img.url,
    })),
  };
}
