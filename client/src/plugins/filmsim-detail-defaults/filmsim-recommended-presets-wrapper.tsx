import React from "react";
import FilmSimRecommendedPresets from "components/filmsims/FilmSimRecommendedPresets";

export function FilmSimRecommendedPresetsWrapper({
  filmSim,
  isOwner,
  onRecommendedPresetsManage,
}: any) {
  return (
    <FilmSimRecommendedPresets
      presets={filmSim.recommendedPresets}
      isOwner={isOwner}
      onManageClick={onRecommendedPresetsManage}
    />
  );
}

