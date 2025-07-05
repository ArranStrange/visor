# Backend XMP Integration Guide

## Overview

This document outlines the backend requirements for properly handling XMP file data parsed from the frontend. The XMP parser extracts comprehensive settings that need to be stored and retrieved correctly.

## Database Schema Updates

### Preset Model Enhancements

The Preset model should include all the following fields to match the XMP parser output:

```typescript
interface Preset {
  // Existing fields...
  id: string;
  title: string;
  description?: string;
  notes?: string;
  slug: string;
  creator: User;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;

  // Enhanced settings structure
  settings: {
    // Basic Adjustments (Light)
    exposure?: number; // 0-10000 (0-100 in XMP)
    contrast?: number; // 0-10000
    highlights?: number; // 0-10000
    shadows?: number; // 0-10000
    whites?: number; // 0-10000
    blacks?: number; // 0-10000

    // Color
    temp?: number; // 0-10000
    tint?: number; // 0-10000
    vibrance?: number; // 0-10000
    saturation?: number; // 0-10000

    // Effects
    clarity?: number; // 0-10000
    dehaze?: number; // 0-10000
    texture?: number; // 0-10000

    // Detail (Sharpening)
    sharpening?: number; // 0-10000
    sharpenRadius?: number; // 0-10000
    sharpenDetail?: number; // 0-10000
    sharpenEdgeMasking?: number; // 0-10000

    // Detail (Noise Reduction)
    luminanceSmoothing?: number; // 0-10000
    luminanceDetail?: number; // 0-10000
    luminanceContrast?: number; // 0-10000
    noiseReduction?: {
      luminance?: number; // 0-10000
      detail?: number; // 0-10000
      color?: number; // 0-10000
      smoothness?: number; // 0-10000
    };

    // Grain
    grain?: {
      amount?: number; // 0-10000
      size?: number; // 0-10000
      roughness?: number; // 0-10000
    };

    // Color Adjustments (HSL/Color Mixer)
    colorAdjustments?: {
      red?: {
        hue: number; // 0-10000
        saturation: number; // 0-10000
        luminance: number; // 0-10000
      };
      orange?: {
        hue: number;
        saturation: number;
        luminance: number;
      };
      yellow?: {
        hue: number;
        saturation: number;
        luminance: number;
      };
      green?: {
        hue: number;
        saturation: number;
        luminance: number;
      };
      aqua?: {
        hue: number;
        saturation: number;
        luminance: number;
      };
      blue?: {
        hue: number;
        saturation: number;
        luminance: number;
      };
      purple?: {
        hue: number;
        saturation: number;
        luminance: number;
      };
      magenta?: {
        hue: number;
        saturation: number;
        luminance: number;
      };
    };
  };

  // Tone Curve
  toneCurve?: {
    rgb?: Array<{ x: number; y: number }>;
    red?: Array<{ x: number; y: number }>;
    green?: Array<{ x: number; y: number }>;
    blue?: Array<{ x: number; y: number }>;
  };

  // Split Toning (Legacy)
  splitToning?: {
    shadowHue: number; // 0-10000
    shadowSaturation: number; // 0-10000
    highlightHue: number; // 0-10000
    highlightSaturation: number; // 0-10000
    balance: number; // 0-10000
  };

  // Color Grading (New Format)
  colorGrading?: {
    shadowHue: number; // 0-10000
    shadowSat: number; // 0-10000
    shadowLuminance: number; // 0-10000
    midtoneHue: number; // 0-10000
    midtoneSat: number; // 0-10000
    midtoneLuminance: number; // 0-10000
    highlightHue: number; // 0-10000
    highlightSat: number; // 0-10000
    highlightLuminance: number; // 0-10000
    blending: number; // 0-10000
    balance: number; // 0-10000
    globalHue: number; // 0-10000
    globalSat: number; // 0-10000
    perceptual: boolean;
  };

  // Lens Corrections
  lensCorrections?: {
    enableLensProfileCorrections: boolean;
    lensProfileName: string;
    lensManualDistortionAmount: number; // 0-10000
    perspectiveUpright: string;
    autoLateralCA: boolean;
  };

  // Optics
  optics?: {
    removeChromaticAberration: boolean;
    vignetteAmount: number; // 0-10000
    vignetteMidpoint: number; // 0-10000
  };

  // Transform
  transform?: {
    perspectiveVertical: number; // 0-10000
    perspectiveHorizontal: number; // 0-10000
    perspectiveRotate: number; // 0-10000
    perspectiveScale: number; // 0-10000
    perspectiveAspect: number; // 0-10000
    autoPerspective: boolean;
  };

  // Effects (Enhanced)
  effects?: {
    postCropVignetteAmount: number; // 0-10000
    postCropVignetteMidpoint: number; // 0-10000
    postCropVignetteFeather: number; // 0-10000
    postCropVignetteRoundness: number; // 0-10000
    postCropVignetteStyle: string;
    grainAmount: number; // 0-10000
    grainSize: number; // 0-10000
    grainFrequency: number; // 0-10000
  };

  // Calibration
  calibration?: {
    cameraCalibrationBluePrimaryHue: number; // 0-10000
    cameraCalibrationBluePrimarySaturation: number; // 0-10000
    cameraCalibrationGreenPrimaryHue: number; // 0-10000
    cameraCalibrationGreenPrimarySaturation: number; // 0-10000
    cameraCalibrationRedPrimaryHue: number; // 0-10000
    cameraCalibrationRedPrimarySaturation: number; // 0-10000
    cameraCalibrationShadowTint: number; // 0-10000
    cameraCalibrationVersion: string;
  };

  // Crop & Orientation
  crop?: {
    cropTop: number; // 0-10000
    cropLeft: number; // 0-10000
    cropBottom: number; // 0-10000
    cropRight: number; // 0-10000
    cropAngle: number; // 0-10000
    cropConstrainToWarp: boolean;
  };
  orientation?: string;

  // Metadata
  metadata?: {
    rating: number; // 0-10000
    label: string;
    title: string;
    creator: string;
    dateCreated: string;
  };

  // Camera & Profile Metadata
  version?: string;
  processVersion?: string;
  cameraProfile?: string;
  cameraProfileDigest?: string;
  profileName?: string;
  lookTableName?: string;
  whiteBalance?: string;

  // Images
  beforeImage?: Image;
  afterImage?: Image;
  sampleImages?: Image[];
  thumbnail?: string;
}
```

