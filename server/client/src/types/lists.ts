export interface Preset {
  id: string;
  title: string;
  slug: string;
}

export interface FilmSim {
  id: string;
  name: string;
  slug: string;
}

export interface UserList {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  presets: Preset[];
  filmSims: FilmSim[];
  collaborators?: string[];
}

export type ListType = "favourite" | "custom";
