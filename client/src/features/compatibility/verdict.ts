import {
  findCamera,
  normalizeCameraName,
  type FujifilmCamera,
} from "@/constants/fujifilmCameras";
import {
  getSensorByKey,
  getSensorByLabel,
  type FujifilmSensor,
} from "@/features/film-sims/utils/fujifilmSensors";
import {
  CAMERA_FEATURE_OVERRIDES,
  CAMERA_SIM_OVERRIDES,
} from "./cameraOverrides";
import {
  findMissingFilmSimulation,
  findUnsupportedSettings,
} from "./featureSupport";
import type {
  CompatibilityVerdict,
  RecipeCompatibilitySettings,
  SensorFeatures,
} from "./types";

export interface CameraCapabilities {
  camera?: FujifilmCamera;
  sensor?: FujifilmSensor;
  /**
   * The sensor generation's features with this body's exceptions applied.
   * Undefined when the body isn't in the catalogue — the caller must then
   * assume nothing rather than guess.
   */
  features?: SensorFeatures;
}

/**
 * What one body can actually do: its sensor generation's feature matrix,
 * overlaid with the per-body exceptions. Tolerant of any user-written form
 * of the name, because profile values are free text.
 */
export const resolveCameraCapabilities = (
  cameraName: string | null | undefined
): CameraCapabilities => {
  if (!cameraName) return {};

  const camera = findCamera(cameraName);
  const sensor = camera ? getSensorByKey(camera.sensorKey) : undefined;
  if (!sensor) return { camera };

  // Normalize before the override lookups: findCamera tolerates any
  // user-written form and these tables must tolerate the same — a missed
  // lookup here silently tells an X-T3 owner to set Clarity.
  const normalized = normalizeCameraName(cameraName);

  return {
    camera,
    sensor,
    features: {
      ...sensor.features,
      ...(CAMERA_FEATURE_OVERRIDES[normalized] ?? {}),
      ...(CAMERA_SIM_OVERRIDES[normalized] ?? {}),
    },
  };
};

export interface CompatibilitySubject {
  settings?: RecipeCompatibilitySettings | null;
  /** Sensor generation labels the recipe declares, e.g. ["X-Trans V"]. */
  compatibleSensors?: string[] | null;
}

const authoredForThisSensor = (
  declared: string[] | null | undefined,
  sensor: FujifilmSensor
) => {
  // A recipe that declares nothing makes no claim about generations, so
  // there is nothing to substitute for.
  if (!declared?.length) return true;
  return declared.some((label) => getSensorByLabel(label)?.key === sensor.key);
};

/**
 * Can this body shoot this recipe? See CompatibilityStatus for what each
 * state means; the checks run worst-first so the verdict always names the
 * most serious problem.
 */
export const getCompatibilityVerdict = (
  cameraName: string | null | undefined,
  subject: CompatibilitySubject
): CompatibilityVerdict => {
  const { camera, sensor, features } = resolveCameraCapabilities(cameraName);

  if (!features || !sensor) {
    return {
      status: "UNVERIFIED",
      reasons: [
        cameraName
          ? `${cameraName} isn't in the camera catalogue, so nothing here is checked against it.`
          : "Set your camera to see whether this recipe fits it.",
      ],
      lost: [],
      missingFilmSimulation: null,
    };
  }

  const settings = subject.settings ?? {};
  const bodyName = camera?.name ?? "This body";
  const missingFilmSimulation = findMissingFilmSimulation(
    features,
    settings.filmSimulation
  );
  const lost = findUnsupportedSettings(features, settings);

  if (missingFilmSimulation) {
    return {
      status: "INCOMPATIBLE",
      reasons: [
        `${bodyName} doesn't have ${missingFilmSimulation} — the look this recipe is built on isn't available.`,
        ...lost.map((label) => `${bodyName} has no ${label}.`),
      ],
      lost,
      missingFilmSimulation,
    };
  }

  if (lost.length) {
    return {
      status: "PARTIAL",
      reasons: lost.map(
        (label) =>
          `${bodyName} has no ${label} — that part of the recipe is skipped.`
      ),
      lost,
      missingFilmSimulation: null,
    };
  }

  if (!authoredForThisSensor(subject.compatibleSensors, sensor)) {
    return {
      status: "FITS_WITH_SUBSTITUTIONS",
      reasons: [
        `Every setting is available on ${bodyName}, but this recipe was written for ${subject.compatibleSensors?.join(", ")} — expect to adjust the values.`,
      ],
      lost: [],
      missingFilmSimulation: null,
    };
  }

  return {
    status: "FITS",
    reasons: [],
    lost: [],
    missingFilmSimulation: null,
  };
};
