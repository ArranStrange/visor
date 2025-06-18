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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
} from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DownloadIcon from "@mui/icons-material/Download";
import ToneCurve from "../components/ToneCurve";
import SettingSliderDisplay from "../components/SettingSliderDisplay";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import AddToListButton from "../components/AddToListButton";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_PRESET_BY_SLUG } from "../graphql/queries/getPresetBySlug";

const PresetDetails: React.FC = () => {
  const { slug } = useParams();
  const { loading, error, data } = useQuery(GET_PRESET_BY_SLUG, {
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
        <Alert severity="error">Error loading preset: {error.message}</Alert>
      </Container>
    );
  }

  const preset = data?.getPreset;

  if (!preset) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Preset not found</Alert>
      </Container>
    );
  }

  const formatSettingValue = (value: any) => {
    if (value === undefined || value === null) return "0";
    // Convert to number and handle decimal places
    const num = Number(value);
    if (isNaN(num)) return "0";
    // If it's a whole number, return as is
    if (Number.isInteger(num)) return num.toString();
    // For decimal numbers, format with 1 decimal place
    return num.toFixed(1);
  };

  const parseSettingValue = (value: any) => {
    if (value === undefined || value === null) return 0;
    // Convert to number
    const num = Number(value);
    if (isNaN(num)) return 0;
    // Convert to integer by multiplying by 100
    return Math.round(num * 100);
  };

  const formatToneCurveData = (curveData: any) => {
    if (!curveData) return [0, 64, 128, 192, 255];

    // Convert x,y coordinates to output values
    // The ToneCurve component expects an array of 5 values for input [0, 64, 128, 192, 255]
    const inputPoints = [0, 64, 128, 192, 255];
    const outputPoints = inputPoints.map((input) => {
      // Find the two points that surround this input value
      const lowerPoint = curveData.reduce((prev: any, curr: any) => {
        return curr.x <= input && (!prev || curr.x > prev.x) ? curr : prev;
      }, null);

      const upperPoint = curveData.reduce((prev: any, curr: any) => {
        return curr.x >= input && (!prev || curr.x < prev.x) ? curr : prev;
      }, null);

      if (!lowerPoint || !upperPoint) return input;
      if (lowerPoint.x === upperPoint.x) return lowerPoint.y;

      // Linear interpolation between points
      const ratio = (input - lowerPoint.x) / (upperPoint.x - lowerPoint.x);
      return Math.round(lowerPoint.y + ratio * (upperPoint.y - lowerPoint.y));
    });

    return outputPoints;
  };

  const renderAccordionSection = (
    title: string,
    keys: string[],
    content?: React.ReactNode
  ) => {
    const hasValidSettings = keys.some(
      (key) => preset.settings[key] !== undefined
    );
    if (!hasValidSettings && !content) return null;

    return (
      <Accordion sx={{ backgroundColor: "background.default" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {content ? (
            content
          ) : (
            <Box>
              {keys.map((key) =>
                preset.settings[key] !== undefined ? (
                  <SettingSliderDisplay
                    key={key}
                    label={key}
                    value={formatSettingValue(preset.settings[key] / 100)}
                  />
                ) : null
              )}
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  // Get before/after images from beforeImage and afterImage fields
  const beforeImage = preset.beforeImage?.url;
  const afterImage = preset.afterImage?.url;

  // Format tone curve data
  const toneCurveData = {
    rgb: formatToneCurveData(preset.toneCurve?.rgb),
    red: formatToneCurveData(preset.toneCurve?.red),
    green: formatToneCurveData(preset.toneCurve?.green),
    blue: formatToneCurveData(preset.toneCurve?.blue),
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 10, position: "relative" }}>
      <AddToListButton presetId={preset.id} itemName={preset.title} />

      {/* Title & Creator */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight="bold">
          {preset.title}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1} mt={1}>
          <Avatar src={preset.creator.avatar} alt={preset.creator.username} />
          <Typography variant="subtitle2" color="text.secondary">
            {preset.creator.username}
          </Typography>
          {preset.creator.instagram && (
            <Button
              href={preset.creator.instagram}
              target="_blank"
              size="small"
              variant="text"
              sx={{ ml: 1, minWidth: 0, padding: 0.5 }}
            >
              <InstagramIcon fontSize="small" />
            </Button>
          )}
        </Stack>
        <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
          {preset.tags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.displayName}
              variant="outlined"
              sx={{ color: "text.secondary", borderColor: "divider" }}
            />
          ))}
        </Stack>
      </Box>

      {/* Before/After Images */}
      <Box sx={{ mb: 4 }}>
        <BeforeAfterSlider
          beforeImage={beforeImage}
          afterImage={afterImage}
          height={500}
        />
      </Box>

      <Typography variant="body1" color="text.secondary" mb={2}>
        {preset.description}
      </Typography>

      {/* Accordion Sections */}
      {renderAccordionSection("Light", [
        "exposure",
        "contrast",
        "highlights",
        "shadows",
        "whites",
        "blacks",
      ])}

      {renderAccordionSection(
        "Tone Curve",
        [],
        <ToneCurve curves={toneCurveData} />
      )}

      {renderAccordionSection("Color", [
        "temp",
        "tint",
        "vibrance",
        "saturation",
      ])}

      {renderAccordionSection("Effects", ["clarity", "dehaze"])}

      {renderAccordionSection(
        "Grain",
        [],
        <Box>
          {preset.settings.grain && (
            <>
              <SettingSliderDisplay
                label="Amount"
                value={formatSettingValue(preset.settings.grain.amount / 100)}
              />
              <SettingSliderDisplay
                label="Size"
                value={formatSettingValue(preset.settings.grain.size / 100)}
              />
              <SettingSliderDisplay
                label="Roughness"
                value={formatSettingValue(
                  preset.settings.grain.roughness / 100
                )}
              />
            </>
          )}
        </Box>
      )}

      {renderAccordionSection(
        "Noise Reduction",
        [],
        <Box>
          {preset.settings.noiseReduction && (
            <>
              <SettingSliderDisplay
                label="Luminance"
                value={formatSettingValue(
                  preset.settings.noiseReduction.luminance / 100
                )}
              />
              <SettingSliderDisplay
                label="Color"
                value={formatSettingValue(
                  preset.settings.noiseReduction.color / 100
                )}
              />
              <SettingSliderDisplay
                label="Detail"
                value={formatSettingValue(
                  preset.settings.noiseReduction.detail / 100
                )}
              />
            </>
          )}
        </Box>
      )}

      {renderAccordionSection("Detail", ["sharpening"])}

      {/* Download + Notes */}
      <Stack direction="row" alignItems="center" spacing={2} my={4}>
        <Button
          href={preset.xmpUrl}
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
