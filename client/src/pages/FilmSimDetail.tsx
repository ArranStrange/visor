import React from "react";
import {
  Container,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
  Grid,
  Avatar,
  Paper,
} from "@mui/material";
import { useParams } from "react-router-dom";

import sampleImages from "../mock/sampleImages"; // Optional mock for layout
import PresetCard from "../components/PresetCard";

const FilmSimDetails: React.FC = () => {
  const { slug } = useParams(); // e.g. "classic-chrome"

  // TODO: Replace with real query
  const filmSim = {
    title: "Classic Chrome",
    description:
      "Muted contrast and colour. Designed for documentary and street photography with a nostalgic feel.",
    thumbnail:
      "https://fujilove.com/wp-content/uploads/2019/04/fujifilm-gfx-gf-110mm-xf-56mm-street-photography-opener.jpg",
    tags: ["muted", "documentary", "fujifilm"],
    toneProfile: "Muted contrast, cool shadows, soft skin tones",
    lightroomApprox: {
      highlights: -20,
      shadows: +15,
      vibrance: -10,
      clarity: +10,
      toneCurve: "S-curve",
    },
    recommendedPresets: [
      {
        id: "chrome-city",
        title: "Chrome City Streets",
        thumbnail:
          "https://fujifilm-x.b-cdn.net/wp-content/uploads/sites/11/2023/06/EC-STREET-PHOTOGRAPHY-ULTIMATE-GUIDE-3.jpg?width&height",
        tags: ["urban", "gritty"],
        creator: { username: "arran", avatarUrl: "/avatars/arran.png" },
      },
    ],
    cameras: ["X100V", "X-T5"],
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {filmSim.title}
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={2}>
        {filmSim.description}
      </Typography>

      {/* Tags and camera compatibility */}
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
        {filmSim.tags.map((tag) => (
          <Chip key={tag} label={tag} variant="outlined" />
        ))}
        {filmSim.cameras.map((camera) => (
          <Chip key={camera} label={camera} color="secondary" />
        ))}
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Tone profile */}
      <Typography variant="h6">Tone Profile</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        {filmSim.toneProfile}
      </Typography>

      {/* Lightroom approximation settings */}
      <Typography variant="h6" mt={3}>
        Lightroom Approximation
      </Typography>
      <Paper sx={{ p: 2, backgroundColor: "background.default" }}>
        <Stack spacing={1}>
          {Object.entries(filmSim.lightroomApprox).map(([setting, value]) => (
            <Typography key={setting} variant="body2">
              <strong>{setting}</strong>: {value}
            </Typography>
          ))}
        </Stack>
      </Paper>

      {/* Sample images */}
      <Typography variant="h6" mt={4} mb={1}>
        Sample Images
      </Typography>
      <Grid container spacing={2}>
        {sampleImages.map((src, index) => (
          <Grid {...(undefined as any)} item xs={6} md={4} key={index}>
            <img
              src={src}
              alt={`sample-${index}`}
              style={{ width: "100%", borderRadius: 12 }}
            />
          </Grid>
        ))}
      </Grid>

      {/* Related presets */}
      <Typography variant="h6" mt={5} mb={2}>
        Recommended Presets
      </Typography>
      <Grid container spacing={2}>
        {filmSim.recommendedPresets.map((preset) => (
          <Grid
            {...(undefined as any)}
            item
            xs={12}
            sm={6}
            md={4}
            key={preset.id}
          >
            <PresetCard {...preset} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default FilmSimDetails;
