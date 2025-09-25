import { useState, useEffect, useCallback, useRef } from "react";
import { calculateColumnCount as calcColumnCount } from "../utils/gridUtils";

interface UseColumnCountProps {
  minWidth?: number;
  gap?: number;
}

export const useColumnCount = ({
  minWidth = 200,
  gap = 10,
}: UseColumnCountProps = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(() => {
    if (typeof window !== "undefined") {
      return calcColumnCount(window.innerWidth);
    }
    return 4;
  });

  const calculateColumnCount = useCallback((containerWidth: number) => {
    return calcColumnCount(containerWidth);
  }, []);

  const updateColumns = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const newColumnCount = calculateColumnCount(containerWidth);

    if (newColumnCount !== columnCount) {
      setColumnCount(newColumnCount);
    }
  }, [calculateColumnCount, columnCount]);

  useEffect(() => {
    updateColumns();

    let timeoutId: number;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateColumns, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [updateColumns]);

  useEffect(() => {
    if (containerRef.current) {
      updateColumns();
    }
  }, [updateColumns]);

  const refreshColumns = useCallback(() => {
    if (containerRef.current) {
      setTimeout(() => {
        updateColumns();
      }, 50);
    }
  }, [updateColumns]);

  return {
    containerRef,
    columnCount,
    refreshColumns,
  };
};
