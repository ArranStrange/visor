import { PresetData } from "@/features/presets/utils/xmp-compiler/types";
import { convertToXMPValue } from "@/features/presets/utils/xmp-compiler/xmp-value";

export const buildBasicAttributes = (preset: PresetData): string => {
  const settings = preset.settings;

  return `crs:Version="${preset.version || "15.0"}"
      crs:ProcessVersion="${preset.processVersion || "15.0"}"
      crs:WhiteBalance="${preset.whiteBalance || "Custom"}"
      crs:Temperature="${convertToXMPValue(settings.temp)}"
      crs:Tint="${convertToXMPValue(settings.tint)}"
      crs:Exposure2012="${convertToXMPValue(settings.exposure)}"
      crs:Contrast2012="${convertToXMPValue(settings.contrast)}"
      crs:Highlights2012="${convertToXMPValue(settings.highlights)}"
      crs:Shadows2012="${convertToXMPValue(settings.shadows)}"
      crs:Whites2012="${convertToXMPValue(settings.whites)}"
      crs:Blacks2012="${convertToXMPValue(settings.blacks)}"
      crs:Clarity2012="${convertToXMPValue(settings.clarity)}"
      crs:Dehaze="${convertToXMPValue(settings.dehaze)}"
      crs:Texture="${convertToXMPValue(settings.texture)}"
      crs:Vibrance="${convertToXMPValue(settings.vibrance)}"
      crs:Saturation="${convertToXMPValue(settings.saturation)}"
      crs:Sharpness="${convertToXMPValue(settings.sharpening)}"
      crs:SharpenRadius="${convertToXMPValue(settings.sharpenRadius)}"
      crs:SharpenDetail="${convertToXMPValue(settings.sharpenDetail)}"
      crs:SharpenEdgeMasking="${convertToXMPValue(settings.sharpenEdgeMasking)}"
      crs:LuminanceSmoothing="${convertToXMPValue(settings.luminanceSmoothing)}"
      crs:LuminanceDetail="${convertToXMPValue(settings.luminanceDetail)}"
      crs:LuminanceContrast="${convertToXMPValue(settings.luminanceContrast)}"
      crs:ColorNoiseReduction="${convertToXMPValue(
        settings.noiseReduction?.color
      )}"
      crs:ColorNoiseReductionDetail="${convertToXMPValue(
        settings.noiseReduction?.detail
      )}"
      crs:ColorNoiseReductionSmoothness="${convertToXMPValue(
        settings.noiseReduction?.colorSmoothness
      )}"
      crs:GrainAmount="${convertToXMPValue(settings.grain?.amount)}"
      crs:GrainSize="${convertToXMPValue(settings.grain?.size)}"
      crs:GrainFrequency="${convertToXMPValue(settings.grain?.roughness)}"
      crs:CameraProfile="${preset.cameraProfile || "Adobe Standard"}"
      crs:ProfileName="${preset.profileName || "Adobe Standard"}"
      crs:HasSettings="True"
      crs:RawFileName=""
      crs:Snapshot=""
      crs:Creator="${preset.creator || "VISOR"}"
      crs:DateCreated="${preset.dateCreated || new Date().toISOString()}"
      crs:Title="${preset.title}"
      crs:Description="${preset.description || ""}"`;
};
