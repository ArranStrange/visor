import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Tabs, Tab, Alert } from "@mui/material";
import { useQuery } from "@apollo/client";
import { GET_ALL_PRESETS } from "../graphql/queries/getAllPresets";
import { GET_ALL_FILMSIMS } from "../graphql/queries/getAllFilmSims";
import PresetCard from "../components/cards/PresetCard";
import FilmSimCard from "../components/cards/FilmSimCard";
import StaggeredGrid from "../components/ui/StaggeredGrid";
import BuyMeACoffeeCard from "../components/ui/BuyMeACoffeeCard";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`featured-tabpanel-${index}`}
      aria-labelledby={`featured-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const FeaturedHome: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const {
    data: presetsData,
    loading: presetsLoading,
    error: presetsError,
  } = useQuery(GET_ALL_PRESETS);

  const {
    data: filmSimsData,
    loading: filmSimsLoading,
    error: filmSimsError,
  } = useQuery(GET_ALL_FILMSIMS);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter featured items
  const featuredPresets =
    presetsData?.listPresets?.filter((preset: any) => preset.featured) || [];
  const featuredFilmSims =
    filmSimsData?.listFilmSims?.filter((filmSim: any) => filmSim.featured) ||
    [];

  if (presetsError || filmSimsError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Error loading featured content. Please try again later.
        </Alert>
      </Container>
    );
  }

  const renderFeaturedPresets = () => {
    if (presetsLoading) {
      return <Typography>Loading featured presets...</Typography>;
    }

    if (featuredPresets.length === 0) {
      return (
        <Alert severity="info">
          No featured presets available. Check back later for curated content!
        </Alert>
      );
    }

    return (
      <StaggeredGrid
        loading={false}
        onLoadMore={() => {}}
        hasMore={false}
        isLoading={false}
      >
        {featuredPresets.map((preset: any, index: number) => (
          <PresetCard
            key={`featured-preset-${preset.id}-${index}`}
            {...preset}
            tags={preset.tags || []}
          />
        ))}
      </StaggeredGrid>
    );
  };

  const renderFeaturedFilmSims = () => {
    if (filmSimsLoading) {
      return <Typography>Loading featured film sims...</Typography>;
    }

    if (featuredFilmSims.length === 0) {
      return (
        <Alert severity="info">
          No featured film sims available. Check back later for curated content!
        </Alert>
      );
    }

    return (
      <StaggeredGrid
        loading={false}
        onLoadMore={() => {}}
        hasMore={false}
        isLoading={false}
      >
        {featuredFilmSims.map((filmSim: any, index: number) => (
          <FilmSimCard
            key={`featured-filmsim-${filmSim.id}-${index}`}
            {...filmSim}
            tags={filmSim.tags || []}
          />
        ))}
      </StaggeredGrid>
    );
  };

  const renderAllFeatured = () => {
    const allFeatured = [
      ...featuredPresets.map((preset: any) => ({
        type: "preset",
        data: preset,
      })),
      ...featuredFilmSims.map((filmSim: any) => ({
        type: "film",
        data: filmSim,
      })),
    ];

    if (allFeatured.length === 0) {
      return (
        <Alert severity="info">
          No featured content available. Check back later for curated content!
        </Alert>
      );
    }

    return (
      <StaggeredGrid
        loading={false}
        onLoadMore={() => {}}
        hasMore={false}
        isLoading={false}
      >
        {allFeatured.map((item: any, index: number) => {
          if (item.type === "preset") {
            return (
              <PresetCard
                key={`featured-preset-${item.data.id}-${index}`}
                {...item.data}
                tags={item.data.tags || []}
              />
            );
          } else {
            return (
              <FilmSimCard
                key={`featured-filmsim-${item.data.id}-${index}`}
                {...item.data}
                tags={item.data.tags || []}
              />
            );
          }
        })}
      </StaggeredGrid>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
        Featured Content
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Discover our handpicked selection of the best presets and film
        simulations.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="featured content tabs"
        >
          <Tab label="All Featured" />
          <Tab label="Presets" />
          <Tab label="Film Sims" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {renderAllFeatured()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderFeaturedPresets()}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {renderFeaturedFilmSims()}
      </TabPanel>
    </Container>
  );
};

export default FeaturedHome;
