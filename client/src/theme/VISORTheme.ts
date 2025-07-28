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
      contrastText: "#000000", // Ensure good contrast
    },
    secondary: {
      main: "#FF7E4D", // warm highlight (e.g. favourite/star)
      contrastText: "#000000", // Ensure good contrast
    },
    text: {
      primary: "#f5f5f5", // Improved contrast
      secondary: "#cccccc", // Improved contrast from #aaaaaa
    },
    divider: "#333333",
    error: {
      main: "#f44336",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#ff9800",
      contrastText: "#000000",
    },
    info: {
      main: "#2196f3",
      contrastText: "#ffffff",
    },
    success: {
      main: "#4caf50",
      contrastText: "#ffffff",
    },
  },
  typography: {
    fontFamily: `'Inter', 'Helvetica Neue', 'Arial', sans-serif`,
    fontSize: 14,
    h1: {
      fontWeight: 700,
      fontSize: "2rem",
      letterSpacing: "-0.5px",
      color: "#f5f5f5",
    },
    h2: {
      fontWeight: 600,
      fontSize: "1.5rem",
      letterSpacing: "-0.3px",
      color: "#f5f5f5",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.25rem",
      color: "#f5f5f5",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.125rem",
      color: "#f5f5f5",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1rem",
      color: "#f5f5f5",
    },
    h6: {
      fontWeight: 600,
      fontSize: "0.875rem",
      color: "#f5f5f5",
    },
    body1: {
      color: "#f5f5f5",
    },
    body2: {
      color: "#cccccc",
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
          minHeight: "36px", // Reduced from 44px
          minWidth: "36px", // Reduced from 44px
          padding: "6px 16px", // Reduced padding
          fontSize: "0.875rem", // Slightly smaller text
          "&:focus-visible": {
            outline: "2px solid #90caf9",
            outlineOffset: "2px",
          },
        },
        contained: {
          "&:hover": {
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          },
        },
        sizeSmall: {
          minHeight: "32px",
          minWidth: "32px",
          padding: "4px 12px",
          fontSize: "0.8125rem",
        },
        sizeLarge: {
          minHeight: "44px",
          minWidth: "44px",
          padding: "8px 20px",
          fontSize: "0.9375rem",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: "36px", // Reduced from 44px
          minHeight: "36px", // Reduced from 44px
          padding: "6px", // Reduced padding
          "&:focus-visible": {
            outline: "2px solid #90caf9",
            outlineOffset: "2px",
          },
        },
        sizeSmall: {
          minWidth: "28px",
          minHeight: "28px",
          padding: "4px",
        },
        sizeLarge: {
          minWidth: "44px",
          minHeight: "44px",
          padding: "8px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#1c1c1c",
          borderRadius: 20,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          "&:focus-visible": {
            outline: "2px solid #90caf9",
            outlineOffset: "2px",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: "#222222",
          borderRadius: 12,
          "& .MuiInputBase-root": {
            minHeight: "36px", // Reduced from 40px
            padding: "6px 12px", // Reduced padding
          },
          "& .MuiInputLabel-root": {
            color: "#cccccc",
            fontSize: "0.875rem",
          },
          "& .MuiInputBase-input": {
            color: "#f5f5f5",
            fontSize: "0.875rem",
            padding: "6px 0", // Reduced vertical padding
          },
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#444444",
              borderWidth: "1px",
            },
            "&:hover fieldset": {
              borderColor: "#666666",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#90caf9",
              borderWidth: "1px",
            },
          },
          "& .MuiFormHelperText-root": {
            fontSize: "0.75rem",
            marginTop: "4px",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          minHeight: "28px", // Reduced from 32px
          fontSize: "0.8125rem", // Smaller text
          "&:focus-visible": {
            outline: "2px solid #90caf9",
            outlineOffset: "2px",
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          minHeight: "36px", // Reduced from 44px
          minWidth: "36px", // Reduced from 44px
          padding: "6px 12px", // Reduced padding
          fontSize: "0.875rem", // Smaller text
          "&:focus-visible": {
            outline: "2px solid #90caf9",
            outlineOffset: "2px",
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: "36px", // Reduced from 44px
          padding: "6px 16px", // Reduced padding
          fontSize: "0.875rem", // Smaller text
          "&:focus-visible": {
            outline: "2px solid #90caf9",
            outlineOffset: "2px",
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          minHeight: "36px", // Reduced from 44px
          padding: "6px 16px", // Reduced padding
          "&:focus-visible": {
            outline: "2px solid #90caf9",
            outlineOffset: "2px",
          },
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          minWidth: "18px", // Reduced from 20px
          height: "18px", // Reduced from 20px
          fontSize: "0.6875rem", // Smaller text
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          color: "#ffffff",
          fontSize: "0.8125rem", // Smaller text
          padding: "6px 10px", // Reduced padding
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          padding: "8px 12px", // Reduced padding
          "& .MuiAlert-icon": {
            color: "inherit",
          },
        },
      },
    },
  },
});
