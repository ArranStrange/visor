import type { FilmSimSettings } from "@/features/film-sims/types/filmSim";

// A film sim as populated onto a loadout slot. settings carries the full
// in-camera payload so the slot detail screen renders without a second
// fetch; null means the slot is empty or the recipe was deleted.
export interface LoadoutSlotFilmSim {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string | null;
  compatibleSensors?: string[];
  settings?: Partial<FilmSimSettings> | null;
  sampleImages?: { id: string; url: string }[];
}

export interface LoadoutSlot {
  index: number;
  filmSim: LoadoutSlotFilmSim | null;
  /** Name snapshot — survives recipe deletion. */
  filmSimName: string | null;
  note: string | null;
}

export interface Loadout {
  id: string;
  name: string;
  camera: string;
  cameraKey: string;
  customBanks: number;
  slots: LoadoutSlot[];
  isActive: boolean;
  isStale: boolean;
  keyedInAt: string | null;
  slotsChangedAt: string | null;
}

export interface LoadoutSlotInput {
  index: number;
  filmSimId?: string | null;
  note?: string | null;
}
