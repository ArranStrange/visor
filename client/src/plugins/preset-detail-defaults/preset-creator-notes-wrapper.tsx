import React from "react";
import PresetCreatorNotes from "components/presets/PresetCreatorNotes";

export function PresetCreatorNotesWrapper({ preset }: any) {
  if (!preset.notes) return null;

  return (
    <PresetCreatorNotes notes={preset.notes} creator={preset.creator} />
  );
}

