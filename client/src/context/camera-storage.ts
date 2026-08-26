import { findCamera, normalizeCameraName } from "@/constants/fujifilmCameras";

/**
 * localStorage access for the primary camera, kept out of CameraContext so
 * AuthContext can clear it on logout without the two contexts importing each
 * other.
 *
 * The stored value is the NORMALIZED catalogue key ("xt30ii"), never a
 * display string: it's a lookup key for the camera catalogue and the sensor
 * filter, and a display string would break the moment a catalogue spelling
 * changed. Every read goes back through the catalogue, so a value that no
 * longer resolves is discarded rather than carried around.
 *
 * Every call is wrapped: localStorage throws in some private browsing modes
 * and a storage failure must not blank the app.
 */

export const PRIMARY_CAMERA_KEY = "visor_primary_camera";
export const SHOW_ALL_GENERATIONS_KEY = "visor_show_all_generations";

/** Normalized key for a camera name, or null if the catalogue lacks it. */
export const toCameraKey = (cameraName: string | null | undefined) => {
  const camera = cameraName ? findCamera(cameraName) : undefined;
  return camera ? normalizeCameraName(camera.name) : null;
};

export const readStoredCameraKey = (): string | null => {
  try {
    return toCameraKey(localStorage.getItem(PRIMARY_CAMERA_KEY));
  } catch (error) {
    console.error("Error reading stored camera:", error);
    return null;
  }
};

export const writeStoredCameraKey = (cameraKey: string | null) => {
  try {
    if (cameraKey) {
      localStorage.setItem(PRIMARY_CAMERA_KEY, cameraKey);
    } else {
      localStorage.removeItem(PRIMARY_CAMERA_KEY);
    }
  } catch (error) {
    console.error("Error storing camera:", error);
  }
};

export const readStoredShowAllGenerations = (): boolean => {
  try {
    return localStorage.getItem(SHOW_ALL_GENERATIONS_KEY) === "true";
  } catch (error) {
    console.error("Error reading stored generation preference:", error);
    return false;
  }
};

export const writeStoredShowAllGenerations = (showAll: boolean) => {
  try {
    localStorage.setItem(SHOW_ALL_GENERATIONS_KEY, String(showAll));
  } catch (error) {
    console.error("Error storing generation preference:", error);
  }
};

/** Drop the stored body so the next user doesn't inherit this one's. */
export const clearStoredCamera = () => {
  try {
    localStorage.removeItem(PRIMARY_CAMERA_KEY);
    localStorage.removeItem(SHOW_ALL_GENERATIONS_KEY);
  } catch (error) {
    console.error("Error clearing stored camera:", error);
  }
};