## GraphQL Schema Updates

### Input Types

```graphql
input PresetSettingsInput {
  # Basic Adjustments
  exposure: Int
  contrast: Int
  highlights: Int
  shadows: Int
  whites: Int
  blacks: Int
  clarity: Int
  dehaze: Int
  texture: Int
  vibrance: Int
  saturation: Int
  temp: Int
  tint: Int

  # Detail
  sharpening: Int
  sharpenRadius: Int
  sharpenDetail: Int
  sharpenEdgeMasking: Int
  luminanceSmoothing: Int
  luminanceDetail: Int
  luminanceContrast: Int
  noiseReduction: NoiseReductionInput
  grain: GrainInput
  colorAdjustments: ColorAdjustmentsInput
}

input NoiseReductionInput {
  luminance: Int
  detail: Int
  color: Int
  smoothness: Int
}

input GrainInput {
  amount: Int
  size: Int
  roughness: Int
}

input ColorAdjustmentInput {
  hue: Int
  saturation: Int
  luminance: Int
}

input ColorAdjustmentsInput {
  red: ColorAdjustmentInput
  orange: ColorAdjustmentInput
  yellow: ColorAdjustmentInput
  green: ColorAdjustmentInput
  aqua: ColorAdjustmentInput
  blue: ColorAdjustmentInput
  purple: ColorAdjustmentInput
  magenta: ColorAdjustmentInput
}

input ToneCurvePointInput {
  x: Int!
  y: Int!
}

input ToneCurveInput {
  rgb: [ToneCurvePointInput!]
  red: [ToneCurvePointInput!]
  green: [ToneCurvePointInput!]
  blue: [ToneCurvePointInput!]
}

input SplitToningInput {
  shadowHue: Int
  shadowSaturation: Int
  highlightHue: Int
  highlightSaturation: Int
  balance: Int
}

input ColorGradingInput {
  shadowHue: Int
  shadowSat: Int
  shadowLuminance: Int
  midtoneHue: Int
  midtoneSat: Int
  midtoneLuminance: Int
  highlightHue: Int
  highlightSat: Int
  highlightLuminance: Int
  blending: Int
  balance: Int
  globalHue: Int
  globalSat: Int
  perceptual: Boolean
}

input LensCorrectionsInput {
  enableLensProfileCorrections: Boolean
  lensProfileName: String
  lensManualDistortionAmount: Int
  perspectiveUpright: String
  autoLateralCA: Boolean
}

input OpticsInput {
  removeChromaticAberration: Boolean
  vignetteAmount: Int
  vignetteMidpoint: Int
}

input TransformInput {
  perspectiveVertical: Int
  perspectiveHorizontal: Int
  perspectiveRotate: Int
  perspectiveScale: Int
  perspectiveAspect: Int
  autoPerspective: Boolean
}

input EffectsInput {
  postCropVignetteAmount: Int
  postCropVignetteMidpoint: Int
  postCropVignetteFeather: Int
  postCropVignetteRoundness: Int
  postCropVignetteStyle: String
  grainAmount: Int
  grainSize: Int
  grainFrequency: Int
}

input CalibrationInput {
  cameraCalibrationBluePrimaryHue: Int
  cameraCalibrationBluePrimarySaturation: Int
  cameraCalibrationGreenPrimaryHue: Int
  cameraCalibrationGreenPrimarySaturation: Int
  cameraCalibrationRedPrimaryHue: Int
  cameraCalibrationRedPrimarySaturation: Int
  cameraCalibrationShadowTint: Int
  cameraCalibrationVersion: String
}

input CropInput {
  cropTop: Int
  cropLeft: Int
  cropBottom: Int
  cropRight: Int
  cropAngle: Int
  cropConstrainToWarp: Boolean
}

input MetadataInput {
  rating: Int
  label: String
  title: String
  creator: String
  dateCreated: String
}

input UpdatePresetInput {
  title: String
  description: String
  notes: String
  settings: PresetSettingsInput
  toneCurve: ToneCurveInput
  splitToning: SplitToningInput
  colorGrading: ColorGradingInput
  lensCorrections: LensCorrectionsInput
  optics: OpticsInput
  transform: TransformInput
  effects: EffectsInput
  calibration: CalibrationInput
  crop: CropInput
  orientation: String
  metadata: MetadataInput
  version: String
  processVersion: String
  cameraProfile: String
  cameraProfileDigest: String
  profileName: String
  lookTableName: String
  whiteBalance: String
}
```

