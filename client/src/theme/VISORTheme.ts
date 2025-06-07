import { createTheme } from "@mui/material/styles";

export const visorTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#111111",
      paper: "#181818",
    },
    primary: {
      main: "#E0E0E0", // soft light for UI elements
    },
    secondary: {
      main: "#FF7E4D", // warm highlight (e.g. favourite/star)
    },
    text: {
      primary: "#f5f5f5",
      secondary: "#aaaaaa",
    },
    divider: "#333333",
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
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#1c1c1c",
          borderRadius: 20,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: "#222222",
          borderRadius: 12,
        },
      },
    },
  },
});
