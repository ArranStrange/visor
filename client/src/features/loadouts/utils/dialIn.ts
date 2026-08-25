import { findCamera, normalizeCameraName } from "@/constants/fujifilmCameras";
import { getSensorByKey } from "@/features/film-sims/utils/fujifilmSensors";
import type { FilmSimSettings } from "@/features/film-sims/types/filmSim";
import {
  DIAL_IN_STEP_ORDER,
  MENU_PATHS,
  ENTER_BANK_PATH,
  ENTER_BANK_VERIFIED,
  SETTING_DEFAULTS,
  CAMERA_FEATURE_OVERRIDES,
  CAMERA_SIM_OVERRIDES,
  type DialInStepKey,
} from "@/features/loadouts/constants/menuPaths";

// Pure step-sequence builder for dial-in mode. All decisions live here so
// the player component stays presentational and this logic stays testable.
//
// Rules (issue #100 review round):
// - Never skip an explicitly specified value — 0/OFF is an instruction,
//   because a bank retains whatever it previously held.
// - Unspecified (null/absent) settings become explicit "set the default"
//   steps for the same reason. Nothing is silently skipped.
// - Settings the body can't do are excluded from the flow but summarized,
//   EXCEPT an unsupported film simulation, which renders as a warning step
//   — the recipe is meaningless without it.
// - Bodies whose menu paths aren't transcribed get value-only guidance;
//   a wrong "verified" path is worse than none.

export interface DialInStep {
  key: DialInStepKey | "enterBank";
  label: string;
  /** The value to set, formatted the way the camera displays it. */
  value: string;
  /** Menu path segments; null = value-only mode (paths not transcribed). */
  path: string[] | null;
  /** Secondary guidance: defaults, ISO floors, zero reminders. */
  hint?: string;
  /** Hard problem with this step (unsupported film simulation). */
  warning?: string;
}

export interface DialInPlan {
  steps: DialInStep[];
  /** Settings excluded because the body doesn't have them. */
  skipped: { key: DialInStepKey; label: string }[];
  /** Body-level caveat rendered above the flow, if any. */
  caveat: string | null;
}

export const STEP_LABELS: Record<DialInStepKey, string> = {
  filmSimulation: "Film Simulation",
  grainEffect: "Grain Effect",
  colorChromeEffect: "Color Chrome Effect",
  colorChromeFxBlue: "Color Chrome FX Blue",
  whiteBalance: "White Balance",
  dynamicRange: "Dynamic Range",
  highlight: "Highlight Tone",
  shadow: "Shadow Tone",
  color: "Color",
  sharpness: "Sharpness",
  noiseReduction: "Noise Reduction",
  clarity: "Clarity",
};

/** "+2" / "-1" / "0" — the way the camera shows signed settings. */
export const formatSigned = (n: number): string => (n > 0 ? `+${n}` : `${n}`);

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

/** Format one setting's value for the step screen. */
export const formatStepValue = (
  key: DialInStepKey,
  settings: Partial<FilmSimSettings>
): string => {
  switch (key) {
    case "dynamicRange": {
      const dr = settings.dynamicRange;
      return dr == null ? "DR100" : `DR${dr}`;
    }
    case "whiteBalance": {
      const wb = capitalize(settings.whiteBalance || "auto");
      const shift = settings.wbShift ?? { r: 0, b: 0 };
      return `${wb} · R${formatSigned(shift.r ?? 0)} B${formatSigned(shift.b ?? 0)}`;
    }
    case "filmSimulation":
      return settings.filmSimulation || String(SETTING_DEFAULTS.filmSimulation);
    case "grainEffect":
    case "colorChromeEffect":
    case "colorChromeFxBlue": {
      const v = settings[key];
      return v ? String(v).toUpperCase() : "OFF";
    }
    default: {
      const v = settings[key];
      return formatSigned(typeof v === "number" ? v : 0);
    }
  }
};

// Film simulations gated by generation, matching the regexes
// getSensorCompatibilityWarnings uses.
const SIM_GATES: {
  pattern: RegExp;
  feature: "classicNegative" | "nostalgicNegative" | "realaAce";
  label: string;
}[] = [
  { pattern: /CLASSIC[_\s-]?NEG/i, feature: "classicNegative", label: "Classic Negative" },
  { pattern: /NOSTALGIC/i, feature: "nostalgicNegative", label: "Nostalgic Negative" },
  { pattern: /REALA/i, feature: "realaAce", label: "Reala Ace" },
];

const isSpecified = (settings: Partial<FilmSimSettings>, key: DialInStepKey) => {
  if (key === "whiteBalance") {
    // WB and its shift form one step; either being present makes the step
    // render real values. Whether the MODE needs the default hint is
    // decided separately (wbHint below) — a shift-only recipe still needs
    // "set the mode to Auto" guidance.
    return settings.whiteBalance != null || settings.wbShift != null;
  }
  return settings[key] !== null && settings[key] !== undefined;
};

