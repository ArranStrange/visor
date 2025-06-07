import React from "react";
import {
  Avatar,
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  Divider,
  Grid,
  Tabs,
  Tab,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import InstagramIcon from "@mui/icons-material/Instagram";

import PresetCard from "../components/PresetCard";
import FilmSimCard from "../components/FilmSimCard";

// Mock data
const user = {
  username: "arran",
  avatar: "/avatars/arran.png",
  bio: "Visual explorer. Shooting life with Fujifilm and colour grading in Lightroom.",
  cameras: ["X-T4", "X100V"],
  instagram: "https://instagram.com/arran",
  favouritePresets: [
    {
      id: "sunset-gold",
      title: "Sunset Gold",
      thumbnail: "/images/presets/sunset-after.jpg",
      tags: ["warm", "portrait"],
      creator: { username: "arran" },
    },
  ],
  uploadedPresets: [
    {
      id: "night-film",
      title: "Night Film Grain",
      thumbnail: "/images/presets/night.jpg",
      tags: ["grainy", "film", "low light"],
      creator: { username: "arran" },
    },
  ],
  favouriteFilmSims: [
    {
      id: "acros",
      title: "Fujifilm Acros",
      thumbnail: "/images/sims/acros.jpg",
      tags: ["bw", "grainy"],
      toneProfile: "High contrast monochrome",
    },
  ],
};

const Profile: React.FC = () => {
  const [tabIndex, setTabIndex] = React.useState(0);

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 10 }}>
      {/* Header */}
      <Stack direction="row" spacing={3} alignItems="center" mb={4}>
        <Avatar
          src={user.avatar}
          alt={user.username}
          sx={{ width: 80, height: 80 }}
        />
        <Box>
          <Typography variant="h5" fontWeight="bold">
            {user.username}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" mt={1}>
            {user.cameras.map((camera) => (
              <Chip
                key={camera}
                label={camera}
                icon={<CameraAltIcon />}
                variant="outlined"
                size="small"
                sx={{ borderColor: "divider" }}
              />
            ))}
            {user.instagram && (
              <Chip
                icon={<InstagramIcon />}
                label="Instagram"
                component="a"
                href={user.instagram}
                clickable
                size="small"
                variant="outlined"
                sx={{ borderColor: "divider" }}
              />
            )}
          </Stack>
        </Box>
      </Stack>

      <Typography variant="body1" color="text.secondary" mb={4}>
        {user.bio}
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {/* Tabs */}
      <Tabs
        value={tabIndex}
        onChange={(_, val) => setTabIndex(val)}
        textColor="primary"
      >
        <Tab label="Favourites" />
        <Tab label="Uploaded" />
      </Tabs>

      <Box mt={4}>
        {tabIndex === 0 && (
          <>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Favourite Presets
            </Typography>
            <Grid container spacing={3} mb={4}>
              {user.favouritePresets.map((preset) => (
                <Grid
                  {...(undefined as any)}
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={preset.id}
                >
                  <PresetCard {...preset} />
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Favourite Film Simulations
            </Typography>
            <Grid container spacing={3}>
              {user.favouriteFilmSims.map((sim) => (
                <Grid
                  {...(undefined as any)}
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={sim.id}
                >
                  <FilmSimCard {...sim} />
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {tabIndex === 1 && (
          <>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Uploaded Presets
            </Typography>
            <Grid container spacing={3}>
              {user.uploadedPresets.map((preset) => (
                <Grid
                  {...(undefined as any)}
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={preset.id}
                >
                  <PresetCard {...preset} />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Profile;
