import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { useMutation, useQuery } from "@apollo/client";
import { findCamera, type FujifilmCamera } from "@/constants/fujifilmCameras";
import {
  GET_USER_PROFILE,
  UPDATE_USER_PROFILE,
} from "@/features/auth/graphql/users";
import { useAuth } from "./AuthContext";
import {
  clearStoredCamera,
  readStoredCameraKey,
  readStoredShowAllGenerations,
  toCameraKey,
  writeStoredCameraKey,
  writeStoredShowAllGenerations,
} from "./camera-storage";

/**
 * The body the app personalises for: compatibility verdicts, dial-in
 * guidance and the sensor list filter all read from here.
 *
 * localStorage is the source of truth for the session (see camera-storage);
 * the profile copy exists so the choice survives a new device, and is only
 * read when this device has no choice of its own.
 */

interface CameraContextType {
  /** Normalized catalogue key, or null when the user hasn't picked a body. */
  cameraKey: string | null;
  /** Catalogue entry for cameraKey; null when unset. */
  camera: FujifilmCamera | null;
  /** Sensor generation slug for the chosen body, e.g. "x-trans-iv". */
  sensorKey: string | null;
  /** True when the user wants results from every generation, not just theirs. */
  showAllGenerations: boolean;
  setPrimaryCamera: (cameraName: string | null) => void;
  setShowAllGenerations: (showAll: boolean) => void;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

interface CameraProviderProps {
  children: ReactNode;
}

interface CurrentUserCameraData {
  getCurrentUser: { id: string; primaryCamera?: string | null } | null;
}

export const CameraProvider: React.FC<CameraProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cameraKey, setCameraKey] = useState<string | null>(
    readStoredCameraKey
  );
  const [showAllGenerations, setShowAllGenerationsState] = useState<boolean>(
    readStoredShowAllGenerations
  );

  const [saveProfile] = useMutation(UPDATE_USER_PROFILE);

  // A pick made in this session wins over the profile, unconditionally. The
  // `skip` below stops the query from *starting* once a key exists, but a
  // request already in flight still completes, and its handler closes over
  // the cameraKey from the render that created it — so a pick made while the
  // profile loads would be silently reverted to the server's value. This ref
  // is read at completion time, when the pick is already visible in it.
  const hasLocalSelection = useRef(false);
  const wasAuthenticated = useRef(isAuthenticated);

  useQuery<CurrentUserCameraData>(GET_USER_PROFILE, {
    skip: !isAuthenticated || cameraKey !== null,
    fetchPolicy: "cache-first",
    onCompleted: (result) => {
      if (hasLocalSelection.current || cameraKey !== null) return;
      const key = toCameraKey(result?.getCurrentUser?.primaryCamera);
      if (!key) return;
      writeStoredCameraKey(key);
      setCameraKey(key);
    },
  });

  // Logging out has to empty the in-memory state as well as storage: the
  // provider is not remounted, so a surviving cameraKey or showAllGenerations
  // would personalise the next account's session on a shared browser. Only a
  // true → false transition clears, so an anonymous visitor keeps the body
  // they picked without an account.
  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      hasLocalSelection.current = false;
      setCameraKey(null);
      setShowAllGenerationsState(false);
      clearStoredCamera();
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  const setPrimaryCamera = useCallback(
    function setPrimaryCamera(cameraName: string | null) {
      const camera = cameraName ? findCamera(cameraName) : undefined;
      const key = camera ? toCameraKey(camera.name) : null;
      hasLocalSelection.current = true;
      setCameraKey(key);
      writeStoredCameraKey(key);

      if (!isAuthenticated) return;
      // The profile copy is what makes the choice survive a new device. It
      // is best-effort: a failed write must not undo the local choice.
      saveProfile({
        // The server stores the canonical catalogue spelling and validates
        // it, so send the name rather than the normalized key.
        variables: { input: { primaryCamera: camera?.name ?? "" } },
      }).catch((error: unknown) =>
        console.error("Error saving primary camera:", error)
      );
    },
    [isAuthenticated, saveProfile]
  );

  const setShowAllGenerations = useCallback(function setShowAllGenerations(
    showAll: boolean
  ) {
    setShowAllGenerationsState(showAll);
    writeStoredShowAllGenerations(showAll);
  }, []);

  const value = useMemo<CameraContextType>(() => {
    const camera = cameraKey ? (findCamera(cameraKey) ?? null) : null;
    return {
      cameraKey,
      camera,
      sensorKey: camera?.sensorKey ?? null,
      showAllGenerations,
      setPrimaryCamera,
      setShowAllGenerations,
    };
  }, [cameraKey, showAllGenerations, setPrimaryCamera, setShowAllGenerations]);

  return (
    <CameraContext.Provider value={value}>{children}</CameraContext.Provider>
  );
};

export const useCamera = (): CameraContextType => {
  const context = useContext(CameraContext);
  if (context === undefined) {
    throw new Error("useCamera must be used within a CameraProvider");
  }
  return context;
};
