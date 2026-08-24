import React from "react";
import Description from "../content/Description";

interface Tag {
  id: string;
  displayName: string;
}

interface PresetDescriptionProps {
  description?: string;
  tags: Tag[];
}

const PresetDescription: React.FC<PresetDescriptionProps> = ({
  description,
  tags,
}) => (
  <Description
    description={description}
    tags={tags}
    tagChipSx={{ color: "text.secondary", borderColor: "divider" }}
    mb={3}
  />
);

export default PresetDescription;
