// Option lists mirror the Fujifilm in-camera menus (verified against the
// official fujifilm-dsc.com manuals for X-T5/X100VI/X-T4/GFX100 II).

export const DYNAMIC_RANGE_OPTIONS = [
  { value: null, label: "Auto" },
  // Min ISO depends on the body's base ISO: DR200 needs ≥2× base,
  // DR400 needs ≥4× base (e.g. 250/500 on X-T5, 320/640 on X-T4).
  { value: 100, label: "DR100" },
  { value: 200, label: "DR200 (min ISO 2× base)" },
  { value: 400, label: "DR400 (min ISO 4× base)" },
];

export const FILM_SIMULATION_OPTIONS = [
  { value: "PROVIA", label: "Provia (Standard)" },
  { value: "VELVIA", label: "Velvia (Vivid)" },
  { value: "ASTIA", label: "Astia (Soft)" },
  { value: "CLASSIC_CHROME", label: "Classic Chrome" },
  { value: "REALA_ACE", label: "Reala Ace" },
  { value: "PRO_NEG_HI", label: "Pro Neg. Hi" },
  { value: "PRO_NEG_STD", label: "Pro Neg. Std" },
  { value: "CLASSIC_NEG", label: "Classic Neg" },
  { value: "NOSTALGIC_NEG", label: "Nostalgic Neg" },
  { value: "ETERNA", label: "Eterna (Cinema)" },
  { value: "ETERNA_BLEACH", label: "Eterna Bleach Bypass" },
  { value: "ACROS", label: "Acros" },
  { value: "ACROS_YE", label: "Acros +Ye" },
  { value: "ACROS_R", label: "Acros +R" },
  { value: "ACROS_G", label: "Acros +G" },
  { value: "MONOCHROME", label: "Monochrome" },
  { value: "MONOCHROME_YE", label: "Monochrome +Ye" },
  { value: "MONOCHROME_R", label: "Monochrome +R" },
  { value: "MONOCHROME_G", label: "Monochrome +G" },
  { value: "SEPIA", label: "Sepia" },
];

export const WHITE_BALANCE_OPTIONS = [
  { value: "AUTO_WHITE_PRIORITY", label: "Auto (White Priority)" },
  { value: "AUTO", label: "Auto" },
  { value: "AUTO_AMBIENCE", label: "Auto (Ambience Priority)" },
  { value: "CUSTOM", label: "Custom (Measured)" },
  { value: "COLOR_TEMPERATURE", label: "Color Temperature (K)" },
  { value: "DAYLIGHT", label: "Daylight" },
  { value: "SHADE", label: "Shade" },
  { value: "FLUORESCENT_1", label: "Fluorescent Light 1 (Daylight)" },
  { value: "FLUORESCENT_2", label: "Fluorescent Light 2 (Warm White)" },
  { value: "FLUORESCENT_3", label: "Fluorescent Light 3 (Cool White)" },
  { value: "INCANDESCENT", label: "Incandescent" },
  { value: "UNDERWATER", label: "Underwater" },
];

// Highlight/Shadow Tone: −2…+4, half steps from the X-T4 generation onward.
export const TONE_CURVE_OPTIONS = [
  { value: -2, label: "-2" },
  { value: -1.5, label: "-1.5" },
  { value: -1, label: "-1" },
  { value: -0.5, label: "-0.5" },
  { value: 0, label: "0 (Standard)" },
  { value: 0.5, label: "+0.5" },
  { value: 1, label: "+1" },
  { value: 1.5, label: "+1.5" },
  { value: 2, label: "+2" },
  { value: 2.5, label: "+2.5" },
  { value: 3, label: "+3" },
  { value: 3.5, label: "+3.5" },
  { value: 4, label: "+4" },
];

export const SHARPNESS_OPTIONS = [
  { value: -4, label: "-4" },
  { value: -3, label: "-3" },
  { value: -2, label: "-2" },
  { value: -1, label: "-1" },
  { value: 0, label: "0 (Standard)" },
  { value: 1, label: "+1" },
  { value: 2, label: "+2" },
  { value: 3, label: "+3" },
  { value: 4, label: "+4" },
];

export const COLOR_OPTIONS = [
  { value: -4, label: "-4" },
  { value: -3, label: "-3" },
  { value: -2, label: "-2" },
  { value: -1, label: "-1" },
  { value: 0, label: "0 (Standard)" },
  { value: 1, label: "+1" },
  { value: 2, label: "+2" },
  { value: 3, label: "+3" },
  { value: 4, label: "+4" },
];

export const NOISE_REDUCTION_OPTIONS = [
  { value: -4, label: "-4" },
  { value: -3, label: "-3" },
  { value: -2, label: "-2" },
  { value: -1, label: "-1" },
  { value: 0, label: "0 (Standard)" },
  { value: 1, label: "+1" },
  { value: 2, label: "+2" },
  { value: 3, label: "+3" },
  { value: 4, label: "+4" },
];

export const GRAIN_EFFECT_OPTIONS = [
  { value: "OFF", label: "Off" },
  { value: "WEAK_SMALL", label: "Weak / Small" },
  { value: "WEAK_LARGE", label: "Weak / Large" },
  { value: "STRONG_SMALL", label: "Strong / Small" },
  { value: "STRONG_LARGE", label: "Strong / Large" },
];

export const CLARITY_OPTIONS = [
  { value: -5, label: "-5 (Softest)" },
  { value: -4, label: "-4" },
  { value: -3, label: "-3" },
  { value: -2, label: "-2" },
  { value: -1, label: "-1" },
  { value: 0, label: "0 (Standard)" },
  { value: 1, label: "+1" },
  { value: 2, label: "+2" },
  { value: 3, label: "+3" },
  { value: 4, label: "+4" },
  { value: 5, label: "+5 (Crispest)" },
];

export const COLOR_CHROME_EFFECT_OPTIONS = [
  { value: "OFF", label: "Off" },
  { value: "WEAK", label: "Weak" },
  { value: "STRONG", label: "Strong" },
];

export const COLOR_CHROME_FX_BLUE_OPTIONS = [
  { value: "OFF", label: "Off" },
  { value: "WEAK", label: "Weak" },
  { value: "STRONG", label: "Strong" },
];
