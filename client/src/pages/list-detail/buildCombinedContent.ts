import { GridContentData } from "../../components/ui/content-grid-data";

type ContentTypeFilter = "all" | "presets" | "films";

interface CombinedPresetItem {
  type: "preset";
  data: GridContentData;
}

interface CombinedFilmItem {
  type: "film";
  data: GridContentData;
}

export type CombinedContentItem = CombinedPresetItem | CombinedFilmItem;

export interface UserListDetail {
  id: string;
  name: string;
  description?: string | null;
  isPublic?: boolean | null;
  owner: { id: string; username: string };
  presets: Array<GridContentData & { id: string }>;
  filmSims: Array<GridContentData & { id: string }>;
}

export interface GetListData {
  getUserList?: UserListDetail | null;
}

const PLACEHOLDER_IMAGE =
  "https://placehold.co/400x200/2a2a2a/ffffff?text=Loading...";

export function buildCombinedContent(
  list: UserListDetail | null | undefined,
  contentType: ContentTypeFilter,
  allPresets: GridContentData[],
  allFilmSims: GridContentData[]
): CombinedContentItem[] {
  const presetsMap = indexById(allPresets);
  const filmSimsMap = indexById(allFilmSims);

  const presetItems: CombinedPresetItem[] =
    contentType === "all" || contentType === "presets"
      ? (list?.presets ?? []).map((preset) =>
          buildPresetItem(preset, presetsMap)
        )
      : [];

  const filmItems: CombinedFilmItem[] =
    contentType === "all" || contentType === "films"
      ? (list?.filmSims ?? []).map((filmSim) =>
          buildFilmItem(filmSim, filmSimsMap)
        )
      : [];

  return [...presetItems, ...filmItems];
}

function buildPresetItem(
  preset: GridContentData & { id: string },
  presetsMap: Map<string, GridContentData>
): CombinedPresetItem {
  const fullPreset = presetsMap.get(preset.id);
  return {
    type: "preset",
    data: fullPreset || {
      ...preset,
      afterImage: {
        url: getImageUrl(preset.afterImage) || PLACEHOLDER_IMAGE,
      },
      tags: [],
      creator: { username: "Unknown" },
    },
  };
}

function buildFilmItem(
  filmSim: GridContentData & { id: string },
  filmSimsMap: Map<string, GridContentData>
): CombinedFilmItem {
  const fullFilmSim = filmSimsMap.get(filmSim.id);
  if (fullFilmSim) {
    return {
      type: "film",
      data: {
        ...fullFilmSim,
        title: fullFilmSim.name,
        thumbnail: fullFilmSim.sampleImages?.[0]?.url ?? undefined,
        tags: fullFilmSim.tags || [],
        creator: fullFilmSim.creator || { username: "Unknown" },
      },
    };
  }
  return {
    type: "film",
    data: {
      ...filmSim,
      title: filmSim.name,
      thumbnail: filmSim?.sampleImages?.[0]?.url || PLACEHOLDER_IMAGE,
      tags: [],
      creator: { username: "Unknown" },
    },
  };
}

function indexById(items: GridContentData[]) {
  const indexedItems = new Map<string, GridContentData>();
  items.forEach((item) => {
    if (item.id) indexedItems.set(item.id, item);
  });
  return indexedItems;
}

function getImageUrl(image: GridContentData["afterImage"]) {
  if (typeof image === "string") return image;
  return image?.url;
}