### Type Definitions

```graphql
type Preset {
  id: ID!
  title: String!
  description: String
  notes: String
  slug: String!
  creator: User!
  tags: [Tag!]!
  createdAt: String!
  updatedAt: String!

  # Enhanced settings
  settings: PresetSettings
  toneCurve: ToneCurve
  splitToning: SplitToning
  colorGrading: ColorGrading
  lensCorrections: LensCorrections
  optics: Optics
  transform: Transform
  effects: Effects
  calibration: Calibration
  crop: Crop
  orientation: String
  metadata: Metadata

  # Camera & Profile
  version: String
  processVersion: String
  cameraProfile: String
  cameraProfileDigest: String
  profileName: String
  lookTableName: String
  whiteBalance: String

  # Images
  beforeImage: Image
  afterImage: Image
  sampleImages: [Image!]
  thumbnail: String
}

type PresetSettings {
  # Basic Adjustments
  exposure: Int
  contrast: Int
  highlights: Int
  shadows: Int
  whites: Int
  blacks: Int
  clarity: Int
  dehaze: Int
  texture: Int
  vibrance: Int
  saturation: Int
  temp: Int
  tint: Int

  # Detail
  sharpening: Int
  sharpenRadius: Int
  sharpenDetail: Int
  sharpenEdgeMasking: Int
  luminanceSmoothing: Int
  luminanceDetail: Int
  luminanceContrast: Int
  noiseReduction: NoiseReduction
  grain: Grain
  colorAdjustments: ColorAdjustments
}

type NoiseReduction {
  luminance: Int
  detail: Int
  color: Int
  smoothness: Int
}

type Grain {
  amount: Int
  size: Int
  roughness: Int
}

type ColorAdjustment {
  hue: Int
  saturation: Int
  luminance: Int
}

type ColorAdjustments {
  red: ColorAdjustment
  orange: ColorAdjustment
  yellow: ColorAdjustment
  green: ColorAdjustment
  aqua: ColorAdjustment
  blue: ColorAdjustment
  purple: ColorAdjustment
  magenta: ColorAdjustment
}

type ToneCurvePoint {
  x: Int!
  y: Int!
}

type ToneCurve {
  rgb: [ToneCurvePoint!]
  red: [ToneCurvePoint!]
  green: [ToneCurvePoint!]
  blue: [ToneCurvePoint!]
}

type SplitToning {
  shadowHue: Int
  shadowSaturation: Int
  highlightHue: Int
  highlightSaturation: Int
  balance: Int
}

type ColorGrading {
  shadowHue: Int
  shadowSat: Int
  shadowLuminance: Int
  midtoneHue: Int
  midtoneSat: Int
  midtoneLuminance: Int
  highlightHue: Int
  highlightSat: Int
  highlightLuminance: Int
  blending: Int
  balance: Int
  globalHue: Int
  globalSat: Int
  perceptual: Boolean
}

type LensCorrections {
  enableLensProfileCorrections: Boolean
  lensProfileName: String
  lensManualDistortionAmount: Int
  perspectiveUpright: String
  autoLateralCA: Boolean
}

type Optics {
  removeChromaticAberration: Boolean
  vignetteAmount: Int
  vignetteMidpoint: Int
}

type Transform {
  perspectiveVertical: Int
  perspectiveHorizontal: Int
  perspectiveRotate: Int
  perspectiveScale: Int
  perspectiveAspect: Int
  autoPerspective: Boolean
}

type Effects {
  postCropVignetteAmount: Int
  postCropVignetteMidpoint: Int
  postCropVignetteFeather: Int
  postCropVignetteRoundness: Int
  postCropVignetteStyle: String
  grainAmount: Int
  grainSize: Int
  grainFrequency: Int
}

type Calibration {
  cameraCalibrationBluePrimaryHue: Int
  cameraCalibrationBluePrimarySaturation: Int
  cameraCalibrationGreenPrimaryHue: Int
  cameraCalibrationGreenPrimarySaturation: Int
  cameraCalibrationRedPrimaryHue: Int
  cameraCalibrationRedPrimarySaturation: Int
  cameraCalibrationShadowTint: Int
  cameraCalibrationVersion: String
}

type Crop {
  cropTop: Int
  cropLeft: Int
  cropBottom: Int
  cropRight: Int
  cropAngle: Int
  cropConstrainToWarp: Boolean
}

type Metadata {
  rating: Int
  label: String
  title: String
  creator: String
  dateCreated: String
}
```

