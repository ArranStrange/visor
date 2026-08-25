import React from "react";
import CreatorNotes from "@/components/content/CreatorNotes";

interface Creator {
  id: string;
  username: string;
  avatar?: string;
}

interface FilmSimCreatorNotesProps {
  notes?: string;
  creator?: Creator;
}

const FilmSimCreatorNotes: React.FC<FilmSimCreatorNotesProps> = ({
  notes,
  creator,
}) => (
  <CreatorNotes
    title="Creator's Notes"
    notes={notes}
    creator={creator}
    emptyFallback="No notes provided."
    bodyVariant="body1"
    sx={{ mt: 4 }}
  />
);

export default FilmSimCreatorNotes;
