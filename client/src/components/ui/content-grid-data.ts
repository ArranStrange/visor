import type { FilmSimFilterInput, PresetFilterInput } from "@/types/graphql";
import type { RecipeCompatibilitySettings } from "@/features/compatibility";

export type GridContentType = "all" | "presets" | "films";

interface GridImage {
  url?: string | null;
}

interface GridTag {
  id?: string;
  displayName: string;
}

interface GridCreator {
  id?: string;
  username: string;
  avatar?: string;
}

export interface GridContentData {
  [key: string]: unknown;
  id?: string;
  title?: string;
  name?: string;
  slug?: string;
  afterImage?: string | GridImage | null;
  beforeImage?: string | GridImage | null;
  sampleImages?: GridImage[];
  thumbnail?: string;
  tags?: GridTag[];
  creator?: GridCreator | null;
  featured?: boolean;
  /** Film sims only: the inputs to the compatibility verdict on the card. */
  compatibleSensors?: string[] | null;
  settings?: RecipeCompatibilitySettings | null;
}

export interface GridContentItem {
  type: "preset" | "film" | "buymeacoffee";
  data: GridContentData;
}

export interface PaginatedPresetsData {
  listPresets: {
    presets: GridContentData[];
    hasNextPage: boolean;
    currentPage: number;
  };
}

export interface PaginatedFilmSimsData {
  listFilmSims: {
    filmSims: GridContentData[];
    hasNextPage: boolean;
    currentPage: number;
  };
}

export interface PaginatedListVariables {
  page: number;
  limit: number;
  where?: PresetFilterInput | FilmSimFilterInput;
}

interface BuildGridContentOptions {
  contentType: GridContentType;
  customData?: readonly unknown[];
  presetData?: PaginatedPresetsData;
  filmSimData?: PaginatedFilmSimsData;
  searchQuery?: string;
}

const ITEMS_PER_PAGE = 20;

export function buildGridContent({
  contentType,
  customData,
  presetData,
  filmSimData,
  searchQuery,
}: BuildGridContentOptions): GridContentItem[] {
  if (customData !== undefined) {
    return customData.map(shapeCustomItem);
  }

  const presets = (presetData?.listPresets.presets ?? [])
    .filter(hasCreator)
    .map(shapePreset);
  const filmSims = (filmSimData?.listFilmSims.filmSims ?? [])
    .filter(hasCreator)
    .map(shapeFilmSim);
  const content = combineByFetchedPage(presets, filmSims, contentType);

  if (content.length) {
    content.unshift({
      type: "buymeacoffee",
      data: { id: "buymeacoffee", title: "Buy Me a Coffee" },
    });
  }

  return filterBySearchQuery(content, searchQuery);
}

function hasCreator(item: GridContentData) {
  return Boolean(item?.creator);
}

function shapePreset(data: GridContentData): GridContentItem {
  return {
    type: "preset",
    data: { ...data, tags: data.tags ?? [] },
  };
}

function shapeFilmSim(data: GridContentData): GridContentItem {
  return {
    type: "film",
    data: {
      ...data,
      title: data.name,
      thumbnail: data.sampleImages?.[0]?.url ?? "",
      tags: data.tags ?? [],
    },
  };
}

function combineByFetchedPage(
  presets: GridContentItem[],
  filmSims: GridContentItem[],
  contentType: GridContentType
) {
  if (contentType === "presets") return presets;
  if (contentType === "films") return filmSims;

  const content: GridContentItem[] = [];
  const itemCount = Math.max(presets.length, filmSims.length);

  for (let offset = 0; offset < itemCount; offset += ITEMS_PER_PAGE) {
    content.push(...presets.slice(offset, offset + ITEMS_PER_PAGE));
    content.push(...filmSims.slice(offset, offset + ITEMS_PER_PAGE));
  }

  return content;
}

function filterBySearchQuery(content: GridContentItem[], searchQuery?: string) {
  if (!searchQuery) return content;
  const normalizedQuery = searchQuery.toLowerCase();
  return content.filter((item) =>
    item.data.title?.toLowerCase().includes(normalizedQuery)
  );
}

function shapeCustomItem(item: unknown): GridContentItem {
  if (isGridContentItem(item)) return item;
  return { type: "preset", data: isRecord(item) ? item : {} };
}

function isGridContentItem(item: unknown): item is GridContentItem {
  if (!isRecord(item) || !isRecord(item.data)) return false;
  return ["preset", "film", "buymeacoffee"].includes(String(item.type));
}

function isRecord(value: unknown): value is GridContentData {
  return typeof value === "object" && value !== null;
}