## Mutation Updates

### Update Preset Mutation

```graphql
mutation UpdatePreset($id: ID!, $input: UpdatePresetInput!) {
  updatePreset(id: $id, input: $input) {
    id
    title
    description
    notes
    settings {
      exposure
      contrast
      highlights
      shadows
      whites
      blacks
      clarity
      dehaze
      texture
      vibrance
      saturation
      temp
      tint
      sharpening
      sharpenRadius
      sharpenDetail
      sharpenEdgeMasking
      luminanceSmoothing
      luminanceDetail
      luminanceContrast
      noiseReduction {
        luminance
        detail
        color
        smoothness
      }
      grain {
        amount
        size
        roughness
      }
      colorAdjustments {
        red {
          hue
          saturation
          luminance
        }
        orange {
          hue
          saturation
          luminance
        }
        yellow {
          hue
          saturation
          luminance
        }
        green {
          hue
          saturation
          luminance
        }
        aqua {
          hue
          saturation
          luminance
        }
        blue {
          hue
          saturation
          luminance
        }
        purple {
          hue
          saturation
          luminance
        }
        magenta {
          hue
          saturation
          luminance
        }
      }
    }
    toneCurve {
      rgb {
        x
        y
      }
      red {
        x
        y
      }
      green {
        x
        y
      }
      blue {
        x
        y
      }
    }
    splitToning {
      shadowHue
      shadowSaturation
      highlightHue
      highlightSaturation
      balance
    }
    colorGrading {
      shadowHue
      shadowSat
      shadowLuminance
      midtoneHue
      midtoneSat
      midtoneLuminance
      highlightHue
      highlightSat
      highlightLuminance
      blending
      balance
      globalHue
      globalSat
      perceptual
    }
    lensCorrections {
      enableLensProfileCorrections
      lensProfileName
      lensManualDistortionAmount
      perspectiveUpright
      autoLateralCA
    }
    optics {
      removeChromaticAberration
      vignetteAmount
      vignetteMidpoint
    }
    transform {
      perspectiveVertical
      perspectiveHorizontal
      perspectiveRotate
      perspectiveScale
      perspectiveAspect
      autoPerspective
    }
    effects {
      postCropVignetteAmount
      postCropVignetteMidpoint
      postCropVignetteFeather
      postCropVignetteRoundness
      postCropVignetteStyle
      grainAmount
      grainSize
      grainFrequency
    }
    calibration {
      cameraCalibrationBluePrimaryHue
      cameraCalibrationBluePrimarySaturation
      cameraCalibrationGreenPrimaryHue
      cameraCalibrationGreenPrimarySaturation
      cameraCalibrationRedPrimaryHue
      cameraCalibrationRedPrimarySaturation
      cameraCalibrationShadowTint
      cameraCalibrationVersion
    }
    crop {
      cropTop
      cropLeft
      cropBottom
      cropRight
      cropAngle
      cropConstrainToWarp
    }
    orientation
    metadata {
      rating
      label
      title
      creator
      dateCreated
    }
    version
    processVersion
    cameraProfile
    cameraProfileDigest
    profileName
    lookTableName
    whiteBalance
  }
}
```

