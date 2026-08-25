import React from "react";
import Description from "@/components/content/Description";
import SensorFilterChip from "@/features/film-sims/components/SensorFilterChip";

interface Tag {
  id: string;
  displayName: string;
}

interface FilmSimDescriptionProps {
  description?: string;
  tags?: Tag[];
  compatibleSensors?: string[];
}

const FilmSimDescription: React.FC<FilmSimDescriptionProps> = ({
  description,
  tags = [],
  compatibleSensors = [],
}) => (
  <Description description={description} tags={tags} mb={2}>
    {compatibleSensors.map((sensor) => (
      <SensorFilterChip key={sensor} sensor={sensor} />
    ))}
  </Description>
);

export default FilmSimDescription;
