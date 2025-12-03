import React, { useState, useEffect, useRef, useCallback } from "react";
import { TextField, TextFieldProps } from "@mui/material";

interface DebouncedTextFieldProps extends Omit<TextFieldProps, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  debounceTime?: number; // Time in milliseconds to wait before calling onChange
}

/**
 * A TextField component that debounces onChange callbacks.
 * The input updates immediately in the UI, but onChange is only called
 * after the user stops typing for the specified debounceTime.
 *
 * @example
 * <DebouncedTextField
 *   value={searchTerm}
 *   onChange={(value) => setSearchTerm(value)}
 *   debounceTime={600}
 *   placeholder="Search..."
 * />
 */
export const DebouncedTextField: React.FC<DebouncedTextFieldProps> = ({
  value,
  onChange,
  debounceTime = 600,
  ...textFieldProps
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const timerRef = useRef<number | null>(null);
  const isInternalUpdateRef = useRef(false);

  // Update display value when value prop changes (from parent)
  // Only update if the change didn't come from internal user input
  useEffect(() => {
    if (!isInternalUpdateRef.current) {
      setDisplayValue(value);
    }
    isInternalUpdateRef.current = false;
  }, [value]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;

      // Update display value immediately for responsive UI
      isInternalUpdateRef.current = true;
      setDisplayValue(newValue);

      // Clear existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set new timer to call onChange after debounceTime
      timerRef.current = setTimeout(() => {
        onChange(newValue);
      }, debounceTime);
    },
    [onChange, debounceTime]
  );

  return (
    <TextField
      {...textFieldProps}
      value={displayValue}
      onChange={handleChange}
    />
  );
};

export default DebouncedTextField;
