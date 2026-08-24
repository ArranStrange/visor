import { PresetData } from "./types";
import { compileXMP } from "./compile";

// Helper function to create and download the XMP file
export const downloadXMP = (preset: PresetData, filename?: string): void => {
  const xmpContent = compileXMP(preset);
  const blob = new Blob([xmpContent], { type: "application/xml" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download =
    filename || `${preset.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.xmp`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
