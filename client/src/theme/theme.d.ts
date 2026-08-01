import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface OverlayPalette {
    /** 15% black — resting wash that keeps card titles legible. */
    scrimSubtle: string;
    /** 30% black — badges and soft containers over imagery. */
    scrimMedium: string;
    /** 50% black — hover emphasis over imagery. */
    scrimStrong: string;
    /** 70% black — solid controls over imagery. */
    scrimHeavy: string;
    /** 90% white — matches overlayTitle/overlaySubtitle text. */
    white: string;
    /** 70% white — secondary text/icons over imagery. */
    whiteSoft: string;
    /** 20% white — hover fills. */
    whiteHover: string;
    /** 10% white — hairline borders. */
    whiteBorder: string;
  }

  interface Palette {
    overlay: OverlayPalette;
  }

  interface PaletteOptions {
    overlay?: OverlayPalette;
  }

  interface TypographyVariants {
    overlayTitle: React.CSSProperties;
    overlaySubtitle: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    overlayTitle?: React.CSSProperties;
    overlaySubtitle?: React.CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    overlayTitle: true;
    overlaySubtitle: true;
  }
}

declare module "@mui/material/Avatar" {
  interface AvatarPropsVariantOverrides {
    creator: true;
  }
}

declare module "@mui/material/Chip" {
  interface ChipPropsVariantOverrides {
    overlay: true;
  }
}
