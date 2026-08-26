import type { ParsedSettings } from "./xmpSettings";

export interface CurvePoint {
  x: number;
  y: number;
}

export interface ImageSummary {
  id?: string;
  url: string;
  publicId?: string;
  caption?: string;
  isFeaturedPhoto?: boolean;
}

export interface TagSummary {
  id?: string;
  name?: string;
  displayName: string;
}

/**
 * Shape returned by the account-management mutations (password reset, change
 * password/email, delete account). Hand-maintained: there is no codegen, so
 * this mirrors SimpleResponse in server/schema/typeDefs/user.js.
 */
export interface SimpleResponse {
  success: boolean;
  message: string;
}

export interface UserSummary {
  id: string;
  username: string;
  avatar?: string;
  instagram?: string;
}

/**
 * Moderation types. Hand-maintained: there is no codegen, so these mirror
 * server/schema/typeDefs/report.js — keep the unions in step with the enums
 * there, which are in turn the Report model's enums.
 */
export type ReportTargetType =
  | "PRESET"
  | "FILMSIM"
  | "IMAGE"
  | "DISCUSSION_POST";

export type ReportReason =
  | "SPAM"
  | "STOLEN_CONTENT"
  | "INAPPROPRIATE"
  | "ABUSE"
  | "OTHER";

export type ReportStatus = "OPEN" | "ACTIONED" | "DISMISSED";

export interface Report {
  id: string;
  /** Null once the reporter's account has been deleted. */
  reporter?: UserSummary | null;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  detail?: string | null;
  /**
   * In-app path for presets, film sims and discussions; the file's own URL for
   * an image. Null once the reported content has been deleted.
   */
  targetUrl?: string | null;
  status: ReportStatus;
  resolvedBy?: UserSummary | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedReports {
  reports: Report[];
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
}

export interface PresetSummary {
  id: string;
  title: string;
  slug: string;
  description?: string;
  afterImage?: ImageSummary | null;
  beforeImage?: ImageSummary | null;
  creator?: UserSummary;
  tags?: TagSummary[];
  featured?: boolean;
  /** Denormalised count of `likes`, so a card need not fetch the array. */
  likeCount?: number;
  downloads?: number;
}

export interface FilmSimSummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sampleImages?: ImageSummary[];
  creator?: UserSummary;
  tags?: TagSummary[];
  featured?: boolean;
  /**
   * Denormalised count of `likes`. Not `likes.length`: film sims that predate
   * the likes-model fix carry their historical count here with an empty
   * `likes` array (#128).
   */
  likeCount?: number;
  downloads?: number;
}

export interface PresetDetailSettings {
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
  grain?: Partial<GrainSettings>;
  vignette?: Partial<VignetteSettings>;
  sharpening?: number;
  sharpenRadius?: number;
  sharpenDetail?: number;
  sharpenEdgeMasking?: number;
  luminanceSmoothing?: number;
  luminanceDetail?: number;
  luminanceContrast?: number;
  noiseReduction?: Partial<NoiseReductionSettings> & {
    colorSmoothness?: number;
  };
  colorAdjustments?: ParsedSettings["colorAdjustments"];
  splitToning?: ParsedSettings["splitToning"];
}

export interface PresetDetail
  extends
    PresetSummary,
    Pick<
      ParsedSettings,
      | "version"
      | "processVersion"
      | "cameraProfile"
      | "cameraProfileDigest"
      | "profileName"
      | "lookTableName"
      | "whiteBalance"
      | "colorGrading"
      | "effects"
      | "lensCorrections"
      | "optics"
      | "transform"
      | "calibration"
      | "crop"
      | "orientation"
    > {
  description?: string;
  xmpUrl?: string;
  settings?: PresetDetailSettings;
  toneCurve?: ToneCurve;
  notes?: string;
  tags: Array<TagSummary & { id: string }>;
  sampleImages?: Array<ImageSummary & { id: string }>;
  likes?: Array<{ id: string }>;
  downloads?: number;
  createdAt?: string;
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
  balance: number;
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

/**
 * Typed filter for `listPresets`. Mirrors PresetFilterInput in
 * server/schema/typeDefs/preset.js — the server allow-lists these fields, so
 * anything not listed here is rejected rather than passed to Mongo (#126).
 */
export interface PresetFilterInput {
  tagId?: string;
  featured?: boolean;
  ids?: string[];
  /** Exact title match; removed when Phase 3 adds a `search` argument. */
  title?: string;
}

/** Typed filter for `listFilmSims`. Mirrors FilmSimFilterInput. */
export interface FilmSimFilterInput {
  tagId?: string;
  featured?: boolean;
  ids?: string[];
  /** Sensor generation slug, e.g. "x-trans-iv". */
  sensorKey?: string;
  /** Camera body name; resolved to its sensor generation server-side. */
  cameraName?: string;
  /** Exact name match; same deprecation window as PresetFilterInput.title. */
  name?: string;
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
  compatibleSensors?: string[];
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
