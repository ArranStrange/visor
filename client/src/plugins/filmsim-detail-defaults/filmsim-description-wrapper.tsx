import React from "react";
import FilmSimDescription from "components/filmsims/FilmSimDescription";

export function FilmSimDescriptionWrapper({ filmSim }: any) {
  return (
    <FilmSimDescription
      description={filmSim.description}
      tags={filmSim.tags}
      compatibleCameras={filmSim.compatibleCameras}
    />
  );
}

