import React from "react";
import FilmSimOwnerMenu from "components/filmsims/FilmSimOwnerMenu";

export function FilmSimOwnerMenuWrapper({
  filmSim,
  isOwner,
  menuAnchorEl,
  menuOpen,
  onMenuClose,
  onEditClick,
  onDeleteClick,
}: any) {
  if (!isOwner) return null;

  return (
    <FilmSimOwnerMenu
      anchorEl={menuAnchorEl}
      open={menuOpen}
      onClose={onMenuClose}
      onEdit={onEditClick}
      onDelete={onDeleteClick}
    />
  );
}

