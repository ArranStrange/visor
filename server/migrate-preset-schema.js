const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Preset = require("./models/Preset");

async function migratePresetSchema() {
  try {
    console.log("Starting preset schema migration...");

    // Get all presets
    const presets = await Preset.find({});
    console.log(`Found ${presets.length} presets to migrate`);

    let updatedCount = 0;

    for (const preset of presets) {
      const updateData = {};

      // Add new fields with default values if they don't exist
      if (preset.cameraProfileDigest === undefined) {
        updateData.cameraProfileDigest = null;
      }
      if (preset.profileName === undefined) {
        updateData.profileName = null;
      }
      if (preset.lookTableName === undefined) {
        updateData.lookTableName = null;
      }

      // Color Grading
      if (!preset.colorGrading) {
        updateData.colorGrading = {
          shadowHue: 0,
          shadowSat: 0,
          midtoneHue: 0,
          midtoneSat: 0,
          highlightHue: 0,
          highlightSat: 0,
          blending: 0,
          globalHue: 0,
          globalSat: 0,
          perceptual: false,
        };
      }

      // Lens Corrections
      if (!preset.lensCorrections) {
        updateData.lensCorrections = {
          enableLensProfileCorrections: false,
          lensProfileName: null,
          lensManualDistortionAmount: 0,
          perspectiveUpright: "Off",
          autoLateralCA: false,
        };
      }

      // Optics
      if (!preset.optics) {
        updateData.optics = {
          removeChromaticAberration: false,
          vignetteAmount: 0,
          vignetteMidpoint: 0,
        };
      }

      // Transform
      if (!preset.transform) {
        updateData.transform = {
          perspectiveVertical: 0,
          perspectiveHorizontal: 0,
          perspectiveRotate: 0,
          perspectiveScale: 0,
          perspectiveAspect: 0,
          autoPerspective: false,
        };
      }

      // Effects
      if (!preset.effects) {
        updateData.effects = {
          postCropVignetteAmount: 0,
          postCropVignetteMidpoint: 0,
          postCropVignetteFeather: 0,
          postCropVignetteRoundness: 0,
          postCropVignetteStyle: "Highlight Priority",
          grainAmount: 0,
          grainSize: 0,
          grainFrequency: 0,
        };
      }

      // Calibration
      if (!preset.calibration) {
        updateData.calibration = {
          cameraCalibrationBluePrimaryHue: 0,
          cameraCalibrationBluePrimarySaturation: 0,
          cameraCalibrationGreenPrimaryHue: 0,
          cameraCalibrationGreenPrimarySaturation: 0,
          cameraCalibrationRedPrimaryHue: 0,
          cameraCalibrationRedPrimarySaturation: 0,
          cameraCalibrationShadowTint: 0,
          cameraCalibrationVersion: null,
        };
      }

      // Crop & Orientation
      if (!preset.crop) {
        updateData.crop = {
          cropTop: 0,
          cropLeft: 0,
          cropBottom: 0,
          cropRight: 0,
          cropAngle: 0,
          cropConstrainToWarp: false,
        };
      }
      if (preset.orientation === undefined) {
        updateData.orientation = "0";
      }

      // Metadata
      if (!preset.metadata) {
        updateData.metadata = {
          rating: 0,
          label: null,
          title: null,
          creator: null,
          dateCreated: null,
        };
      }

      // Other
      if (preset.hasSettings === undefined) {
        updateData.hasSettings = false;
      }
      if (preset.rawFileName === undefined) {
        updateData.rawFileName = null;
      }
      if (preset.snapshot === undefined) {
        updateData.snapshot = null;
      }

      // Update settings object with new fields if needed
      if (preset.settings) {
        const settingsUpdate = {};

        // Add texture if missing
        if (preset.settings.texture === undefined) {
          settingsUpdate["settings.texture"] = 0;
        }

        // Update grain settings
        if (preset.settings.grain) {
          if (preset.settings.grain.frequency === undefined) {
            settingsUpdate["settings.grain.frequency"] = 0;
          }
          if (preset.settings.grain.roughness === undefined) {
            settingsUpdate["settings.grain.roughness"] = 0;
          }
        }

        // Update vignette settings
        if (preset.settings.vignette) {
          if (preset.settings.vignette.midpoint === undefined) {
            settingsUpdate["settings.vignette.midpoint"] = 0;
          }
          if (preset.settings.vignette.feather === undefined) {
            settingsUpdate["settings.vignette.feather"] = 0;
          }
          if (preset.settings.vignette.roundness === undefined) {
            settingsUpdate["settings.vignette.roundness"] = 0;
          }
          if (preset.settings.vignette.style === undefined) {
            settingsUpdate["settings.vignette.style"] = "Highlight Priority";
          }
        }

        // Update color adjustments
        if (preset.settings.colorAdjustments) {
          const colorChannels = [
            "red",
            "orange",
            "yellow",
            "green",
            "aqua",
            "blue",
            "purple",
            "magenta",
          ];
          colorChannels.forEach((channel) => {
            if (preset.settings.colorAdjustments[channel]) {
              if (preset.settings.colorAdjustments[channel].hue === undefined) {
                settingsUpdate[`settings.colorAdjustments.${channel}.hue`] = 0;
              }
              if (
                preset.settings.colorAdjustments[channel].luminance ===
                undefined
              ) {
                settingsUpdate[
                  `settings.colorAdjustments.${channel}.luminance`
                ] = 0;
              }
            }
          });
        }

        // Update noise reduction
        if (preset.settings.noiseReduction) {
          if (preset.settings.noiseReduction.colorDetail === undefined) {
            settingsUpdate["settings.noiseReduction.colorDetail"] = 0;
          }
          if (preset.settings.noiseReduction.colorSmoothness === undefined) {
            settingsUpdate["settings.noiseReduction.colorSmoothness"] = 0;
          }
        }

        // Add new detail fields
        const detailFields = [
          "sharpenRadius",
          "sharpenDetail",
          "sharpenEdgeMasking",
          "luminanceSmoothing",
          "luminanceDetail",
          "luminanceContrast",
        ];

        detailFields.forEach((field) => {
          if (preset.settings[field] === undefined) {
            settingsUpdate[`settings.${field}`] = 0;
          }
        });

        Object.assign(updateData, settingsUpdate);
      }

      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        await Preset.findByIdAndUpdate(preset._id, { $set: updateData });
        updatedCount++;
        console.log(`Updated preset: ${preset.title} (${preset._id})`);
      }
    }

    console.log(`Migration completed! Updated ${updatedCount} presets.`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    mongoose.connection.close();
  }
}

// Run migration
migratePresetSchema();
