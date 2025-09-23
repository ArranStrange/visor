export interface SettingConfig {
  key: string;
  label: string;
  spectrum?: string;
  path?: string;
  divider?: number;
}

export interface SectionConfig {
  title: string;
  settings?: SettingConfig[];
  subsections?: {
    title: string;
    settings: SettingConfig[];
  }[];
}

export const COLOR_ORDER = [
  { key: "red", color: "#ff3b30" },
  { key: "orange", color: "#ff9500" },
  { key: "yellow", color: "#ffcc00" },
  { key: "green", color: "#4cd964" },
  { key: "aqua", color: "#5ac8fa" },
  { key: "blue", color: "#007aff" },
  { key: "purple", color: "#af52de" },
  { key: "magenta", color: "#ff2d55" },
];

export const XMP_SECTIONS: SectionConfig[] = [
  {
    title: "Light",
    settings: [
      { key: "exposure", label: "Exposure", divider: 100 },
      { key: "contrast", label: "Contrast", divider: 100 },
      { key: "highlights", label: "Highlights", divider: 100 },
      { key: "shadows", label: "Shadows", divider: 100 },
      { key: "whites", label: "Whites", divider: 100 },
      { key: "blacks", label: "Blacks", divider: 100 },
    ],
  },
  {
    title: "Color",
    settings: [
      {
        key: "temp",
        label: "Temp",
        spectrum:
          "linear-gradient(to right, #4a90e2, #eaeaea, #f7e7b6, #e2c44a)",
      },
      {
        key: "tint",
        label: "Tint",
        spectrum: "linear-gradient(to right, #4ae2a1, #eaeaea, #e24ad6)",
      },
      {
        key: "vibrance",
        label: "Vibrance",
        spectrum:
          "linear-gradient(to right, #444, #3b4a6a, #3b6a4a, #6a6a3b, #6a4a3b, #b94a4a)",
      },
      {
        key: "saturation",
        label: "Saturation",
        spectrum:
          "linear-gradient(to right, #444, #3b4a6a, #3b6a4a, #6a6a3b, #6a4a3b, #b94a4a)",
      },
    ],
  },
  {
    title: "Effects",
    settings: [
      { key: "clarity", label: "Clarity", divider: 100 },
      { key: "dehaze", label: "Dehaze", divider: 100 },
      { key: "texture", label: "Texture", divider: 100 },
    ],
  },
  {
    title: "Split Toning",
    subsections: [
      {
        title: "Shadows",
        settings: [
          { key: "shadowHue", label: "Hue", path: "splitToning", divider: 100 },
          {
            key: "shadowSaturation",
            label: "Saturation",
            path: "splitToning",
            divider: 100,
          },
        ],
      },
      {
        title: "Highlights",
        settings: [
          {
            key: "highlightHue",
            label: "Hue",
            path: "splitToning",
            divider: 100,
          },
          {
            key: "highlightSaturation",
            label: "Saturation",
            path: "splitToning",
            divider: 100,
          },
        ],
      },
      {
        title: "Balance",
        settings: [
          {
            key: "balance",
            label: "Balance",
            path: "splitToning",
            divider: 100,
          },
        ],
      },
    ],
  },
  {
    title: "Grain",
    settings: [
      { key: "grainAmount", label: "Amount", path: "effects", divider: 100 },
      { key: "grainSize", label: "Size", path: "effects", divider: 100 },
      {
        key: "grainFrequency",
        label: "Frequency",
        path: "effects",
        divider: 100,
      },
    ],
  },
  {
    title: "Detail",
    subsections: [
      {
        title: "Sharpening",
        settings: [
          { key: "sharpening", label: "Amount", divider: 100 },
          { key: "sharpenRadius", label: "Radius", divider: 100 },
          { key: "sharpenDetail", label: "Detail", divider: 100 },
          { key: "sharpenEdgeMasking", label: "Edge Masking", divider: 100 },
        ],
      },
      {
        title: "Noise Reduction",
        settings: [
          {
            key: "luminanceSmoothing",
            label: "Luminance Smoothing",
            divider: 100,
          },
          { key: "luminanceDetail", label: "Luminance Detail", divider: 100 },
          {
            key: "luminanceContrast",
            label: "Luminance Contrast",
            divider: 100,
          },
          {
            key: "color",
            label: "Color Noise Reduction",
            path: "noiseReduction",
            divider: 100,
          },
          {
            key: "detail",
            label: "Color Detail",
            path: "noiseReduction",
            divider: 100,
          },
          {
            key: "smoothness",
            label: "Color Smoothness",
            path: "noiseReduction",
            divider: 100,
          },
        ],
      },
    ],
  },
  {
    title: "Lens Corrections",
    settings: [
      {
        key: "lensManualDistortionAmount",
        label: "Manual Distortion",
        path: "lensCorrections",
        divider: 100,
      },
    ],
  },
  {
    title: "Optics",
    settings: [
      {
        key: "vignetteAmount",
        label: "Vignette Amount",
        path: "optics",
        divider: 100,
      },
      {
        key: "vignetteMidpoint",
        label: "Vignette Midpoint",
        path: "optics",
        divider: 100,
      },
    ],
  },
  {
    title: "Transform",
    settings: [
      {
        key: "perspectiveVertical",
        label: "Perspective Vertical",
        path: "transform",
        divider: 100,
      },
      {
        key: "perspectiveHorizontal",
        label: "Perspective Horizontal",
        path: "transform",
        divider: 100,
      },
      {
        key: "perspectiveRotate",
        label: "Perspective Rotate",
        path: "transform",
        divider: 100,
      },
      {
        key: "perspectiveScale",
        label: "Perspective Scale",
        path: "transform",
        divider: 100,
      },
      {
        key: "perspectiveAspect",
        label: "Perspective Aspect",
        path: "transform",
        divider: 100,
      },
    ],
  },
  {
    title: "Effects (Enhanced)",
    settings: [
      {
        key: "postCropVignetteAmount",
        label: "Post-Crop Vignette Amount",
        path: "effects",
        divider: 100,
      },
      {
        key: "postCropVignetteMidpoint",
        label: "Post-Crop Vignette Midpoint",
        path: "effects",
        divider: 100,
      },
      {
        key: "postCropVignetteFeather",
        label: "Post-Crop Vignette Feather",
        path: "effects",
        divider: 100,
      },
      {
        key: "postCropVignetteRoundness",
        label: "Post-Crop Vignette Roundness",
        path: "effects",
        divider: 100,
      },
    ],
  },
  {
    title: "Calibration",
    settings: [
      {
        key: "cameraCalibrationRedPrimaryHue",
        label: "Red Primary Hue",
        path: "calibration",
        divider: 100,
      },
      {
        key: "cameraCalibrationRedPrimarySaturation",
        label: "Red Primary Saturation",
        path: "calibration",
        divider: 100,
      },
      {
        key: "cameraCalibrationGreenPrimaryHue",
        label: "Green Primary Hue",
        path: "calibration",
        divider: 100,
      },
      {
        key: "cameraCalibrationGreenPrimarySaturation",
        label: "Green Primary Saturation",
        path: "calibration",
        divider: 100,
      },
      {
        key: "cameraCalibrationBluePrimaryHue",
        label: "Blue Primary Hue",
        path: "calibration",
        divider: 100,
      },
      {
        key: "cameraCalibrationBluePrimarySaturation",
        label: "Blue Primary Saturation",
        path: "calibration",
        divider: 100,
      },
      {
        key: "cameraCalibrationShadowTint",
        label: "Shadow Tint",
        path: "calibration",
        divider: 100,
      },
    ],
  },
  {
    title: "Crop & Orientation",
    subsections: [
      {
        title: "Crop",
        settings: [
          { key: "cropTop", label: "Top", path: "crop", divider: 100 },
          { key: "cropLeft", label: "Left", path: "crop", divider: 100 },
          { key: "cropBottom", label: "Bottom", path: "crop", divider: 100 },
          { key: "cropRight", label: "Right", path: "crop", divider: 100 },
          { key: "cropAngle", label: "Angle", path: "crop", divider: 100 },
        ],
      },
    ],
  },
];

export const COLOR_MIXER_COLORS = {
  red: "#b94a4a",
  orange: "#b98a4a",
  yellow: "#b9b84a",
  green: "#4ab96b",
  aqua: "#4ab9b9",
  blue: "#4a6ab9",
  purple: "#8a4ab9",
  magenta: "#b94a8a",
};

export const COLOR_MIXER_SETTINGS = [
  { key: "hue", label: "Hue" },
  { key: "saturation", label: "Saturation" },
  { key: "luminance", label: "Luminance" },
];
