import React from "react";
import AddToListButton from "components/ui/AddToListButton";

export function AddToListButtonWrapper({ filmSim }: any) {
  return (
    <AddToListButton filmSimId={filmSim.id} itemName={filmSim.name} />
  );
}

