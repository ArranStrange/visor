import "@mui/material/styles";

declare module "@mui/material/styles" {
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
