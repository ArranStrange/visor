import React, { useState } from "react";
import {
  Box,
  Typography,
  Slider,
  Stack,
  useTheme,
  useMediaQuery,
  styled,
} from "@mui/material";

// Helper to convert hue/sat to CSS color
function hslColor(hue: number, sat: number, light: number = 0.5) {
  return `hsl(${hue}, ${sat}%, ${light * 100}%)`;
}

interface ColorGradingProps {
  shadowHue?: number;
  shadowSat?: number;
  shadowLuminance?: number;
  midtoneHue?: number;
  midtoneSat?: number;
  midtoneLuminance?: number;
  highlightHue?: number;
  highlightSat?: number;
  highlightLuminance?: number;
  blending?: number;
  balance?: number;
}

const wheelSize = 100;
const thumbSize = 18;

type WheelType = "shadows" | "midtones" | "highlights";

function ColorWheel({
  hue = 0,
  sat = 0,
  selected,
  onClick,
}: {
  hue?: number;
  sat?: number;
  selected: boolean;
  onClick: () => void;
}) {
  // Place thumb on wheel using polar coordinates
  const angle = ((hue ?? 0) - 90) * (Math.PI / 180);
  const radius = ((sat ?? 0) / 100) * (wheelSize / 2 - thumbSize / 2);
  const cx = wheelSize / 2 + radius * Math.cos(angle);
  const cy = wheelSize / 2 + radius * Math.sin(angle);

  return (
    <Box
      sx={{
        position: "relative",
        width: wheelSize,
        height: wheelSize,
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      {/* True color wheel SVG */}
      <svg
        width={wheelSize}
        height={wheelSize}
        style={{
          display: "block",
          filter: selected ? "none" : "grayscale(1) opacity(0.5)",
        }}
      >
        <defs>
          <radialGradient id="wheel-vignette" r="50%" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.15} />
          </radialGradient>
        </defs>
        {/* Color wheel using conic gradients for hue, and radial for vignette */}
        <foreignObject x="0" y="0" width={wheelSize} height={wheelSize}>
          <Box
            sx={{
              width: wheelSize,
              height: wheelSize,
              borderRadius: "50%",
              background:
                "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
            }}
          />
        </foreignObject>
        <circle
          cx={wheelSize / 2}
          cy={wheelSize / 2}
          r={wheelSize / 2 - 2}
          fill="url(#wheel-vignette)"
        />
      </svg>
      {/* Thumb only if selected */}
      {selected && (
        <Box
          sx={{
            position: "absolute",
            left: cx - thumbSize / 2,
            top: cy - thumbSize / 2,
            width: thumbSize,
            height: thumbSize,
            borderRadius: "50%",
            border: "2px solid #fff",
            boxShadow: "0 0 4px 2px rgba(0,0,0,0.5)",
            background: hslColor(hue ?? 0, sat ?? 100, 0.5),
            pointerEvents: "none",
          }}
        />
      )}
    </Box>
  );
}

// Custom CenteredSlider for center-out highlight
const CenteredSlider = styled(Slider)(({ theme }) => ({
  color: "#fff",
  height: 4,
  padding: "13px 0",
  "& .MuiSlider-rail": {
    backgroundColor: "#444",
    opacity: 1,
    height: 4,
    zIndex: 1,
  },
  "& .MuiSlider-track": {
    backgroundColor: "#fff",
    height: 4,
    zIndex: 2,
  },
  "& .MuiSlider-thumb": {
    width: 16,
    height: 16,
    backgroundColor: "#fff",
    border: "2px solid #222",
    boxShadow: "0 2px 8px 2px rgba(0,0,0,0.25)",
    zIndex: 3,
    position: "relative",
  },
}));

const ColorGradingWheels: React.FC<ColorGradingProps> = ({
  shadowHue = 0,
  shadowSat = 0,
  shadowLuminance = 0,
  midtoneHue = 0,
  midtoneSat = 0,
  midtoneLuminance = 0,
  highlightHue = 0,
  highlightSat = 0,
  highlightLuminance = 0,
  blending = 50,
  balance = 0,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selected, setSelected] = useState<WheelType>("midtones");

  // For future: could pass per-wheel blending/balance
  const getBlending = () => blending;
  const getBalance = () => balance;
  const getLuminance = () => {
    if (selected === "shadows") return shadowLuminance;
    if (selected === "midtones") return midtoneLuminance;
    if (selected === "highlights") return highlightLuminance;
    return 0;
  };

  return (
    <Box>
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={isMobile ? 3 : 4}
        alignItems="center"
        justifyContent="center"
        mb={2}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              fontWeight: selected === "shadows" ? 700 : 400,
              cursor: "pointer",
            }}
            onClick={() => setSelected("shadows")}
          >
            Shadows
          </Typography>
          <ColorWheel
            hue={shadowHue}
            sat={shadowSat}
            selected={selected === "shadows"}
            onClick={() => setSelected("shadows")}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              fontWeight: selected === "midtones" ? 700 : 400,
              cursor: "pointer",
            }}
            onClick={() => setSelected("midtones")}
          >
            Midtones
          </Typography>
          <ColorWheel
            hue={midtoneHue}
            sat={midtoneSat}
            selected={selected === "midtones"}
            onClick={() => setSelected("midtones")}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              fontWeight: selected === "highlights" ? 700 : 400,
              cursor: "pointer",
            }}
            onClick={() => setSelected("highlights")}
          >
            Highlights
          </Typography>
          <ColorWheel
            hue={highlightHue}
            sat={highlightSat}
            selected={selected === "highlights"}
            onClick={() => setSelected("highlights")}
          />
        </Box>
      </Stack>
      {/* Only show sliders for selected wheel */}
      <Box sx={{ mt: 2 }}>
        {/* Luminance */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ minWidth: 90 }}
          >
            Luminance
          </Typography>
          <Box sx={{ flex: 1, mx: 2 }}>
            <CenteredSlider
              value={getLuminance()}
              min={-100}
              max={100}
              disabled
              componentsProps={{
                track: {
                  style: {
                    left: `${50 + getLuminance() / 2}%`,
                    width: `${Math.abs(getLuminance()) / 2}%`,
                    transform:
                      getLuminance() < 0 ? "translateX(-100%)" : "none",
                  },
                },
              }}
            />
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ minWidth: 32, textAlign: "right" }}
          >
            {getLuminance()}
          </Typography>
        </Box>
        {/* Blending */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ minWidth: 90 }}
          >
            Blending
          </Typography>
          <Box sx={{ flex: 1, mx: 2 }}>
            <CenteredSlider
              value={getBlending()}
              min={0}
              max={100}
              disabled
              componentsProps={{
                track: {
                  style: {
                    left: `${getBlending() >= 50 ? 50 : getBlending()}%`,
                    width: `${Math.abs(getBlending() - 50)}%`,
                    transform:
                      getBlending() < 50 ? "translateX(-100%)" : "none",
                  },
                },
              }}
            />
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ minWidth: 32, textAlign: "right" }}
          >
            {getBlending()}
          </Typography>
        </Box>
        {/* Balance */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ minWidth: 90 }}
          >
            Balance
          </Typography>
          <Box sx={{ flex: 1, mx: 2 }}>
            <CenteredSlider
              value={getBalance()}
              min={-100}
              max={100}
              disabled
              componentsProps={{
                track: {
                  style: {
                    left: `${50 + getBalance() / 2}%`,
                    width: `${Math.abs(getBalance()) / 2}%`,
                    transform: getBalance() < 0 ? "translateX(-100%)" : "none",
                  },
                },
              }}
            />
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ minWidth: 32, textAlign: "right" }}
          >
            {getBalance()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ColorGradingWheels;
