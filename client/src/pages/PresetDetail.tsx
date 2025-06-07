import React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  Button,
  Divider,
  Avatar,
  Paper,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ToneCurve from "../components/ToneCurve";

// Mock preset data
const preset = {
  id: "sunset-gold",
  title: "Sunset Gold",
  tags: ["warm", "vintage", "portrait"],
  creator: {
    username: "arran",
    avatarUrl: "/avatars/arran.png",
    instagram: "https://instagram.com/arran",
  },
  beforeImage:
    "https://images.squarespace-cdn.com/content/v1/6373cb8313c0a95dd854d566/1673042899199-T50CKOGUPEDQW3BLLN3F/TaraShupe_Photography_Humanitarian_Photographer_Female_Storyteller_NGO_WomenFilmmakers_before-after-lightroom-edits045.jpg?format=1500w",
  afterImage:
    "https://images.squarespace-cdn.com/content/v1/6373cb8313c0a95dd854d566/1673042903463-NF4IN3CC8AO7M94316L0/TaraShupe_Photography_Humanitarian_Photographer_Female_Storyteller_NGO_WomenFilmmakers_before-after-lightroom-edits046.jpg?format=1500w",
  xmpFileUrl: "/downloads/sunset-gold.xmp",
  settings: {
    exposure: "+0.35",
    contrast: "+10",
    highlights: "-20",
    shadows: "+30",
    whites: "+10",
    blacks: "-5",
    clarity: "+5",
    vibrance: "+15",
    saturation: "+5",
    grain: "30",
  },
  toneCurve: {
    rgb: [0, 64, 128, 192, 255],
    red: [0, 60, 130, 210, 255],
    green: [0, 50, 125, 195, 255],
    blue: [0, 40, 120, 190, 255],
  },
  notes:
    "Inspired by Fujifilm Classic Chrome, this preset brings a warm cinematic glow to golden hour portraits.",
};

const PresetDetails: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 10 }}>
      {/* Title & Creator */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight="bold">
          {preset.title}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1} mt={1}>
          <Avatar
            src={preset.creator.avatarUrl}
            alt={preset.creator.username}
          />
          <Typography variant="subtitle2" color="text.secondary">
            {preset.creator.username}
          </Typography>
          {preset.creator.instagram && (
            <Button
              href={preset.creator.instagram}
              target="_blank"
              size="small"
              variant="text"
              sx={{ ml: 1 }}
            >
              Instagram
            </Button>
          )}
        </Stack>
        <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
          {preset.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              variant="outlined"
              sx={{ color: "text.secondary", borderColor: "divider" }}
            />
          ))}
        </Stack>
      </Box>

      {/* Before/After Images */}
      <Paper
        variant="outlined"
        sx={{ overflow: "hidden", borderRadius: 3, mb: 4 }}
      >
        <Box display="flex" flexDirection={{ xs: "column", sm: "row" }}>
          <Box flex={1}>
            <img
              src={preset.beforeImage}
              alt="Before"
              style={{ width: "100%", objectFit: "cover" }}
            />
            <Typography
              variant="caption"
              display="block"
              textAlign="center"
              mt={1}
            >
              Before
            </Typography>
          </Box>
          <Box flex={1}>
            <img
              src={preset.afterImage}
              alt="After"
              style={{ width: "100%", objectFit: "cover" }}
            />
            <Typography
              variant="caption"
              display="block"
              textAlign="center"
              mt={1}
            >
              After
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Settings Breakdown */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Settings Breakdown
      </Typography>
      <Box component="dl" sx={{ columnCount: 2, mb: 4 }}>
        {Object.entries(preset.settings).map(([key, value]) => (
          <Box key={key} component="div" mb={1}>
            <Typography variant="body2" fontWeight="medium" component="dt">
              {key}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              component="dd"
              sx={{ ml: 1 }}
            >
              {value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Tone Curve Display */}
      {preset.toneCurve && <ToneCurve curves={preset.toneCurve} />}

      {/* Download + Notes */}
      <Stack direction="row" alignItems="center" spacing={2} my={4}>
        <Button
          href={preset.xmpFileUrl}
          download
          variant="contained"
          startIcon={<DownloadIcon />}
        >
          Download .xmp
        </Button>
      </Stack>

      {preset.notes && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Creator Notes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {preset.notes}
          </Typography>
        </>
      )}
    </Container>
  );
};

export default PresetDetails;
