const formatToneCurvePoints = (arr) =>
  (arr || []).map(({ x, y }) => ({
    x: parseFloat(x) || 0,
    y: parseFloat(y) || 0,
  }));

const cleanSettings = (settings) => {
  if (!settings) return {};

  const { colorGrading, ...settingsWithoutColorGrading } = settings;

  return {
    // Basic adjustments
    exposure: Number(settingsWithoutColorGrading.exposure) || 0,
    contrast: Number(settingsWithoutColorGrading.contrast) || 0,
    highlights: Number(settingsWithoutColorGrading.highlights) || 0,
    shadows: Number(settingsWithoutColorGrading.shadows) || 0,
    whites: Number(settingsWithoutColorGrading.whites) || 0,
    blacks: Number(settingsWithoutColorGrading.blacks) || 0,
    texture: Number(settingsWithoutColorGrading.texture) || 0,
    dehaze: Number(settingsWithoutColorGrading.dehaze) || 0,
    clarity: Number(settingsWithoutColorGrading.clarity) || 0,
    vibrance: Number(settingsWithoutColorGrading.vibrance) || 0,
    saturation: Number(settingsWithoutColorGrading.saturation) || 0,
    temp: Number(settingsWithoutColorGrading.temp) || 0,
    tint: Number(settingsWithoutColorGrading.tint) || 0,

    sharpening: Number(settingsWithoutColorGrading.sharpening) || 0,
    sharpenRadius: Number(settingsWithoutColorGrading.sharpenRadius) || 0,
    sharpenDetail: Number(settingsWithoutColorGrading.sharpenDetail) || 0,
    sharpenEdgeMasking:
      Number(settingsWithoutColorGrading.sharpenEdgeMasking) || 0,
    luminanceSmoothing:
      Number(settingsWithoutColorGrading.luminanceSmoothing) || 0,
    luminanceDetail: Number(settingsWithoutColorGrading.luminanceDetail) || 0,
    luminanceContrast:
      Number(settingsWithoutColorGrading.luminanceContrast) || 0,

    grain: settingsWithoutColorGrading.grain
      ? {
          amount: Number(settingsWithoutColorGrading.grain.amount) || 0,
          size: Number(settingsWithoutColorGrading.grain.size) || 0,
          frequency: Number(settingsWithoutColorGrading.grain.frequency) || 0,
          roughness: Number(settingsWithoutColorGrading.grain.roughness) || 0,
        }
      : undefined,
    vignette: settingsWithoutColorGrading.vignette
      ? {
          amount: Number(settingsWithoutColorGrading.vignette.amount) || 0,
          midpoint: Number(settingsWithoutColorGrading.vignette.midpoint) || 0,
          feather: Number(settingsWithoutColorGrading.vignette.feather) || 0,
          roundness:
            Number(settingsWithoutColorGrading.vignette.roundness) || 0,
          style:
            settingsWithoutColorGrading.vignette.style || "Highlight Priority",
        }
      : undefined,
    colorAdjustments: settingsWithoutColorGrading.colorAdjustments
      ? {
          ...settingsWithoutColorGrading.colorAdjustments,
          red: settingsWithoutColorGrading.colorAdjustments.red
            ? {
                hue:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.red.hue
                  ) || 0,
                saturation:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.red.saturation
                  ) || 0,
                luminance:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.red.luminance
                  ) || 0,
              }
            : undefined,
          orange: settingsWithoutColorGrading.colorAdjustments.orange
            ? {
                hue:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.orange.hue
                  ) || 0,
                saturation:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.orange
                      .saturation
                  ) || 0,
                luminance:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.orange
                      .luminance
                  ) || 0,
              }
            : undefined,
          yellow: settingsWithoutColorGrading.colorAdjustments.yellow
            ? {
                hue:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.yellow.hue
                  ) || 0,
                saturation:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.yellow
                      .saturation
                  ) || 0,
                luminance:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.yellow
                      .luminance
                  ) || 0,
              }
            : undefined,
          green: settingsWithoutColorGrading.colorAdjustments.green
            ? {
                hue:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.green.hue
                  ) || 0,
                saturation:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.green
                      .saturation
                  ) || 0,
                luminance:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.green.luminance
                  ) || 0,
              }
            : undefined,
          aqua: settingsWithoutColorGrading.colorAdjustments.aqua
            ? {
                hue:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.aqua.hue
                  ) || 0,
                saturation:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.aqua.saturation
                  ) || 0,
                luminance:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.aqua.luminance
                  ) || 0,
              }
            : undefined,
          blue: settingsWithoutColorGrading.colorAdjustments.blue
            ? {
                hue:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.blue.hue
                  ) || 0,
                saturation:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.blue.saturation
                  ) || 0,
                luminance:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.blue.luminance
                  ) || 0,
              }
            : undefined,
          purple: settingsWithoutColorGrading.colorAdjustments.purple
            ? {
                hue:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.purple.hue
                  ) || 0,
                saturation:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.purple
                      .saturation
                  ) || 0,
                luminance:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.purple
                      .luminance
                  ) || 0,
              }
            : undefined,
          magenta: settingsWithoutColorGrading.colorAdjustments.magenta
            ? {
                hue:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.magenta.hue
                  ) || 0,
                saturation:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.magenta
                      .saturation
                  ) || 0,
                luminance:
                  Number(
                    settingsWithoutColorGrading.colorAdjustments.magenta
                      .luminance
                  ) || 0,
              }
            : undefined,
        }
      : undefined,
    splitToning: settingsWithoutColorGrading.splitToning
      ? {
          shadowHue:
            Number(settingsWithoutColorGrading.splitToning.shadowHue) || 0,
          shadowSaturation:
            Number(settingsWithoutColorGrading.splitToning.shadowSaturation) ||
            0,
          highlightHue:
            Number(settingsWithoutColorGrading.splitToning.highlightHue) || 0,
          highlightSaturation:
            Number(
              settingsWithoutColorGrading.splitToning.highlightSaturation
            ) || 0,
          balance: Number(settingsWithoutColorGrading.splitToning.balance) || 0,
        }
      : undefined,
    noiseReduction: settingsWithoutColorGrading.noiseReduction
      ? {
          luminance:
            Number(settingsWithoutColorGrading.noiseReduction.luminance) || 0,
          detail:
            Number(settingsWithoutColorGrading.noiseReduction.detail) || 0,
          color: Number(settingsWithoutColorGrading.noiseReduction.color) || 0,
          colorDetail:
            Number(settingsWithoutColorGrading.noiseReduction.colorDetail) || 0,
          colorSmoothness:
            Number(
              settingsWithoutColorGrading.noiseReduction.colorSmoothness
            ) || 0,
          smoothness:
            Number(settingsWithoutColorGrading.noiseReduction.smoothness) || 0,
        }
      : undefined,
  };
};

