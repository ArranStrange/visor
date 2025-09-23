import { WhiteBalanceShift } from "../components/settings/WhiteBalanceGrid";

export interface FilmSimSettings {
  dynamicRange: number | null;
  filmSimulation: string;
  whiteBalance: string;
  wbShift: WhiteBalanceShift;
  color: number;
  sharpness: number;
  highlight: number;
  shadow: number;
  noiseReduction: number;
  grainEffect: string;
  clarity: number;
  colorChromeEffect: string;
  colorChromeFxBlue: string;
}

export interface SampleImageInput {
  publicId: string;
  url: string;
}

export interface FilmSimFormState {
  title: string;
  description: string;
  tags: string[];
  tagInput: string;
  sampleImages: File[];
  uploadedImageUrls: SampleImageInput[];
  notes: string;
  settings: FilmSimSettings;
}

export type FilmSimFormAction =
  | { type: "SET_FIELD"; field: keyof FilmSimFormState; value: any }
  | { type: "SET_SETTINGS"; settings: Partial<FilmSimSettings> }
  | { type: "ADD_TAG"; tag: string }
  | { type: "REMOVE_TAG"; tag: string }
  | { type: "SET_TAG_INPUT"; value: string }
  | { type: "ADD_IMAGES"; files: File[]; urls: SampleImageInput[] }
  | { type: "REMOVE_IMAGE"; index: number }
  | { type: "RESET_FORM" };
