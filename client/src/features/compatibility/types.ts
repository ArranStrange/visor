/**
 * The compatibility domain: does this recipe work on this body, and if not,
 * what exactly is lost?
 *
 * This used to be answered in two places that disagreed — dialIn.ts asked it
 * per camera (with per-body overrides) while fujifilmSensors.ts asked it per
 * sensor generation (without them), so a wallet slot and an upload form could
 * give an X-T3 owner different answers about Clarity. One service now answers
 * it, and getSensorCompatibilityWarnings is a thin adapter over this.
 */

/** In-camera settings whose availability depends on the sensor generation. */
export interface SensorFeatures {
  /** Grain Effect (introduced with X-Trans III, X-Pro2). */
  grainEffect: boolean;
  /** Grain size option (small/large) — 4th generation onward. */
  grainSize: boolean;
  /** Color Chrome Effect — 4th generation onward (also X-H1). */
  colorChromeEffect: boolean;
  /** Color Chrome FX Blue — 4th generation onward. */
  colorChromeFXBlue: boolean;
  /** Clarity — 4th generation onward (not X-T3/X-T30). */
  clarity: boolean;
  /** Classic Negative film simulation — 4th generation onward. */
  classicNegative: boolean;
  /** Nostalgic Negative film simulation — 5th generation / GFX 100S onward. */
  nostalgicNegative: boolean;
  /** Reala Ace film simulation — X100VI / GFX100 II era onward. */
  realaAce: boolean;
}

/** The subset of recipe settings relevant to compatibility checks. */
export interface RecipeCompatibilitySettings {
  clarity?: number | null;
  grainEffect?: string | null;
  colorChromeEffect?: string | null;
  colorChromeFxBlue?: string | null;
  filmSimulation?: string | null;
}

/**
 * Five states, in the order the verdict function tries them. The ladder is
 * deliberately pessimistic: a body only reaches FITS when nothing is lost and
 * the recipe was authored for its generation.
 */
export type CompatibilityStatus =
  /** Every setting applies and the recipe was authored for this generation. */
  | "FITS"
  /**
   * Everything applies, but the recipe declares other sensor generations —
   * the values were tuned elsewhere and may want adjusting.
   */
  | "FITS_WITH_SUBSTITUTIONS"
  /** The film simulation is available but some settings are not. */
  | "PARTIAL"
  /** The body isn't in the catalogue (or none is set): nothing was checked. */
  | "UNVERIFIED"
  /** The body cannot render the recipe's film simulation at all. */
  | "INCOMPATIBLE";

export interface CompatibilityVerdict {
  status: CompatibilityStatus;
  /** One human-readable sentence per problem; empty when the recipe FITS. */
  reasons: string[];
  /** Display labels of settings this body can't apply, e.g. ["Clarity"]. */
  lost: string[];
  /** Display label of a film simulation the body lacks, if any. */
  missingFilmSimulation: string | null;
}
