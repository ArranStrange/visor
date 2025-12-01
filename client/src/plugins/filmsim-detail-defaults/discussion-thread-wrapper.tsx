import React from "react";
import DiscussionThread from "components/discussions/DiscussionThread";

export function DiscussionThreadWrapper({ filmSim }: any) {
  return (
    <DiscussionThread
      itemId={filmSim.id}
      itemType="filmsim"
      itemTitle={filmSim.name}
      isEmbedded={true}
      showPreviewOnly={false}
      minimalHeader={true}
    />
  );
}

