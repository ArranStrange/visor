export interface CurvePoint {
  x: number;
  y: number;
}

export interface ToneCurve {
  rgb: CurvePoint[];
  red: CurvePoint[];
  green: CurvePoint[];
  blue: CurvePoint[];
}

export interface GrainSettings {
  amount: number;
  size: number;
  roughness: number;
}

export interface NoiseReductionSettings {
  luminance: number;
  detail: number;
  color: number;
}

export interface VignetteSettings {
  amount: number;
}

export interface ColorChannel {
  hue: number;
  saturation: number;
  luminance: number;
}

export interface OrangeChannel {
  saturation: number;
  luminance: number;
}

export interface GreenChannel {
  hue: number;
  saturation: number;
}

export interface BlueChannel {
  hue: number;
  saturation: number;
}

export interface ColorAdjustments {
  red: ColorChannel;
  orange: OrangeChannel;
  yellow: ColorChannel;
  green: GreenChannel;
  blue: BlueChannel;
}

export interface SplitToningSettings {
  shadowHue: number;
  shadowSaturation: number;
  highlightHue: number;
  highlightSaturation: number;
  balance: number;
}

export interface ColorGradingSettings {
  shadowHue: number;
  shadowSat: number;
  shadowLuminance: number;
  midtoneHue: number;
  midtoneSat: number;
  midtoneLuminance: number;
  highlightHue: number;
  highlightSat: number;
  highlightLuminance: number;
  blending: number;
  globalHue: number;
  globalSat: number;
  perceptual: boolean;
}

export interface PresetSettings {
  // Light settings
  exposure: number;
  contrast: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;

  // Color settings
  temp: number;
  tint: number;
  vibrance: number;
  saturation: number;

  // Effects
  clarity: number;
  dehaze: number;
  grain: GrainSettings;
  vignette: VignetteSettings;
  colorAdjustments: ColorAdjustments;
  splitToning: SplitToningSettings;
  colorGrading?: ColorGradingSettings;

  // Detail
  sharpening: number;
  noiseReduction: NoiseReductionSettings;
}

export interface ImageInput {
  url: string;
  publicId: string;
}

export interface FilmSimSettingsInput {
  dynamicRange: string;
  filmSimulation: string;
  whiteBalance: string;
  wbShift: {
    r: number;
    b: number;
  };
  color: number;
  sharpness: number;
  highlight: number;
  shadow: number;
  noiseReduction: number;
  grainEffect: string;
  clarity: number;
  colorChromeEffect: string;
  colorChromeFxBlue: string;
}

export interface WhiteBalanceShiftInput {
  r: number;
  b: number;
}

export interface CreateFilmSimInput {
  name: string;
  slug: string;
  description?: string;
  type?: string;
  settings?: FilmSimSettingsInput;
  toneCurve?: ToneCurve;
  tagIds?: string[];
  sampleImageIds?: string[];
  notes?: string;
  recommendedPresetIds?: string[];
  compatibleCameras?: string[];
}

export interface UploadPresetInput {
  title: string;
  description?: string;
  settings: PresetSettings;
  toneCurve?: ToneCurve;
  notes?: string;
  tags: string[];
  beforeImage?: ImageInput;
  afterImage?: ImageInput;
  sampleImages?: ImageInput[];
}
