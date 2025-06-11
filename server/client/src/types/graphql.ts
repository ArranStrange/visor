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

  // Detail
  sharpening: number;
  noiseReduction: NoiseReductionSettings;
}

export interface UploadPresetInput {
  title: string;
  description?: string;
  tags: string[];
  settings: PresetSettings;
  toneCurve?: ToneCurve;
  notes?: string;
  beforeImage?: File;
  afterImage?: File;
}
