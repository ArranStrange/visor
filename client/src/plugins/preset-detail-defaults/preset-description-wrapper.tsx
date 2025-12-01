import React from "react";
import PresetDescription from "components/presets/PresetDescription";

export function PresetDescriptionWrapper({ preset }: any) {
  return (
    <PresetDescription description={preset.description} tags={preset.tags} />
  );
}

