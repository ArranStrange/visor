export interface PresetSettings {
  exposure?: number;
  contrast?: number;
  highlights?: number;
  shadows?: number;
  whites?: number;
  blacks?: number;
  temp?: number;
  tint?: number;
  vibrance?: number;
  saturation?: number;
  clarity?: number;
  dehaze?: number;
  texture?: number;
  sharpening?: number;
  sharpenRadius?: number;
  sharpenDetail?: number;
  sharpenEdgeMasking?: number;
  luminanceSmoothing?: number;
  luminanceDetail?: number;
  luminanceContrast?: number;
  noiseReduction?: {
    luminance?: number;
    detail?: number;
    color?: number;
    colorSmoothness?: number;
  };
  grain?: {
    amount?: number;
    size?: number;
    roughness?: number;
  };
  colorAdjustments?: {
    red?: { hue: number; saturation: number; luminance: number };
    orange?: { hue: number; saturation: number; luminance: number };
    yellow?: { hue: number; saturation: number; luminance: number };
    green?: { hue: number; saturation: number; luminance: number };
    aqua?: { hue: number; saturation: number; luminance: number };
    blue?: { hue: number; saturation: number; luminance: number };
    purple?: { hue: number; saturation: number; luminance: number };
    magenta?: { hue: number; saturation: number; luminance: number };
  };
}

export interface ToneCurvePoint {
  x: number;
  y: number;
}

export interface ToneCurve {
  rgb?: ToneCurvePoint[];
  red?: ToneCurvePoint[];
  green?: ToneCurvePoint[];
  blue?: ToneCurvePoint[];
}

export interface PresetData {
  title: string;
  description?: string;
  settings: PresetSettings;
  toneCurve?: ToneCurve;
  whiteBalance?: string;
  cameraProfile?: string;
  profileName?: string;
  version?: string;
  processVersion?: string;
  creator?: string;
  dateCreated?: string;
}
