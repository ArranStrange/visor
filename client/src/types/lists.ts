import type { FilmSimSummary, PresetSummary } from "./graphql";

export interface UserList {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  presets: PresetSummary[];
  filmSims: FilmSimSummary[];
  collaborators?: string[];
}

export type ListType = "favourite" | "custom";
