import React from "react";
import { Box, Container } from "@mui/material";
import PresetCard from "../components/PresetCard";
import FilmSimCard from "../components/FilmSimCard";
import { useContentType } from "../context/ContentTypeFilter";
import ContentTypeToggle from "../components/ContentTypeToggle";
import StaggeredGrid from "../components/StaggeredGrid";

import { useQuery, gql } from "@apollo/client";

// Apollo GraphQL queries
const LIST_PRESETS = gql`
  query ListPresets {
    listPresets {
      id
      title
      slug
      tags {
        displayName
      }
      creator {
        username
        avatar
      }
      thumbnail: sampleImages {
        url
      }
    }
  }
`;

const LIST_FILMSIMS = gql`
  query ListFilmSims {
    listFilmSims {
      id
      name
      slug
      tags {
        displayName
      }
      creator {
        username
        avatar
      }
      thumbnail: sampleImages {
        url
      }
    }
  }
`;

const HomePage: React.FC = () => {
  const { contentType } = useContentType();

  const { data: presetData, loading: loadingPresets } = useQuery(LIST_PRESETS);
  const { data: filmSimData, loading: loadingFilmSims } =
    useQuery(LIST_FILMSIMS);

  const combined = React.useMemo(() => {
    const result: { type: "preset" | "film"; data: any }[] = [];

    if (
      (contentType === "all" || contentType === "presets") &&
      presetData?.listPresets
    ) {
      result.push(
        ...presetData.listPresets.map((p) => ({
          type: "preset" as const,
          data: {
            ...p,
            thumbnail: p.thumbnail?.[0]?.url ?? "",
          },
        }))
      );
    }

    if (
      (contentType === "all" || contentType === "films") &&
      filmSimData?.listFilmSims
    ) {
      result.push(
        ...filmSimData.listFilmSims.map((f) => ({
          type: "film" as const,
          data: {
            ...f,
            title: f.name,
            thumbnail: f.thumbnail?.[0]?.url ?? "",
          },
        }))
      );
    }

    return result.sort(() => Math.random() - 0.5); // Shuffle
  }, [contentType, presetData, filmSimData]);

  if (loadingPresets || loadingFilmSims) return <p>Loading content...</p>;

  return (
    <Container maxWidth="lg" sx={{ mt: 1, mb: 50 }}>
      <ContentTypeToggle />
      <StaggeredGrid>
        {combined.map((item, index) => (
          <React.Fragment key={`${item.type}-${item.data.id}-${index}`}>
            {item.type === "preset" ? (
              <PresetCard {...item.data} />
            ) : (
              <FilmSimCard {...item.data} />
            )}
          </React.Fragment>
        ))}
      </StaggeredGrid>
    </Container>
  );
};

export default HomePage;
