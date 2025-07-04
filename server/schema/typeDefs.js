const { gql } = require("apollo-server-express");

module.exports = gql`
  scalar Upload
  scalar JSON

  type PresetSettings {
    # Light settings
    exposure: Float
    contrast: Float
    highlights: Float
    shadows: Float
    whites: Float
    blacks: Float
    texture: Float
    dehaze: Float

    # Color settings
    temp: Float
    tint: Float
    vibrance: Float
    saturation: Float

    # Effects
    clarity: Float
    grain: GrainSettings
    vignette: VignetteSettings
    colorAdjustments: ColorAdjustments
    splitToning: SplitToningSettings

    # Detail
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

  type NoiseReductionSettings {
    luminance: Float
    detail: Float
    color: Float
    colorDetail: Float
    colorSmoothness: Float
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

  type FilmSimSettings {
    dynamicRange: Int
    highlight: Int
    shadow: Int
    colour: Int
    sharpness: Int
    noiseReduction: Int
    grainEffect: String
    clarity: Int
    whiteBalance: String
    wbShift: WhiteBalanceShift
    filmSimulation: String
    colorChromeEffect: String
    colorChromeFxBlue: String
  }

  type WhiteBalanceShift {
    r: Int
    b: Int
  }

  type FilmSim {
    id: ID!
    name: String!
    slug: String!
    description: String
    type: String
    settings: FilmSimSettings
    toneCurve: ToneCurve
    tags: [Tag]
    sampleImages: [Image]
    thumbnail: String
    creator: User
    recommendedPresets: [Preset]
    compatibleCameras: [String]
    notes: String
    comments: [Comment]
    likes: [User]
    createdAt: String
    updatedAt: String
  }

  type Image {
    id: ID!
    url: String
    publicId: String
    caption: String
    associatedWith: AssociatedWith
    uploader: User
    preset: Preset
    filmSim: FilmSim
    tags: [Tag]
    isBeforeImage: Boolean
    isAfterImage: Boolean
    createdAt: String
  }

  type AssociatedWith {
    kind: String!
    item: ID!
  }

  type Comment {
    id: ID!
    author: User!
    content: String!
    preset: Preset
    filmSim: FilmSim
    parent: Comment
    reactions: CommentReactions
    createdAt: String
    updatedAt: String
  }

  type CommentReactions {
    thumbsUp: [User]
    heart: [User]
  }

  type CurvePoint {
    x: Float!
    y: Float!
  }

  type ToneCurve {
    rgb: [CurvePoint]
    red: [CurvePoint]
    green: [CurvePoint]
    blue: [CurvePoint]
  }

  input CurvePointInput {
    x: Float!
    y: Float!
  }

  input ToneCurveInput {
    rgb: [CurvePointInput]
    red: [CurvePointInput]
    green: [CurvePointInput]
    blue: [CurvePointInput]
  }

  input PresetSettingsInput {
    # Light settings
    exposure: Float
    contrast: Float
    highlights: Float
    shadows: Float
    whites: Float
    blacks: Float
    texture: Float
    dehaze: Float

    # Color settings
    temp: Float
    tint: Float
    vibrance: Float
    saturation: Float

    # Effects
    clarity: Float
    grain: GrainSettingsInput
    vignette: VignetteSettingsInput
    colorAdjustments: ColorAdjustmentsInput
    splitToning: SplitToningSettingsInput

    # Detail
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
  }

  input NoiseReductionSettingsInput {
    luminance: Float
    detail: Float
    color: Float
  }

  input FilmSimSettingsInput {
    dynamicRange: String!
    filmSimulation: String!
    whiteBalance: String!
    wbShift: WhiteBalanceShiftInput!
    color: Int!
    sharpness: Int!
    highlight: Int!
    shadow: Int!
    noiseReduction: Int!
    grainEffect: String!
    clarity: Int!
    colorChromeEffect: String!
    colorChromeFxBlue: String!
  }

  input WhiteBalanceShiftInput {
    r: Int!
    b: Int!
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
  }

  input CreateFilmSimInput {
    name: String!
    slug: String!
    description: String
    type: String
    settings: FilmSimSettingsInput
    toneCurve: ToneCurveInput
    tagIds: [ID!]
    sampleImageIds: [ID!]
    notes: String
    recommendedPresetIds: [ID!]
    compatibleCameras: [String!]
  }

  input CreateCommentInput {
    content: String!
    presetId: ID
    filmSimId: ID
    parentId: ID
  }

  input ImageMetaInput {
    caption: String
    presetId: ID
    filmSimId: ID
    tagIds: [ID!]
  }

  input SampleImageInput {
    url: String!
    publicId: String!
  }

  input ImageInput {
    url: String!
    publicId: String!
    associatedWith: AssociatedWithInput
  }

  input AssociatedWithInput {
    kind: String!
    item: ID!
  }

  type Query {
    getPreset(slug: String!): Preset
    getPresetById(id: ID!): Preset
    listPresets(filter: JSON): [Preset]

    getFilmSim(slug: String!): FilmSim
    listFilmSims(filter: JSON): [FilmSim]

    getImage(id: ID!): Image
    listImagesByPreset(presetId: ID!): [Image]

    getCommentsForPreset(presetId: ID!): [Comment]
    getCommentsForFilmSim(filmSimId: ID!): [Comment]
  }

  type Mutation {
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
    ): Preset!

    uploadFilmSim(
      name: String!
      description: String
      settings: FilmSimSettingsInput!
      notes: String
      tags: [String!]!
      sampleImages: [SampleImageInput!]
    ): FilmSim!

    createPreset(input: CreatePresetInput!): Preset
    updatePreset(id: ID!, input: UpdatePresetInput!): Preset
    deletePreset(id: ID!): Boolean
    likePreset(presetId: ID!): Boolean
    downloadPreset(presetId: ID!): Boolean

    createFilmSim(input: CreateFilmSimInput!): FilmSim
    updateFilmSim(id: ID!, input: JSON!): FilmSim
    deleteFilmSim(id: ID!): Boolean
    likeFilmSim(filmSimId: ID!): Boolean

    uploadImage(file: Upload!, input: ImageMetaInput!): Image
    deleteImage(id: ID!): Boolean

    createComment(input: CreateCommentInput!): Comment
    reactToComment(commentId: ID!, reaction: String!): Comment
    deleteComment(id: ID!): Boolean
  }

  type VignetteSettings {
    amount: Float
    midpoint: Float
    feather: Float
    roundness: Float
    style: String
  }
  input GrainSettingsInput {
    amount: Float
    size: Float
    roughness: Float
    frequency: Float
  }

  input NoiseReductionSettingsInput {
    luminance: Float
    detail: Float
    color: Float
    colorDetail: Float
    colorSmoothness: Float
  }

  input VignetteSettingsInput {
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

  type ColorChannel {
    hue: Float
    saturation: Float
    luminance: Float
  }
  input ColorChannelInput {
    hue: Float
    saturation: Float
    luminance: Float
  }

  type SplitToningSettings {
    shadowHue: Float
    shadowSaturation: Float
    highlightHue: Float
    highlightSaturation: Float
    balance: Float
  }
  input SplitToningSettingsInput {
    shadowHue: Float
    shadowSaturation: Float
    highlightHue: Float
    highlightSaturation: Float
    balance: Float
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
  }

  # Comprehensive XMP Settings Types
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

  # Comprehensive XMP Settings Input Types
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
`;
