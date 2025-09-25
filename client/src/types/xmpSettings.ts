export interface ParsedSettings {
  version?: string;
  processVersion?: string;
  cameraProfile?: string;
  cameraProfileDigest?: string;
  profileName?: string;
  lookTableName?: string;
  whiteBalance?: string;

  exposure?: number;
  contrast?: number;
  highlights?: number;
  shadows?: number;
  whites?: number;
  blacks?: number;
  clarity?: number;
  dehaze?: number;
  texture?: number;
  vibrance?: number;
  saturation?: number;
  temp?: number;
  tint?: number;

  toneCurveName?: string;
  toneCurve?: {
    rgb: Array<{ x: number; y: number }>;
    red: Array<{ x: number; y: number }>;
    green: Array<{ x: number; y: number }>;
    blue: Array<{ x: number; y: number }>;
  };

  colorAdjustments?: {
    red?: {
      hue: number;
      saturation: number;
      luminance: number;
    };
    orange?: {
      hue: number;
      saturation: number;
      luminance: number;
    };
    yellow?: {
      hue: number;
      saturation: number;
      luminance: number;
    };
    green?: {
      hue: number;
      saturation: number;
      luminance: number;
    };
    aqua?: {
      hue: number;
      saturation: number;
      luminance: number;
    };
    blue?: {
      hue: number;
      saturation: number;
      luminance: number;
    };
    purple?: {
      hue: number;
      saturation: number;
      luminance: number;
    };
    magenta?: {
      hue: number;
      saturation: number;
      luminance: number;
    };
  };

  splitToning?: {
    shadowHue: number;
    shadowSaturation: number;
    highlightHue: number;
    highlightSaturation: number;
    balance: number;
  };

  colorGrading?: {
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
    balance: number;
    globalHue: number;
    globalSat: number;
    perceptual: boolean;
  };

  detail?: {
    sharpness: number;
    sharpenRadius: number;
    sharpenDetail: number;
    sharpenEdgeMasking: number;
    luminanceSmoothing: number;
    luminanceDetail: number;
    luminanceContrast: number;
    colorNoiseReduction: number;
    colorNoiseReductionDetail: number;
    colorNoiseReductionSmoothness: number;
  };

  settings?: {
    exposure?: number;
    contrast?: number;
    highlights?: number;
    shadows?: number;
    whites?: number;
    blacks?: number;
    clarity?: number;
    dehaze?: number;
    texture?: number;
    vibrance?: number;
    saturation?: number;
    temp?: number;
    tint?: number;
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
      smoothness?: number;
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
  };

  lensCorrections?: {
    enableLensProfileCorrections: boolean;
    lensProfileName: string;
    lensManualDistortionAmount: number;
    perspectiveUpright: string;
    autoLateralCA: boolean;
  };

  optics?: {
    removeChromaticAberration: boolean;
    vignetteAmount: number;
    vignetteMidpoint: number;
  };

  transform?: {
    perspectiveVertical: number;
    perspectiveHorizontal: number;
    perspectiveRotate: number;
    perspectiveScale: number;
    perspectiveAspect: number;
    autoPerspective: boolean;
  };

  effects?: {
    postCropVignetteAmount: number;
    postCropVignetteMidpoint: number;
    postCropVignetteFeather: number;
    postCropVignetteRoundness: number;
    postCropVignetteStyle: string;
    grainAmount: number;
    grainSize: number;
    grainFrequency: number;
  };

  calibration?: {
    cameraCalibrationBluePrimaryHue: number;
    cameraCalibrationBluePrimarySaturation: number;
    cameraCalibrationGreenPrimaryHue: number;
    cameraCalibrationGreenPrimarySaturation: number;
    cameraCalibrationRedPrimaryHue: number;
    cameraCalibrationRedPrimarySaturation: number;
    cameraCalibrationShadowTint: number;
    cameraCalibrationVersion: string;
  };

  crop?: {
    cropTop: number;
    cropLeft: number;
    cropBottom: number;
    cropRight: number;
    cropAngle: number;
    cropConstrainToWarp: boolean;
  };
  orientation?: string;

  metadata?: {
    rating: number;
    label: string;
    title: string;
    creator: string;
    dateCreated: string;
  };

  hasSettings?: boolean;
  rawFileName?: string;
  snapshot?: string;
}
