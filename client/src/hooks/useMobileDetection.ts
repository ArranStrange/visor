import { useState, useEffect, useMemo } from "react";
import { debounce } from "lib/utils/debounce";

export const useMobileDetection = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(
    () => window.matchMedia("(hover: none)").matches
  );

  const checkMobile = useMemo(
    () =>
      debounce(() => {
        setIsMobile(window.matchMedia("(hover: none)").matches);
      }, 100),
    []
  );

  useEffect(() => {
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
      checkMobile.cancel();
    };
  }, [checkMobile]);

  return isMobile;
};
