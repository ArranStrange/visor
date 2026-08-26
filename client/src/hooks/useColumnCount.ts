import { useState, useEffect, useCallback, useRef } from "react";
import { calculateColumnCount as calcColumnCount } from "../utils/gridUtils";

interface UseColumnCountProps {
  minWidth?: number;
  gap?: number;
}

// Options are accepted for call-site compatibility; the column count is
// derived from the container/viewport width alone.
export const useColumnCount = (_options: UseColumnCountProps = {}) => {
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

    // ReturnType, not number: Node typings (hoisted by test deps) type
    // setTimeout's return as Timeout in this compilation.
    let timeoutId: ReturnType<typeof setTimeout>;
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
