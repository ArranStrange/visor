import type { CSSObject } from "@mui/material/styles";

/** Shared selected-state border for colour swatch-style controls (theme tokens). */
export function selectedBorderSx(isSelected: boolean): CSSObject {
  return {
    border: "2px solid",
    borderColor: isSelected ? "common.white" : "surface.border",
  };
}
