const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type PresetSettings {
    exposure: Float
    contrast: Float
    highlights: Float
    shadows: Float
    whites: Float
    blacks: Float
    temp: Float
    tint: Float
    vibrance: Float
    saturation: Float
    clarity: Float
    dehaze: Float
    texture: Float
    grain: GrainSettings
    vignette: VignetteSettings
    colorAdjustments: ColorAdjustments
    splitToning: SplitToningSettings
    sharpening: Float
    sharpenRadius: Float
    sharpenDetail: Float
    sharpenEdgeMasking: Float
    luminanceSmoothing: Float
    luminanceDetail: Float
    luminanceContrast: Float
    noiseReduction: NoiseReductionSettings
  }

  type GrainSettings {
    amount: Float
    size: Float
    roughness: Float
    frequency: Float
  }

  type VignetteSettings {
    amount: Float
    midpoint: Float
    feather: Float
    roundness: Float
    style: String
  }

  type ColorAdjustments {
    red: ColorChannel
    orange: ColorChannel
    yellow: ColorChannel
    green: ColorChannel
    aqua: ColorChannel
    blue: ColorChannel
    purple: ColorChannel
    magenta: ColorChannel
  }

  type ColorChannel {
    hue: Float
    saturation: Float
    luminance: Float
  }

  type NoiseReductionSettings {
    luminance: Float
    detail: Float
    color: Float
    colorDetail: Float
    colorSmoothness: Float
  }

  type ColorGrading {
    shadowHue: Float
    shadowSat: Float
    shadowLuminance: Float
    midtoneHue: Float
    midtoneSat: Float
    midtoneLuminance: Float
    highlightHue: Float
    highlightSat: Float
    highlightLuminance: Float
    blending: Float
    globalHue: Float
    globalSat: Float
    perceptual: Boolean
  }

  type LensCorrections {
    enableLensProfileCorrections: Boolean
    lensProfileName: String
    lensManualDistortionAmount: Float
    perspectiveUpright: String
    autoLateralCA: Boolean
  }

  type OpticsSettings {
    removeChromaticAberration: Boolean
    vignetteAmount: Float
    vignetteMidpoint: Float
  }

  type TransformSettings {
    perspectiveVertical: Float
    perspectiveHorizontal: Float
    perspectiveRotate: Float
    perspectiveScale: Float
    perspectiveAspect: Float
    autoPerspective: Boolean
  }

  type EffectsSettings {
    postCropVignetteAmount: Float
    postCropVignetteMidpoint: Float
    postCropVignetteFeather: Float
    postCropVignetteRoundness: Float
    postCropVignetteStyle: String
    grainAmount: Float
    grainSize: Float
    grainFrequency: Float
  }

  type CalibrationSettings {
    cameraCalibrationBluePrimaryHue: Float
    cameraCalibrationBluePrimarySaturation: Float
    cameraCalibrationGreenPrimaryHue: Float
    cameraCalibrationGreenPrimarySaturation: Float
    cameraCalibrationRedPrimaryHue: Float
    cameraCalibrationRedPrimarySaturation: Float
    cameraCalibrationShadowTint: Float
    cameraCalibrationVersion: String
  }

  type CropSettings {
    cropTop: Float
    cropLeft: Float
    cropBottom: Float
    cropRight: Float
    cropAngle: Float
    cropConstrainToWarp: Boolean
  }

  type MetadataSettings {
    rating: Int
    label: String
    title: String
    creator: String
    dateCreated: String
  }

  type Preset {
    id: ID!
    title: String!
    slug: String!
    description: String
    xmpUrl: String
    settings: PresetSettings
    toneCurve: ToneCurve
    notes: String
    tags: [Tag]
    thumbnail: String
    creator: User
    filmSim: FilmSim
    likes: [User]
    downloads: Int
    isPublished: Boolean
    comments: [Comment]
    createdAt: String
    updatedAt: String
    beforeImage: Image
    afterImage: Image
    sampleImages: [Image!]

    # Camera & Profile Metadata
    cameraProfileDigest: String
    profileName: String
    lookTableName: String

    # Color Grading
    colorGrading: ColorGrading

    # Lens Corrections
    lensCorrections: LensCorrections

    # Optics
    optics: OpticsSettings

    # Transform
    transform: TransformSettings

    # Effects
    effects: EffectsSettings

    # Calibration
    calibration: CalibrationSettings

    # Crop & Orientation
    crop: CropSettings
    orientation: String

    # Metadata
    metadata: MetadataSettings

    # Other
    hasSettings: Boolean
    rawFileName: String
    snapshot: String
  }

  input CurvePointInput {
    x: Float!
    y: Float!
  }

  input ToneCurveInput {
    rgb: [CurvePointInput!]
    red: [CurvePointInput!]
    green: [CurvePointInput!]
    blue: [CurvePointInput!]
  }

  input PresetSettingsInput {
    exposure: Float
    contrast: Float
    highlights: Float
    shadows: Float
    whites: Float
    blacks: Float
    temp: Float
    tint: Float
    vibrance: Float
    saturation: Float
    clarity: Float
    dehaze: Float
    texture: Float
    grain: GrainSettingsInput
    vignette: VignetteSettingsInput
    colorAdjustments: ColorAdjustmentsInput
    splitToning: SplitToningSettingsInput
    sharpening: Float
    sharpenRadius: Float
    sharpenDetail: Float
    sharpenEdgeMasking: Float
    luminanceSmoothing: Float
    luminanceDetail: Float
    luminanceContrast: Float
    noiseReduction: NoiseReductionSettingsInput
  }

  input GrainSettingsInput {
    amount: Float
    size: Float
    roughness: Float
    frequency: Float
  }

  input VignetteSettingsInput {
    amount: Float
    midpoint: Float
    feather: Float
    roundness: Float
    style: String
  }

  input ColorAdjustmentsInput {
    red: ColorChannelInput
    orange: ColorChannelInput
    yellow: ColorChannelInput
    green: ColorChannelInput
    aqua: ColorChannelInput
    blue: ColorChannelInput
    purple: ColorChannelInput
    magenta: ColorChannelInput
  }

  input ColorChannelInput {
    hue: Float
    saturation: Float
    luminance: Float
  }

  input NoiseReductionSettingsInput {
    luminance: Float
    detail: Float
    color: Float
    colorDetail: Float
    colorSmoothness: Float
  }

  input ColorGradingInput {
    shadowHue: Float
    shadowSat: Float
    shadowLuminance: Float
    midtoneHue: Float
    midtoneSat: Float
    midtoneLuminance: Float
    highlightHue: Float
    highlightSat: Float
    highlightLuminance: Float
    blending: Float
    globalHue: Float
    globalSat: Float
    perceptual: Boolean
  }

  input LensCorrectionsInput {
    enableLensProfileCorrections: Boolean
    lensProfileName: String
    lensManualDistortionAmount: Float
    perspectiveUpright: String
    autoLateralCA: Boolean
  }

  input OpticsSettingsInput {
    removeChromaticAberration: Boolean
    vignetteAmount: Float
    vignetteMidpoint: Float
  }

  input TransformSettingsInput {
    perspectiveVertical: Float
    perspectiveHorizontal: Float
    perspectiveRotate: Float
    perspectiveScale: Float
    perspectiveAspect: Float
    autoPerspective: Boolean
  }

  input EffectsSettingsInput {
    postCropVignetteAmount: Float
    postCropVignetteMidpoint: Float
    postCropVignetteFeather: Float
    postCropVignetteRoundness: Float
    postCropVignetteStyle: String
    grainAmount: Float
    grainSize: Float
    grainFrequency: Float
  }

  input CalibrationSettingsInput {
    cameraCalibrationBluePrimaryHue: Float
    cameraCalibrationBluePrimarySaturation: Float
    cameraCalibrationGreenPrimaryHue: Float
    cameraCalibrationGreenPrimarySaturation: Float
    cameraCalibrationRedPrimaryHue: Float
    cameraCalibrationRedPrimarySaturation: Float
    cameraCalibrationShadowTint: Float
    cameraCalibrationVersion: String
  }

  input CropSettingsInput {
    cropTop: Float
    cropLeft: Float
    cropBottom: Float
    cropRight: Float
    cropAngle: Float
    cropConstrainToWarp: Boolean
  }

  input MetadataSettingsInput {
    rating: Int
    label: String
    title: String
    creator: String
    dateCreated: String
  }

  input CreatePresetInput {
    title: String!
    slug: String!
    description: String
    xmpUrl: String
    settings: PresetSettingsInput
    toneCurve: ToneCurveInput
    notes: String
    tagIds: [ID!]
    filmSimId: ID
    sampleImageIds: [ID!]

    # New comprehensive settings
    cameraProfileDigest: String
    profileName: String
    lookTableName: String
    colorGrading: ColorGradingInput
    lensCorrections: LensCorrectionsInput
    optics: OpticsSettingsInput
    transform: TransformSettingsInput
    effects: EffectsSettingsInput
    calibration: CalibrationSettingsInput
    crop: CropSettingsInput
    orientation: String
    metadata: MetadataSettingsInput
    hasSettings: Boolean
    rawFileName: String
    snapshot: String
  }

  input UpdatePresetInput {
    title: String
    description: String
    settings: PresetSettingsInput
    toneCurve: ToneCurveInput
    notes: String
    tagIds: [ID!]
    filmSimId: ID
    sampleImageIds: [ID!]

    # New comprehensive settings
    cameraProfileDigest: String
    profileName: String
    lookTableName: String
    colorGrading: ColorGradingInput
    lensCorrections: LensCorrectionsInput
    optics: OpticsSettingsInput
    transform: TransformSettingsInput
    effects: EffectsSettingsInput
    calibration: CalibrationSettingsInput
    crop: CropSettingsInput
    orientation: String
    metadata: MetadataSettingsInput
    hasSettings: Boolean
    rawFileName: String
    snapshot: String
  }

  input UploadPresetInput {
    title: String!
    description: String
    tags: [String!]!
    settings: PresetSettingsInput!
    toneCurve: ToneCurveInput
    notes: String
    beforeImage: Upload
    afterImage: Upload

    # New comprehensive settings
    cameraProfileDigest: String
    profileName: String
    lookTableName: String
    colorGrading: ColorGradingInput
    lensCorrections: LensCorrectionsInput
    optics: OpticsSettingsInput
    transform: TransformSettingsInput
    effects: EffectsSettingsInput
    calibration: CalibrationSettingsInput
    crop: CropSettingsInput
    orientation: String
    metadata: MetadataSettingsInput
    hasSettings: Boolean
    rawFileName: String
    snapshot: String
  }

  extend type Query {
    getPreset(slug: String!): Preset
    getPresetById(id: ID!): Preset
    listPresets(filter: JSON): [Preset]
  }

  extend type Mutation {
    uploadPreset(
      title: String!
      description: String
      settings: PresetSettingsInput!
      toneCurve: ToneCurveInput
      notes: String
      tags: [String!]!
      beforeImage: ImageInput
      afterImage: ImageInput
      sampleImages: [ImageInput!]

      # New comprehensive settings
      cameraProfileDigest: String
      profileName: String
      lookTableName: String
      colorGrading: ColorGradingInput
      lensCorrections: LensCorrectionsInput
      optics: OpticsSettingsInput
      transform: TransformSettingsInput
      effects: EffectsSettingsInput
      calibration: CalibrationSettingsInput
      crop: CropSettingsInput
      orientation: String
      metadata: MetadataSettingsInput
      hasSettings: Boolean
      rawFileName: String
      snapshot: String
    ): Preset!
    createPreset(input: CreatePresetInput!): Preset
    updatePreset(id: ID!, input: UpdatePresetInput!): Preset
    deletePreset(id: ID!): Boolean
    likePreset(presetId: ID!): Boolean
    downloadPreset(presetId: ID!): Boolean
  }
`;

module.exports = typeDefs;
