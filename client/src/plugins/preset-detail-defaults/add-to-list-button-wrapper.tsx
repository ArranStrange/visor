import React from "react";
import AddToListButton from "components/ui/AddToListButton";

export function AddToListButtonWrapper({ preset }: any) {
  return (
    <AddToListButton presetId={preset.id} itemName={preset.title} />
  );
}