## Query Updates

### Get Preset By Slug Query

```graphql
query GetPresetBySlug($slug: String!) {
  getPreset(slug: $slug) {
    id
    title
    description
    notes
    slug
    creator {
      id
      username
      avatar
      instagram
    }
    tags {
      id
      displayName
    }
    createdAt
    updatedAt

    # Enhanced settings
    settings {
      exposure
      contrast
      highlights
      shadows
      whites
      blacks
      clarity
      dehaze
      texture
      vibrance
      saturation
      temp
      tint
      sharpening
      sharpenRadius
      sharpenDetail
      sharpenEdgeMasking
      luminanceSmoothing
      luminanceDetail
      luminanceContrast
      noiseReduction {
        luminance
        detail
        color
        smoothness
      }
      grain {
        amount
        size
        roughness
      }
      colorAdjustments {
        red {
          hue
          saturation
          luminance
        }
        orange {
          hue
          saturation
          luminance
        }
        yellow {
          hue
          saturation
          luminance
        }
        green {
          hue
          saturation
          luminance
        }
        aqua {
          hue
          saturation
          luminance
        }
        blue {
          hue
          saturation
          luminance
        }
        purple {
          hue
          saturation
          luminance
        }
        magenta {
          hue
          saturation
          luminance
        }
      }
    }
    toneCurve {
      rgb {
        x
        y
      }
      red {
        x
        y
      }
      green {
        x
        y
      }
      blue {
        x
        y
      }
    }
    splitToning {
      shadowHue
      shadowSaturation
      highlightHue
      highlightSaturation
      balance
    }
    colorGrading {
      shadowHue
      shadowSat
      shadowLuminance
      midtoneHue
      midtoneSat
      midtoneLuminance
      highlightHue
      highlightSat
      highlightLuminance
      blending
      balance
      globalHue
      globalSat
      perceptual
    }
    lensCorrections {
      enableLensProfileCorrections
      lensProfileName
      lensManualDistortionAmount
      perspectiveUpright
      autoLateralCA
    }
    optics {
      removeChromaticAberration
      vignetteAmount
      vignetteMidpoint
    }
    transform {
      perspectiveVertical
      perspectiveHorizontal
      perspectiveRotate
      perspectiveScale
      perspectiveAspect
      autoPerspective
    }
    effects {
      postCropVignetteAmount
      postCropVignetteMidpoint
      postCropVignetteFeather
      postCropVignetteRoundness
      postCropVignetteStyle
      grainAmount
      grainSize
      grainFrequency
    }
    calibration {
      cameraCalibrationBluePrimaryHue
      cameraCalibrationBluePrimarySaturation
      cameraCalibrationGreenPrimaryHue
      cameraCalibrationGreenPrimarySaturation
      cameraCalibrationRedPrimaryHue
      cameraCalibrationRedPrimarySaturation
      cameraCalibrationShadowTint
      cameraCalibrationVersion
    }
    crop {
      cropTop
      cropLeft
      cropBottom
      cropRight
      cropAngle
      cropConstrainToWarp
    }
    orientation
    metadata {
      rating
      label
      title
      creator
      dateCreated
    }
    version
    processVersion
    cameraProfile
    cameraProfileDigest
    profileName
    lookTableName
    whiteBalance

    # Images
    beforeImage {
      id
      url
      caption
    }
    afterImage {
      id
      url
      caption
    }
    sampleImages {
      id
      url
      caption
    }
    thumbnail
  }
}
```

## Implementation Notes

### Value Conversion

- XMP values are typically in the range 0-100 (floating point)
- Database values should be stored as integers in the range 0-10000 (multiplied by 100)
- Frontend displays values as 0-100 (divided by 100)

### Data Validation

- All numeric values should be validated to ensure they're within expected ranges
- Boolean values should be properly handled
- String values should be sanitized
- Arrays (like tone curve points) should be validated for structure

### Performance Considerations

- Consider indexing frequently queried fields
- Large JSON objects (like settings) might benefit from compression
- Consider caching for frequently accessed presets

### Migration Strategy

- Add new fields as optional initially
- Provide default values for existing records
- Gradually migrate existing data to new structure
- Maintain backward compatibility during transition

## Testing Requirements

### Unit Tests

- Test all field mappings from XMP to database format
- Test value conversion (XMP 0-100 to DB 0-10000)
- Test validation of all input types
- Test error handling for malformed data

### Integration Tests

- Test complete XMP file upload and parsing flow
- Test preset creation with full XMP data
- Test preset updates with partial XMP data
- Test query performance with large datasets

### End-to-End Tests

- Test complete user workflow from XMP upload to preset display
- Test editing preset with XMP data
- Test downloading XMP files with all settings