const cleanToneCurve = (toneCurve) => {
  if (!toneCurve) return undefined;
  const cleanPoints = (arr) =>
    Array.isArray(arr)
      ? arr.map(({ x, y }) => ({
          x: Number(x) || 0,
          y: Number(y) || 0,
        }))
      : [];
  return {
    rgb: cleanPoints(toneCurve.rgb),
    red: cleanPoints(toneCurve.red),
    green: cleanPoints(toneCurve.green),
    blue: cleanPoints(toneCurve.blue),
  };
};

const cleanComprehensiveSettings = (data) => {
  if (!data) return {};

  return {
    cameraProfileDigest: data.cameraProfileDigest || undefined,
    profileName: data.profileName || undefined,
    lookTableName: data.lookTableName || undefined,
    version: data.version || undefined,
    processVersion: data.processVersion || undefined,
    cameraProfile: data.cameraProfile || undefined,
    whiteBalance: data.whiteBalance || undefined,

    colorGrading: data.colorGrading
      ? {
          shadowHue: Number(data.colorGrading.shadowHue) || 0,
          shadowSat: Number(data.colorGrading.shadowSat) || 0,
          shadowLuminance: Number(data.colorGrading.shadowLuminance) || 0,
          midtoneHue: Number(data.colorGrading.midtoneHue) || 0,
          midtoneSat: Number(data.colorGrading.midtoneSat) || 0,
          midtoneLuminance: Number(data.colorGrading.midtoneLuminance) || 0,
          highlightHue: Number(data.colorGrading.highlightHue) || 0,
          highlightSat: Number(data.colorGrading.highlightSat) || 0,
          highlightLuminance: Number(data.colorGrading.highlightLuminance) || 0,
          blending: Number(data.colorGrading.blending) || 0,
          balance: Number(data.colorGrading.balance) || 0,
          globalHue: Number(data.colorGrading.globalHue) || 0,
          globalSat: Number(data.colorGrading.globalSat) || 0,
          perceptual: Boolean(data.colorGrading.perceptual),
        }
      : undefined,

    lensCorrections: data.lensCorrections
      ? {
          enableLensProfileCorrections: Boolean(
            data.lensCorrections.enableLensProfileCorrections
          ),
          lensProfileName: data.lensCorrections.lensProfileName || undefined,
          lensManualDistortionAmount:
            Number(data.lensCorrections.lensManualDistortionAmount) || 0,
          perspectiveUpright: data.lensCorrections.perspectiveUpright || "Off",
          autoLateralCA: Boolean(data.lensCorrections.autoLateralCA),
        }
      : undefined,

    optics: data.optics
      ? {
          removeChromaticAberration: Boolean(
            data.optics.removeChromaticAberration
          ),
          vignetteAmount: Number(data.optics.vignetteAmount) || 0,
          vignetteMidpoint: Number(data.optics.vignetteMidpoint) || 0,
        }
      : undefined,

    transform: data.transform
      ? {
          perspectiveVertical: Number(data.transform.perspectiveVertical) || 0,
          perspectiveHorizontal:
            Number(data.transform.perspectiveHorizontal) || 0,
          perspectiveRotate: Number(data.transform.perspectiveRotate) || 0,
          perspectiveScale: Number(data.transform.perspectiveScale) || 0,
          perspectiveAspect: Number(data.transform.perspectiveAspect) || 0,
          autoPerspective: Boolean(data.transform.autoPerspective),
        }
      : undefined,

    effects: data.effects
      ? {
          postCropVignetteAmount:
            Number(data.effects.postCropVignetteAmount) || 0,
          postCropVignetteMidpoint:
            Number(data.effects.postCropVignetteMidpoint) || 0,
          postCropVignetteFeather:
            Number(data.effects.postCropVignetteFeather) || 0,
          postCropVignetteRoundness:
            Number(data.effects.postCropVignetteRoundness) || 0,
          postCropVignetteStyle:
            data.effects.postCropVignetteStyle || "Highlight Priority",
          grainAmount: Number(data.effects.grainAmount) || 0,
          grainSize: Number(data.effects.grainSize) || 0,
          grainFrequency: Number(data.effects.grainFrequency) || 0,
        }
      : undefined,

    calibration: data.calibration
      ? {
          cameraCalibrationBluePrimaryHue:
            Number(data.calibration.cameraCalibrationBluePrimaryHue) || 0,
          cameraCalibrationBluePrimarySaturation:
            Number(data.calibration.cameraCalibrationBluePrimarySaturation) ||
            0,
          cameraCalibrationGreenPrimaryHue:
            Number(data.calibration.cameraCalibrationGreenPrimaryHue) || 0,
          cameraCalibrationGreenPrimarySaturation:
            Number(data.calibration.cameraCalibrationGreenPrimarySaturation) ||
            0,
          cameraCalibrationRedPrimaryHue:
            Number(data.calibration.cameraCalibrationRedPrimaryHue) || 0,
          cameraCalibrationRedPrimarySaturation:
            Number(data.calibration.cameraCalibrationRedPrimarySaturation) || 0,
          cameraCalibrationShadowTint:
            Number(data.calibration.cameraCalibrationShadowTint) || 0,
          cameraCalibrationVersion:
            data.calibration.cameraCalibrationVersion || undefined,
        }
      : undefined,

    crop: data.crop
      ? {
          cropTop: Number(data.crop.cropTop) || 0,
          cropLeft: Number(data.crop.cropLeft) || 0,
          cropBottom: Number(data.crop.cropBottom) || 0,
          cropRight: Number(data.crop.cropRight) || 0,
          cropAngle: Number(data.crop.cropAngle) || 0,
          cropConstrainToWarp: Boolean(data.crop.cropConstrainToWarp),
        }
      : undefined,
    orientation: data.orientation || "0",

    metadata: data.metadata
      ? {
          rating: Number(data.metadata.rating) || 0,
          label: data.metadata.label || undefined,
          title: data.metadata.title || undefined,
          creator: data.metadata.creator || undefined,
          dateCreated: data.metadata.dateCreated
            ? new Date(data.metadata.dateCreated)
            : undefined,
        }
      : undefined,

    hasSettings: Boolean(data.hasSettings),
    rawFileName: data.rawFileName || undefined,
    snapshot: data.snapshot || undefined,
  };
};

module.exports = {
  formatToneCurvePoints,
  cleanSettings,
  cleanToneCurve,
  cleanComprehensiveSettings,
};
