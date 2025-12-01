import React from "react";
import PresetOwnerMenu from "components/presets/PresetOwnerMenu";

export function PresetOwnerMenuWrapper({
  preset,
  isOwner,
  menuAnchorEl,
  menuOpen,
  onMenuClose,
  onEditClick,
  onDeleteClick,
}: any) {
  if (!isOwner) return null;

  return (
    <PresetOwnerMenu
      anchorEl={menuAnchorEl}
      open={menuOpen}
      onClose={onMenuClose}
      onEdit={onEditClick}
      onDelete={onDeleteClick}
    />
  );
}

