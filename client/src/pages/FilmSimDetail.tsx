import React from "react";
import {
  Container,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_FILMSIM_BY_SLUG } from "../graphql/queries/getFilmSimBySlug";
import PresetCard from "../components/PresetCard";
import AddToListButton from "../components/AddToListButton";

const FilmSimDetails: React.FC = () => {
  const { slug } = useParams();

  const { loading, error, data } = useQuery(GET_FILMSIM_BY_SLUG, {
    variables: { slug },
  });

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Error loading film simulation: {error.message}
        </Alert>
      </Container>
    );
  }

  const filmSim = data?.getFilmSim;

  if (!filmSim) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Film simulation not found</Alert>
      </Container>
    );
  }

  // Helper function to format setting values
  const formatSettingValue = (value: any) => {
    if (value === undefined || value === null) return "N/A";
    if (typeof value === "number") return value.toString();
    return value;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: "relative" }}>
      <AddToListButton filmSimId={filmSim.id} itemName={filmSim.name} />

      {/* Header */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {filmSim.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={2}>
        {filmSim.description}
      </Typography>

      {/* Tags and camera compatibility */}
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
        {filmSim.tags?.map((tag) => (
          <Chip key={tag.id} label={tag.displayName} variant="outlined" />
        ))}
        {filmSim.compatibleCameras?.map((camera) => (
          <Chip key={camera} label={camera} color="secondary" />
        ))}
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Camera Settings */}
      <Typography variant="h6" mt={4} mb={2}>
        In-Camera Settings
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
        }}
      >
        {[
          { label: "Dynamic Range", value: filmSim.settings?.dynamicRange },
          { label: "Highlight Tone", value: filmSim.settings?.highlight },
          { label: "Shadow Tone", value: filmSim.settings?.shadow },
          { label: "Colour", value: filmSim.settings?.colour },
          { label: "Sharpness", value: filmSim.settings?.sharpness },
          { label: "Noise Reduction", value: filmSim.settings?.noiseReduction },
          { label: "Grain Effect", value: filmSim.settings?.grainEffect },
          { label: "Clarity", value: filmSim.settings?.clarity },
          { label: "White Balance", value: filmSim.settings?.whiteBalance },
          {
            label: "WB Shift",
            value: filmSim.settings?.wbShift
              ? `R${formatSettingValue(
                  filmSim.settings.wbShift.r
                )} / B${formatSettingValue(filmSim.settings.wbShift.b)}`
              : "N/A",
          },
        ].map((setting) => (
          <Box
            key={setting.label}
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: "background.paper",
              boxShadow: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {setting.label}
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatSettingValue(setting.value)}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Sample images */}
      <Typography variant="h6" mt={4} mb={1}>
        Sample Images
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        {filmSim.sampleImages?.map((image) => (
          <Box key={image.id}>
            <img
              src={image.url}
              alt={image.caption || `Sample image for ${filmSim.name}`}
              style={{ width: "100%", borderRadius: 12 }}
            />
          </Box>
        ))}
      </Box>

      {/* Related presets */}
      <Typography variant="h6" mt={5} mb={2}>
        Recommended Presets
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
        }}
      >
        {filmSim.recommendedPresets?.map((preset) => (
          <Box key={preset.id}>
            <PresetCard
              id={preset.id}
              title={preset.title}
              slug={preset.slug}
              thumbnail={preset.thumbnail}
              tags={preset.tags}
              creator={{
                username: preset.creator.username,
                avatarUrl: preset.creator.avatar,
              }}
            />
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default FilmSimDetails;