const isZeroish = (key: DialInStepKey, settings: Partial<FilmSimSettings>) => {
  if (key === "whiteBalance") {
    // The zero reminder applies when the shift is EXPLICITLY zero —
    // an absent shift is unspecified, not zero.
    const shift = settings.wbShift;
    return shift != null && (shift.r ?? 0) === 0 && (shift.b ?? 0) === 0;
  }
  const v = settings[key];
  if (typeof v === "number") return v === 0;
  if (typeof v === "string") return v.toUpperCase() === "OFF";
  return false;
};

const resolvePath = (
  key: DialInStepKey,
  sensorKey: string | undefined,
  pathsTranscribed: boolean
): string[] | null => {
  if (!pathsTranscribed) return null;
  const entry = MENU_PATHS[key];
  const override = sensorKey
    ? entry.overrides?.[sensorKey as keyof typeof entry.overrides]
    : undefined;
  return override ?? entry.path;
};

/**
 * Build the dial-in step sequence for one slot's settings on one body.
 * bankNumber is 1-based (C1..Cn).
 */
export const buildDialInSteps = (
  settings: Partial<FilmSimSettings>,
  cameraKey: string,
  bankNumber: number
): DialInPlan => {
  const camera = findCamera(cameraKey);
  const sensor = camera ? getSensorByKey(camera.sensorKey) : undefined;
  // Normalize before the override lookups: findCamera tolerates any
  // user-written form, and these tables must tolerate the same — a missed
  // lookup here silently tells an X-T3 owner to set Clarity.
  const normalizedKey = normalizeCameraName(cameraKey);
  const overrides = CAMERA_FEATURE_OVERRIDES[normalizedKey] ?? {};
  const simOverrides = CAMERA_SIM_OVERRIDES[normalizedKey] ?? {};

  // Unknown body: show every step, caveat the whole flow, skip nothing —
  // wrong guidance is worse than generic guidance.
  const caveat = !sensor
    ? "This camera isn't in the catalog, so nothing is filtered or verified — follow your body's own menu labels."
    : null;

  const supports = (key: DialInStepKey): boolean => {
    if (!sensor) return true;
    const f = sensor.features;
    switch (key) {
      case "grainEffect":
        return f.grainEffect;
      case "colorChromeEffect":
        return overrides.colorChromeEffect ?? f.colorChromeEffect;
      case "colorChromeFxBlue":
        return f.colorChromeFXBlue;
      case "clarity":
        return overrides.clarity ?? f.clarity;
      default:
        return true;
    }
  };

  // Paths are only shown for generations they're transcribed for.
  const pathsTranscribed = (key: DialInStepKey) =>
    !!sensor && MENU_PATHS[key].verified.includes(sensor.key);

  const steps: DialInStep[] = [];
  const skipped: DialInPlan["skipped"] = [];

  const bank = `C${bankNumber}`;
  const bankPathVerified = !!sensor && ENTER_BANK_VERIFIED.includes(sensor.key);
  steps.push({
    key: "enterBank",
    label: "Open the bank",
    value: bank,
    path: bankPathVerified
      ? ENTER_BANK_PATH.map((seg) => (seg === "{bank}" ? bank : seg))
      : null,
    hint: bankPathVerified
      ? "Every following step happens inside this menu — edits land in the bank, not your live settings."
      : `Find EDIT/SAVE CUSTOM SETTING on your camera and open ${bank} — every following step happens inside that menu, so edits land in the bank, not your live settings.`,
  });

  for (const key of DIAL_IN_STEP_ORDER) {
    if (!supports(key)) {
      skipped.push({ key, label: STEP_LABELS[key] });
      continue;
    }

    const specified = isSpecified(settings, key);
    const value = specified
      ? formatStepValue(key, settings)
      : formatStepValue(key, SETTING_DEFAULTS);

    let hint: string | undefined;
    if (!specified) {
      hint = "Recipe doesn't specify — set the factory default so the bank holds no leftovers.";
    } else if (key === "whiteBalance" && settings.whiteBalance == null) {
      // Shift-only recipe: the step renders (mode defaults to Auto), but
      // the missing mode still needs the set-to-default guidance.
      hint = "Recipe doesn't specify the WB mode — set Auto, then apply the shift.";
    } else if (isZeroish(key, settings)) {
      hint = "Set it even though it's zero — the bank remembers its old values.";
    }
    if (key === "dynamicRange" && specified) {
      if (settings.dynamicRange === 200) hint = "DR200 needs ISO 320 or higher.";
      if (settings.dynamicRange === 400) hint = "DR400 needs ISO 640 or higher.";
    }

    let warning: string | undefined;
    if (key === "filmSimulation" && sensor && settings.filmSimulation) {
      const gate = SIM_GATES.find((g) => g.pattern.test(settings.filmSimulation!));
      const supported =
        gate && (simOverrides[gate.feature] ?? sensor.features[gate.feature]);
      if (gate && !supported) {
        warning = `${camera?.name ?? "This body"} doesn't have ${gate.label} — pick the closest simulation it offers. The rest of the recipe still applies.`;
      }
    }

    steps.push({
      key,
      label: STEP_LABELS[key],
      value,
      path: resolvePath(key, sensor?.key, pathsTranscribed(key)),
      hint,
      warning,
    });
  }

  return { steps, skipped, caveat };
};
