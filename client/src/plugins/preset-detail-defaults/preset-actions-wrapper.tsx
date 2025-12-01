import React from "react";
import PresetActions from "components/presets/PresetActions";

export function PresetActionsWrapper({
  preset,
  currentUser,
  onDownload,
}: any) {
  return (
    <PresetActions
      isAuthenticated={!!currentUser}
      onDownload={onDownload}
    />
  );
}

