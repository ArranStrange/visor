import { PresetData } from "@/features/presets/utils/xmp-compiler/types";
import { buildBasicAttributes } from "@/features/presets/utils/xmp-compiler/basic-attributes";
import { buildToneCurveAttributes } from "@/features/presets/utils/xmp-compiler/tone-curve";
import { buildColorAdjustmentAttributes } from "@/features/presets/utils/xmp-compiler/color-adjustments";
import { buildFixedDefaultAttributes } from "@/features/presets/utils/xmp-compiler/fixed-defaults";

export const compileXMP = (preset: PresetData): string => {
  const basicAttributes = buildBasicAttributes(preset);
  const toneCurveAttributes = buildToneCurveAttributes(preset.toneCurve);
  const colorAdjustmentAttributes = buildColorAdjustmentAttributes(
    preset.settings.colorAdjustments
  );
  const fixedDefaultAttributes = buildFixedDefaultAttributes();

  return `<?xml version="1.0" encoding="UTF-8"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 9.1.0">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"
      ${basicAttributes}
      ${toneCurveAttributes}
      ${colorAdjustmentAttributes}
      ${fixedDefaultAttributes}>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>`;
};
