import React from "react";
import FilmSimSampleImages from "components/filmsims/FilmSimSampleImages";

export function FilmSimSampleImagesWrapper({
  filmSim,
  currentUser,
  onImageClick,
}: any) {
  return (
    <FilmSimSampleImages
      filmSimName={filmSim.name}
      sampleImages={filmSim.sampleImages}
      onImageClick={onImageClick}
      showAddButton={!!currentUser}
    />
  );
}

