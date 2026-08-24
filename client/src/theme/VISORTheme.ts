import { createTheme } from "@mui/material/styles";

// Tonal surface ladder for elevated, non-photo surfaces (cards, panels).
// Depth comes from lighter greys, never white — photos stay the brightest
// element on the page. Referenced via palette paths, e.g. "surface.raised".
const surface = {
  sunken: "#111111",
  raised: "#1A1A1A",
  input: "#141414",
  border: "#2A2A2A",
  outline: "#3A3A3A",
};

// Overlay tokens for content rendered on top of photography.
// Referenced in sx via palette paths, e.g. backgroundColor: "overlay.scrimSubtle".
const overlay = {
  scrimSubtle: "rgba(0, 0, 0, 0.15)",
  scrimMedium: "rgba(0, 0, 0, 0.3)",
  scrimStrong: "rgba(0, 0, 0, 0.5)",
  scrimHeavy: "rgba(0, 0, 0, 0.7)",
  white: "rgba(255, 255, 255, 0.9)",
  whiteSoft: "rgba(255, 255, 255, 0.7)",
  whiteHover: "rgba(255, 255, 255, 0.2)",
  whiteBorder: "rgba(255, 255, 255, 0.1)",
  scrimSolid: "rgba(0,0,0,0.9)",
};

const floatingIconButtonStyles = {
  backgroundColor: overlay.scrimHeavy,
  color: "white",
  width: 32,
  height: 32,
  "&:hover": {
    backgroundColor: overlay.scrimSolid,
  },
};

export const visorTheme = createTheme({
  palette: {
    // VISOR is intentionally dark-only; there is no light palette to maintain.
    mode: "dark",
    background: {
      default: "#080808",
      paper: "#0b0b0b",
    },
    primary: {
      main: "#E0E0E0",
      light: "#F5F5F5",
      dark: "#AAAAAA",
      contrastText: "#080808",
    },
    secondary: {
      main: "#FF7E4D",
      light: "#FFA47D",
      dark: "#CC653D",
      contrastText: "#080808",
    },
    error: {
      main: "#F44336",
      light: "#E57373",
      dark: "#D32F2F",
      contrastText: "#080808",
    },
    warning: {
      main: "#FF9800",
      light: "#FFB74D",
      dark: "#F57C00",
      contrastText: "#080808",
    },
    success: {
      main: "#4CAF50",
      light: "#81C784",
      dark: "#388E3C",
      contrastText: "#080808",
    },
    info: {
      main: "#2196F3",
      light: "#64B5F6",
      dark: "#1976D2",
      contrastText: "#080808",
    },
    text: {
      primary: "#F5F5F5",
      secondary: "#AAAAAA",
      disabled: "#666666",
    },
    divider: "#252525",
    action: {
      hover: "rgba(255,255,255,0.08)",
      selected: "rgba(255,255,255,0.12)",
      disabled: "rgba(255,255,255,0.30)",
    },
    overlay,
    surface,
  },
  typography: {
    fontFamily: `'Inter', 'Helvetica Neue', 'Arial', sans-serif`,
    fontSize: 14,
    h1: {
      fontWeight: 700,
      fontSize: "2rem",
      letterSpacing: "-0.5px",
    },
    h2: {
      fontWeight: 600,
      fontSize: "1.5rem",
      letterSpacing: "-0.3px",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    subtitle1: {
      fontSize: 16,
      fontWeight: 600,
    },
    subtitle2: {
      fontSize: 14,
      fontWeight: 600,
    },
    body2: {
      fontSize: 14,
    },
    caption: {
      fontSize: 12,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          fontFamily: theme.typography.fontFamily,
        },
        a: {
          color: theme.palette.text.primary,
          textDecoration: "none",
          transition: "color 0.2s ease-in-out",
          "&:hover": {
            color: theme.palette.secondary.light,
          },
        },
        "*::-webkit-scrollbar": {
          width: 10,
        },
        "*::-webkit-scrollbar-track": {
          backgroundColor: theme.palette.surface.raised,
        },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: theme.palette.surface.outline,
          borderRadius: 4,
        },
        "*::-webkit-scrollbar-thumb:hover": {
          backgroundColor: theme.palette.text.disabled,
        },
      }),
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          borderRadius: 16,
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&.floating": floatingIconButtonStyles,
        },
      },
      variants: [
        {
          props: { variant: "floating" },
          style: floatingIconButtonStyles,
        },
      ],
    },
    MuiAvatar: {
      variants: [
        {
          props: { variant: "creator" },
          style: {
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          },
        },
      ],
    },
    MuiChip: {
      variants: [
        {
          props: { variant: "overlay" },
          style: {
            color: "white",
            backgroundColor: "black",
            border: "none",
            cursor: "pointer",
            "& .MuiChip-label": {
              color: "white",
            },
            "&:hover": {
              backgroundColor: overlay.whiteHover,
            },
          },
        },
      ],
    },
    MuiTypography: {
      variants: [
        {
          props: { variant: "overlayTitle" },
          style: {
            fontSize: "1rem",
            color: overlay.white,
            textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
            transition: "color 0.8s ease-in-out",
          },
        },
        {
          props: { variant: "overlaySubtitle" },
          style: {
            fontSize: "0.875rem",
            color: overlay.white,
            textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
            transition: "color 0.8s ease-in-out",
          },
        },
      ],
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.surface.input,
          borderRadius: 12,
        }),
      },
    },
    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
    },
  },
});
