import React from "react";
import PresetHeader from "components/presets/PresetHeader";

export function PresetHeaderWrapper({
  preset,
  isOwner,
  isAdmin,
  onMenuOpen,
  onFeaturedToggle,
}: any) {
  return (
    <PresetHeader
      creator={preset.creator}
      title={preset.title}
      featured={preset.featured}
      isAdmin={isAdmin}
      isOwner={isOwner}
      onFeaturedToggle={onFeaturedToggle}
      onMenuOpen={onMenuOpen}
    />
  );
}

