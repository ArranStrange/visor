import React from "react";
import FilmSimCameraSettings from "components/forms/FilmSimCameraSettings";

export function FilmSimCameraSettingsWrapper({ filmSim }: any) {
  return <FilmSimCameraSettings settings={filmSim.settings} />;
}

