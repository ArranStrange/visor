import React from "react";
import PresetBeforeAfter from "components/presets/PresetBeforeAfter";

export function PresetBeforeAfterWrapper({ preset }: any) {
  const beforeImage = preset.beforeImage?.url;
  const afterImage = preset.afterImage?.url;
  
  return (
    <PresetBeforeAfter beforeImage={beforeImage} afterImage={afterImage} />
  );
}

