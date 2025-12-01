import React from "react";
import FilmSimHeader from "components/filmsims/FilmSimHeader";

export function FilmSimHeaderWrapper({
  filmSim,
  isOwner,
  isAdmin,
  onMenuOpen,
  onFeaturedToggle,
}: any) {
  return (
    <FilmSimHeader
      creator={filmSim.creator}
      name={filmSim.name}
      featured={filmSim.featured}
      isAdmin={isAdmin}
      isOwner={isOwner}
      onFeaturedToggle={onFeaturedToggle}
      onMenuOpen={onMenuOpen}
    />
  );
}

