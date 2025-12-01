import React from "react";
import PresetSampleImages from "components/presets/PresetSampleImages";

export function PresetSampleImagesWrapper({
  preset,
  currentUser,
  onImageClick,
  onAddPhotoClick,
}: any) {
  const afterImage = preset.afterImage?.url;
  
  return (
    <PresetSampleImages
      afterImage={afterImage}
      presetTitle={preset.title}
      sampleImages={preset.sampleImages}
      onImageClick={onImageClick}
      onAddPhotoClick={onAddPhotoClick}
      showAddButton={!!currentUser}
    />
  );
}

