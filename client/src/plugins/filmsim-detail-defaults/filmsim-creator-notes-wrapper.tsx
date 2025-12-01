import React from "react";
import FilmSimCreatorNotes from "components/filmsims/FilmSimCreatorNotes";

export function FilmSimCreatorNotesWrapper({ filmSim }: any) {
  return (
    <FilmSimCreatorNotes
      notes={filmSim.notes}
      creator={filmSim.creator}
    />
  );
}

