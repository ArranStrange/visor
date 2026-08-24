import React from "react";
import CreatorNotes from "../content/CreatorNotes";

interface Creator {
  id: string;
  username: string;
  avatar?: string;
}

interface PresetCreatorNotesProps {
  notes?: string;
  creator?: Creator;
}

const PresetCreatorNotes: React.FC<PresetCreatorNotesProps> = ({
  notes,
  creator,
}) => (
  <CreatorNotes
    title="Creator Notes"
    notes={notes}
    creator={creator}
    boldTitle
    sx={{
      borderRadius: 1,
      overflow: "hidden",
      bgcolor: "background.default",
    }}
  />
);

export default PresetCreatorNotes;
